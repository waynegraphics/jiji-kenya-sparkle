import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Phone, CreditCard, CheckCircle, XCircle, Shield } from "lucide-react";

interface RegistrationFeeCheckoutProps {
  onPaymentSuccess: () => void;
}

const RegistrationFeeCheckout = ({ onPaymentSuccess }: RegistrationFeeCheckoutProps) => {
  const { user, profile } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone || "");
  const [fee, setFee] = useState(250);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFee = async () => {
      const { data } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "seller_registration_fee")
        .maybeSingle();
      const feeValue = data ? parseInt(data.value) : 250;
      setFee(feeValue);
      // If fee is 0, auto-approve
      if (feeValue === 0) {
        onPaymentSuccess();
      }
      setLoading(false);
    };
    fetchFee();
  }, []);

  // Poll for payment status
  useEffect(() => {
    if (!transactionId || paymentStatus !== "pending") return;

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("payment_transactions")
        .select("status")
        .eq("id", transactionId)
        .single();

      if (data?.status === "completed") {
        setPaymentStatus("success");
        toast.success("Registration fee paid! You can now post listings.");
        onPaymentSuccess();
      } else if (data?.status === "failed") {
        setPaymentStatus("failed");
        toast.error("Payment failed. Please try again.");
      }
    }, 3000);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (paymentStatus === "pending") {
        setPaymentStatus("idle");
        toast.error("Payment timeout. Check your M-Pesa messages.");
      }
    }, 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [transactionId, paymentStatus, onPaymentSuccess]);

  const handlePayment = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter your M-Pesa phone number");
      return;
    }

    setIsProcessing(true);
    setPaymentStatus("pending");

    try {
      const { data, error } = await supabase.functions.invoke("mpesa-stk-push", {
        body: {
          phone_number: phoneNumber,
          amount: fee,
          account_reference: "SellerReg",
          transaction_desc: "Seller Registration Fee",
        },
      });

      if (error) throw error;

      if (data.success) {
        setTransactionId(data.transaction_id);
        toast.success("Check your phone for the M-Pesa prompt");
      } else {
        throw new Error(data.error || "Failed to initiate payment");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setPaymentStatus("failed");
      toast.error(error.message || "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <Card><CardContent className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></CardContent></Card>;
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Seller Registration Fee</CardTitle>
            <CardDescription>
              A one-time fee of <strong className="text-foreground">KES {fee.toLocaleString()}</strong> is required to activate your seller account
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {paymentStatus === "success" ? (
          <div className="text-center py-4">
            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-semibold">Payment Successful!</h3>
            <p className="text-muted-foreground text-sm">Your seller account is now active.</p>
          </div>
        ) : paymentStatus === "failed" ? (
          <div className="text-center py-4">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
            <h3 className="text-lg font-semibold">Payment Failed</h3>
            <p className="text-muted-foreground text-sm mb-4">Please try again.</p>
            <Button onClick={() => setPaymentStatus("idle")} variant="outline">Try Again</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 flex justify-between items-center">
              <span className="text-sm font-medium">Registration Fee</span>
              <span className="text-lg font-bold">KES {fee.toLocaleString()}</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-phone">M-Pesa Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reg-phone"
                  type="tel"
                  placeholder="0712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10"
                  disabled={isProcessing || paymentStatus === "pending"}
                />
              </div>
              <p className="text-xs text-muted-foreground">Format: 0712345678 or 254712345678</p>
            </div>

            <Button
              className="w-full"
              onClick={handlePayment}
              disabled={isProcessing || paymentStatus === "pending"}
            >
              {isProcessing || paymentStatus === "pending" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {paymentStatus === "pending" ? "Waiting for payment..." : "Processing..."}
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay KES {fee.toLocaleString()}
                </>
              )}
            </Button>

            {paymentStatus === "pending" && (
              <p className="text-sm text-center text-muted-foreground">
                Check your phone for the M-Pesa prompt and enter your PIN.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegistrationFeeCheckout;
