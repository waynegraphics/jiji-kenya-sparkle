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

    const { user_id, subscription_id, package_id } = await req.json();

    if (!user_id || !subscription_id) {
      return new Response(
        JSON.stringify({ error: "user_id and subscription_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the package details for duration
    const { data: pkg, error: pkgError } = await supabase
      .from("subscription_packages")
      .select("duration_days, max_ads")
      .eq("id", package_id)
      .single();

    if (pkgError || !pkg) {
      return new Response(
        JSON.stringify({ error: "Package not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + pkg.duration_days * 24 * 60 * 60 * 1000);

    // Activate the subscription
    const { error: subError } = await supabase
      .from("seller_subscriptions")
      .update({
        status: "active",
        payment_status: "completed",
        starts_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        ads_used: 0,
      })
      .eq("id", subscription_id);

    if (subError) throw subError;

    // Reactivate all draft listings for this user (up to max_ads)
    const { data: draftListings } = await supabase
      .from("base_listings")
      .select("id")
      .eq("user_id", user_id)
      .eq("status", "draft")
      .order("updated_at", { ascending: false })
      .limit(pkg.max_ads);

    if (draftListings && draftListings.length > 0) {
      const ids = draftListings.map((l) => l.id);
      await supabase
        .from("base_listings")
        .update({
          status: "active",
          expires_at: expiresAt.toISOString(),
        })
        .in("id", ids);
    }

    // Notify user
    await supabase.from("notifications").insert({
      user_id,
      type: "subscription_renewed",
      title: "Subscription Renewed! 🎉",
      message: `Your subscription has been renewed for ${pkg.duration_days} days. ${draftListings?.length || 0} listings have been reactivated.`,
      related_id: subscription_id,
      related_type: "subscription",
    });

    return new Response(
      JSON.stringify({
        message: "Subscription renewed successfully",
        reactivated_listings: draftListings?.length || 0,
        expires_at: expiresAt.toISOString(),
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
