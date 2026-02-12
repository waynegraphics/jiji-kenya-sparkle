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
    const now = new Date().toISOString();
    let results: Record<string, number> = {};

    // 1. Expire active listings with passed expires_at
    const { data: expiredListings, error: fetchError } = await supabase
      .from("base_listings")
      .select("id, user_id, title")
      .eq("status", "active")
      .not("expires_at", "is", null)
      .lt("expires_at", now);

    if (fetchError) throw fetchError;

    if (expiredListings && expiredListings.length > 0) {
      const expiredIds = expiredListings.map((l) => l.id);
      await supabase.from("base_listings").update({ status: "draft" }).in("id", expiredIds);

      const notifications = expiredListings.map((listing) => ({
        user_id: listing.user_id,
        type: "listing_expired",
        title: "Listing Expired",
        message: `Your listing "${listing.title}" has expired and been moved to drafts.`,
        related_id: listing.id,
        related_type: "listing",
      }));
      await supabase.from("notifications").insert(notifications);
      results.expired_listings = expiredIds.length;
    }

    // 2. Expire subscriptions
    const { data: expiredSubs } = await supabase
      .from("seller_subscriptions")
      .select("id, user_id")
      .eq("status", "active")
      .not("expires_at", "is", null)
      .lt("expires_at", now);

    if (expiredSubs && expiredSubs.length > 0) {
      const subIds = expiredSubs.map((s) => s.id);
      await supabase.from("seller_subscriptions").update({ status: "expired" }).in("id", subIds);

      // Expire all active listings for users with expired subscriptions
      for (const sub of expiredSubs) {
        const { data: userListings } = await supabase
          .from("base_listings")
          .select("id, title")
          .eq("user_id", sub.user_id)
          .eq("status", "active");

        if (userListings && userListings.length > 0) {
          await supabase.from("base_listings").update({ status: "draft" }).in("id", userListings.map(l => l.id));
          const notifs = userListings.map(l => ({
            user_id: sub.user_id,
            type: "listing_expired",
            title: "Listing Expired",
            message: `Your listing "${l.title}" expired because your subscription ended.`,
            related_id: l.id,
            related_type: "listing",
          }));
          await supabase.from("notifications").insert(notifs);
        }

        await supabase.from("notifications").insert({
          user_id: sub.user_id,
          type: "subscription_expired",
          title: "Subscription Expired",
          message: "Your subscription has expired. Renew to keep your listings active.",
          related_id: sub.id,
          related_type: "subscription",
        });
      }
      results.expired_subscriptions = expiredSubs.length;
    }

    // 3. Revert expired tiers to Free (tier_expires_at passed)
    const { data: expiredTierListings } = await supabase
      .from("base_listings")
      .select("id")
      .not("tier_id", "is", null)
      .not("tier_expires_at", "is", null)
      .lt("tier_expires_at", now)
      .gt("tier_priority", 0);

    if (expiredTierListings && expiredTierListings.length > 0) {
      await supabase.from("base_listings")
        .update({ tier_id: null, tier_priority: 0, tier_expires_at: null })
        .in("id", expiredTierListings.map(l => l.id));
      results.expired_tiers = expiredTierListings.length;
    }

    // 4. Remove expired featured status
    const { data: expiredFeatured } = await supabase
      .from("base_listings")
      .select("id")
      .eq("is_featured", true)
      .not("featured_until", "is", null)
      .lt("featured_until", now);

    if (expiredFeatured && expiredFeatured.length > 0) {
      await supabase.from("base_listings")
        .update({ is_featured: false, featured_until: null })
        .in("id", expiredFeatured.map(l => l.id));
      results.expired_featured = expiredFeatured.length;
    }

    // 5. Remove expired promotions
    const { data: expiredPromos } = await supabase
      .from("base_listings")
      .select("id")
      .not("promotion_type_id", "is", null)
      .not("promotion_expires_at", "is", null)
      .lt("promotion_expires_at", now);

    if (expiredPromos && expiredPromos.length > 0) {
      await supabase.from("base_listings")
        .update({ promotion_type_id: null, promotion_expires_at: null })
        .in("id", expiredPromos.map(l => l.id));

      // Also update listing_promotions table
      await supabase.from("listing_promotions")
        .update({ status: "expired" })
        .lt("expires_at", now)
        .eq("status", "active");

      results.expired_promotions = expiredPromos.length;
    }

    // 6. Expire listing tier purchases
    await supabase.from("listing_tier_purchases")
      .update({ status: "expired" })
      .eq("status", "active")
      .not("expires_at", "is", null)
      .lt("expires_at", now);

    return new Response(
      JSON.stringify({ message: "Auto-expiry completed", results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
