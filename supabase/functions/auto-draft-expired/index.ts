import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Find all active listings where expires_at has passed
    const { data: expiredListings, error: fetchError } = await supabase
      .from("base_listings")
      .select("id, user_id, title")
      .eq("status", "active")
      .not("expires_at", "is", null)
      .lt("expires_at", new Date().toISOString());

    if (fetchError) throw fetchError;

    if (!expiredListings || expiredListings.length === 0) {
      return new Response(
        JSON.stringify({ message: "No expired listings found", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Move expired listings to draft
    const expiredIds = expiredListings.map((l) => l.id);
    const { error: updateError } = await supabase
      .from("base_listings")
      .update({ status: "draft" })
      .in("id", expiredIds);

    if (updateError) throw updateError;

    // 3. Notify affected users
    const notifications = expiredListings.map((listing) => ({
      user_id: listing.user_id,
      type: "listing_expired",
      title: "Listing Expired",
      message: `Your listing "${listing.title}" has expired and been moved to drafts. Renew your subscription to republish.`,
      related_id: listing.id,
      related_type: "listing",
    }));

    await supabase.from("notifications").insert(notifications);

    // 4. Also check for expired subscriptions
    const { data: expiredSubs, error: subError } = await supabase
      .from("seller_subscriptions")
      .select("id, user_id")
      .eq("status", "active")
      .not("expires_at", "is", null)
      .lt("expires_at", new Date().toISOString());

    if (!subError && expiredSubs && expiredSubs.length > 0) {
      const subIds = expiredSubs.map((s) => s.id);
      await supabase
        .from("seller_subscriptions")
        .update({ status: "expired" })
        .in("id", subIds);

      // Notify about expired subscriptions
      const subNotifications = expiredSubs.map((sub) => ({
        user_id: sub.user_id,
        type: "subscription_expired",
        title: "Subscription Expired",
        message: "Your subscription has expired. Renew to keep your listings active.",
        related_id: sub.id,
        related_type: "subscription",
      }));

      await supabase.from("notifications").insert(subNotifications);
    }

    return new Response(
      JSON.stringify({
        message: "Auto-draft completed",
        drafts: expiredIds.length,
        expiredSubscriptions: expiredSubs?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
