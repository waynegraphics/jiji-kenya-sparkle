import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SubscriptionLimits {
  hasActiveSubscription: boolean;
  maxAds: number;
  adsUsed: number;
  adsRemaining: number;
  canPostAd: boolean;
  allowedCategories: string[] | null;
  analyticsAccess: boolean;
  subscriptionName: string | null;
  expiresAt: string | null;
}

export const useSubscriptionLimits = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["subscription-limits", user?.id],
    queryFn: async (): Promise<SubscriptionLimits> => {
      if (!user) {
        return {
          hasActiveSubscription: false,
          maxAds: 0,
          adsUsed: 0,
          adsRemaining: 0,
          canPostAd: false,
          allowedCategories: null,
          analyticsAccess: false,
          subscriptionName: null,
          expiresAt: null,
        };
      }

      // Fetch active subscription with package details
      const { data: subscription, error: subError } = await supabase
        .from("seller_subscriptions")
        .select("*, package:subscription_packages(*)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .eq("payment_status", "completed")
        .single();

      if (subError && subError.code !== "PGRST116") {
        console.error("Error fetching subscription:", subError);
      }

      if (!subscription || !subscription.package) {
        return {
          hasActiveSubscription: false,
          maxAds: 0,
          adsUsed: 0,
          adsRemaining: 0,
          canPostAd: false,
          allowedCategories: null,
          analyticsAccess: false,
          subscriptionName: null,
          expiresAt: null,
        };
      }

      const pkg = subscription.package;
      const adsRemaining = Math.max(0, pkg.max_ads - subscription.ads_used);

      return {
        hasActiveSubscription: true,
        maxAds: pkg.max_ads,
        adsUsed: subscription.ads_used,
        adsRemaining,
        canPostAd: adsRemaining > 0,
        allowedCategories: pkg.allowed_categories,
        analyticsAccess: pkg.analytics_access,
        subscriptionName: pkg.name,
        expiresAt: subscription.expires_at,
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

// Hook to increment ads_used after successful ad creation
export const useIncrementAdsUsed = () => {
  const { user } = useAuth();

  const incrementAdsUsed = async () => {
    if (!user) return;

    const { error } = await supabase.rpc("increment_ads_used", {
      p_user_id: user.id,
    });

    if (error) {
      console.error("Error incrementing ads used:", error);
      // Fallback: manual increment
      const { data: sub } = await supabase
        .from("seller_subscriptions")
        .select("id, ads_used")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (sub) {
        await supabase
          .from("seller_subscriptions")
          .update({ ads_used: sub.ads_used + 1 })
          .eq("id", sub.id);
      }
    }
  };

  return incrementAdsUsed;
};
