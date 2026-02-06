import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MpesaCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value?: string | number;
        }>;
      };
    };
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for callback
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const callback: MpesaCallback = await req.json();
    console.log("M-Pesa Callback received:", JSON.stringify(callback, null, 2));

    const { stkCallback } = callback.Body;
    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    // Find the transaction
    const { data: transaction, error: findError } = await supabase
      .from("payment_transactions")
      .select("*, subscription_id, addon_purchase_id")
      .eq("checkout_request_id", CheckoutRequestID)
      .single();

    if (findError || !transaction) {
      console.error("Transaction not found:", findError);
      return new Response(
        JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse callback metadata
    let mpesaReceiptNumber: string | null = null;
    let transactionDate: string | null = null;

    if (CallbackMetadata?.Item) {
      for (const item of CallbackMetadata.Item) {
        if (item.Name === "MpesaReceiptNumber") {
          mpesaReceiptNumber = String(item.Value);
        }
        if (item.Name === "TransactionDate") {
          // Convert to ISO format
          const dateStr = String(item.Value);
          if (dateStr.length === 14) {
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            const hour = dateStr.substring(8, 10);
            const minute = dateStr.substring(10, 12);
            const second = dateStr.substring(12, 14);
            transactionDate = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
          }
        }
      }
    }

    // Determine status based on result code
    const status = ResultCode === 0 ? "completed" : "failed";

    // Update transaction
    const { error: updateError } = await supabase
      .from("payment_transactions")
      .update({
        status,
        result_code: String(ResultCode),
        result_desc: ResultDesc,
        mpesa_receipt_number: mpesaReceiptNumber,
        transaction_date: transactionDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.id);

    if (updateError) {
      console.error("Failed to update transaction:", updateError);
    }

    // If payment successful, activate subscription or addon
    if (status === "completed") {
      if (transaction.subscription_id) {
        // Activate subscription
        const { error: subError } = await supabase
          .from("seller_subscriptions")
          .update({
            status: "active",
            payment_status: "completed",
            mpesa_receipt: mpesaReceiptNumber,
            starts_at: new Date().toISOString(),
            expires_at: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days default
            ).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", transaction.subscription_id);

        if (subError) {
          console.error("Failed to activate subscription:", subError);
        } else {
          console.log("Subscription activated:", transaction.subscription_id);
        }
      }

      if (transaction.addon_purchase_id) {
        // Activate addon purchase
        const { error: addonError } = await supabase
          .from("seller_addons")
          .update({
            status: "active",
            payment_status: "completed",
            mpesa_receipt: mpesaReceiptNumber,
            updated_at: new Date().toISOString(),
          })
          .eq("id", transaction.addon_purchase_id);

        if (addonError) {
          console.error("Failed to activate addon:", addonError);
        } else {
          console.log("Addon activated:", transaction.addon_purchase_id);
        }
      }
    }

    // Return success to M-Pesa
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Callback processing error:", error);
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
