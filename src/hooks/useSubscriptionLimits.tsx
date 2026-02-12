import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTeamMember } from "@/hooks/useTeamMember";

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
  isAdminBypass: boolean;
}

export const useSubscriptionLimits = () => {
  const { user } = useAuth();
  const { data: teamMember } = useTeamMember();

  return useQuery({
    queryKey: ["subscription-limits", user?.id, teamMember?.designation],
    queryFn: async (): Promise<SubscriptionLimits> => {
      if (!user) {
        return {
          hasActiveSubscription: false,
          maxAds: 0,
          adsUsed: 0,
          adsRemaining: 0,
          canPostAd: false,
          allowedCategories: null,
          analyticsAccess: true,
          subscriptionName: null,
          expiresAt: null,
          isAdminBypass: false,
        };
      }

      // Check if user is admin or super_admin - they bypass all limits
      const isAdminOrSuperAdmin = teamMember && 
        (teamMember.designation === "super_admin" || teamMember.designation === "admin");

      if (isAdminOrSuperAdmin) {
        return {
          hasActiveSubscription: true,
          maxAds: Infinity,
          adsUsed: 0,
          adsRemaining: Infinity,
          canPostAd: true,
          allowedCategories: null, // all categories
          analyticsAccess: true,
          subscriptionName: "Admin (Unlimited)",
          expiresAt: null,
          isAdminBypass: true,
        };
      }

      // Also check via the is_admin RPC for users with admin role but maybe no team_member entry
      const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: user.id });
      if (isAdmin) {
        return {
          hasActiveSubscription: true,
          maxAds: Infinity,
          adsUsed: 0,
          adsRemaining: Infinity,
          canPostAd: true,
          allowedCategories: null,
          analyticsAccess: true,
          subscriptionName: "Admin (Unlimited)",
          expiresAt: null,
          isAdminBypass: true,
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
        // Auto-assign free Starter Plan if one exists
        const { data: starterPkg } = await supabase
          .from("subscription_packages")
          .select("*")
          .eq("price", 0)
          .eq("is_active", true)
          .order("display_order")
          .limit(1)
          .maybeSingle();

        if (starterPkg) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + starterPkg.duration_days);

          const { data: newSub, error: insertError } = await supabase
            .from("seller_subscriptions")
            .insert({
              user_id: user.id,
              package_id: starterPkg.id,
              status: "active",
              payment_status: "completed",
              starts_at: new Date().toISOString(),
              expires_at: expiresAt.toISOString(),
            })
            .select("*, package:subscription_packages(*)")
            .single();

          if (!insertError && newSub && newSub.package) {
            const pkg = newSub.package;
            return {
              hasActiveSubscription: true,
              maxAds: pkg.max_ads,
              adsUsed: 0,
              adsRemaining: pkg.max_ads,
              canPostAd: true,
              allowedCategories: pkg.allowed_categories,
              analyticsAccess: true,
              subscriptionName: pkg.name,
              expiresAt: newSub.expires_at,
              isAdminBypass: false,
            };
          }
        }

        return {
          hasActiveSubscription: false,
          maxAds: 0,
          adsUsed: 0,
          adsRemaining: 0,
          canPostAd: false,
          allowedCategories: null,
          analyticsAccess: true,
          subscriptionName: null,
          expiresAt: null,
          isAdminBypass: false,
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
        analyticsAccess: true,
        subscriptionName: pkg.name,
        expiresAt: subscription.expires_at,
        isAdminBypass: false,
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
};

// Hook to increment ads_used after successful ad creation
export const useIncrementAdsUsed = () => {
  const { user } = useAuth();
  const { data: limits } = useSubscriptionLimits();

  const incrementAdsUsed = async () => {
    if (!user) return;
    // Don't increment for admin bypass
    if (limits?.isAdminBypass) return;

    const { error } = await supabase.rpc("increment_ads_used", { p_user_id: user.id });
    if (error) {
      console.error("Error incrementing ads used:", error);
    }
  };

  return incrementAdsUsed;
};
