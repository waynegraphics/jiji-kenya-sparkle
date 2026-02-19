import { useAuth } from "@/contexts/AuthContext";
import { useSellerSubscription, useSubscriptionPackages } from "@/hooks/useSubscriptions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Package, Zap, Crown, TrendingUp, BarChart3, ShoppingCart,
  Clock, CheckCircle2, AlertCircle, Megaphone, ArrowRight
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CountdownTimer } from "@/components/CountdownTimer";

const SellerSubscriptionDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: subscription, isLoading: subLoading } = useSellerSubscription(user?.id);
  const { data: packages } = useSubscriptionPackages(true);

  const { data: userCredits } = useQuery({
    queryKey: ["user-credits-summary", user?.id],
    queryFn: async () => {
      if (!user) return { bumpBalance: 0, tierSlots: 0, unusedPromos: 0 };
      const [profileRes, tierPurchasesRes, promosRes] = await Promise.all([
        supabase.from("profiles").select("bump_wallet_balance").eq("user_id", user.id).single(),
        supabase.from("listing_tier_purchases").select("id, tier_id, listing_tiers(max_ads)").eq("user_id", user.id).eq("status", "active").eq("payment_status", "completed"),
        supabase.from("listing_promotions").select("id", { count: "exact" }).eq("user_id", user.id).is("listing_id", null).eq("status", "active").eq("payment_status", "completed"),
      ]);
      // Calculate total available tier slots
      let totalSlots = 0;
      if (tierPurchasesRes.data) {
        for (const p of tierPurchasesRes.data) {
          const maxAds = (p.listing_tiers as any)?.max_ads || 1;
          const { count } = await supabase.from("base_listings").select("id", { count: "exact", head: true }).eq("tier_purchase_id", p.id);
          totalSlots += Math.max(0, maxAds - (count || 0));
        }
      }
      return {
        bumpBalance: profileRes.data?.bump_wallet_balance || 0,
        tierSlots: totalSlots,
        unusedPromos: promosRes.count || 0,
      };
    },
    enabled: !!user,
  });

  const { data: tiers = [] } = useQuery({
    queryKey: ["listing-tiers-active"],
    queryFn: async () => {
      const { data, error } = await supabase.from("listing_tiers").select("*").eq("is_active", true).order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: bumpPackages = [] } = useQuery({
    queryKey: ["bump-packages-active"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bump_packages").select("*").eq("is_active", true).order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: promotions = [] } = useQuery({
    queryKey: ["promotion-types-active"],
    queryFn: async () => {
      const { data, error } = await supabase.from("promotion_types").select("*").eq("is_active", true).order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const fmt = (p: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(p);

  if (subLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  const pkg = subscription?.package;
  const adsUsed = subscription?.ads_used || 0;
  const maxAds = pkg?.max_ads || 0;
  const adsRemaining = Math.max(0, maxAds - adsUsed);
  const adsPercentage = maxAds > 0 ? (adsUsed / maxAds) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Current Subscription</CardTitle>
              <CardDescription>Your active plan and usage</CardDescription>
            </div>
            <Link to="/pricing"><Button variant="outline" size="sm">View All Plans <ArrowRight className="h-3 w-3 ml-1" /></Button></Link>
          </div>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-6">
              <div className="rounded-lg p-4 border" style={{ backgroundColor: pkg?.bg_color || '#f8fafc', color: pkg?.text_color || '#1a1a1a' }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">{pkg?.name}</h3>
                  <Badge variant="secondary" className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Active</Badge>
                </div>
                <p className="text-sm opacity-80 mb-4">{pkg?.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><p className="opacity-60">Price</p><p className="font-semibold">{fmt(pkg?.price || 0)}</p></div>
                  <div><p className="opacity-60">Duration</p><p className="font-semibold">{pkg?.duration_days} days</p></div>
                  <div><p className="opacity-60">Analytics</p><p className="font-semibold">{pkg?.analytics_access ? 'Included' : 'Basic'}</p></div>
                  <div><p className="opacity-60">Expires</p><div className="font-semibold">
                    {subscription.expires_at ? (
                      <CountdownTimer expiresAt={subscription.expires_at} variant="compact" />
                    ) : (
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />N/A</span>
                    )}
                  </div></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Ads Usage</span>
                  <span className="text-sm text-muted-foreground">{adsUsed} / {maxAds} ads used</span>
                </div>
                <Progress value={adsPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{adsRemaining} ads remaining</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
              <p className="text-muted-foreground mb-4">Subscribe to a plan to start posting ads.</p>
              <Link to="/pricing"><Button>View Plans</Button></Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10"><Zap className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold">{userCredits?.bumpBalance || 0}</p>
              <p className="text-sm text-muted-foreground">Bump Credits</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-yellow-500/10"><Crown className="h-5 w-5 text-yellow-600" /></div>
            <div>
              <p className="text-2xl font-bold">{userCredits?.tierSlots || 0}</p>
              <p className="text-sm text-muted-foreground">Available Tier Slots</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-orange-500/10"><Megaphone className="h-5 w-5 text-orange-600" /></div>
            <div>
              <p className="text-2xl font-bold">{userCredits?.unusedPromos || 0}</p>
              <p className="text-sm text-muted-foreground">Unused Promotion Credits</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Available Tiers */}
      {tiers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Crown className="h-5 w-5 text-yellow-500" />Ad Tiers</CardTitle>
            <CardDescription>Boost individual ads with premium ranking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {tiers.map(t => (
                <div
                  key={t.id}
                  className="rounded-lg border-2 p-4 text-center hover:shadow-md transition-all"
                  style={{ borderColor: t.badge_color }}
                >
                  <Crown className="h-5 w-5 mx-auto mb-1" style={{ color: t.badge_color }} />
                  <h4 className="font-bold">{t.name}</h4>
                  <p className="text-lg font-extrabold mt-1">{t.price === 0 ? "Free" : fmt(t.price)}</p>
                  <p className="text-xs text-muted-foreground mb-3">Weight: {t.priority_weight} • Max {(t as any).max_ads || 5} ads{t.included_featured_days > 0 ? ` • ${t.included_featured_days}d featured` : ""}</p>
                  <Button size="sm" className="w-full" onClick={() => navigate(`/checkout/tier/${t.id}`)}>
                    Purchase Tier
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bump Packages */}
      {bumpPackages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-blue-500" />Bump Packages</CardTitle>
            <CardDescription>Purchase credits to push ads to the top</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-3">
              {bumpPackages.map(bp => (
                <div
                  key={bp.id}
                  className="rounded-lg border p-4 text-center hover:shadow-md transition-all"
                >
                  <Zap className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                  <h4 className="font-bold">{bp.name}</h4>
                  <p className="text-lg font-extrabold">{fmt(bp.price)}</p>
                  <p className="text-xs text-muted-foreground mb-3">{bp.credits} bumps</p>
                  <Button size="sm" className="w-full" onClick={() => navigate(`/checkout/bump/${bp.id}`)}>
                    Purchase Package
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Promotions */}
      {promotions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-orange-500" />Ad Promotions</CardTitle>
            <CardDescription>Premium placements for maximum visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {promotions.map(p => (
                <div
                  key={p.id}
                  className="rounded-lg border p-4 flex items-center gap-3 hover:shadow-md transition-all"
                >
                  <TrendingUp className="h-5 w-5 text-orange-500 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{p.name}</h4>
                    <p className="text-xs text-muted-foreground">{p.duration_days} days • Max {p.max_ads} ads</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{fmt(p.price)}</span>
                    <Button size="sm" onClick={() => navigate(`/checkout/promotion/${p.id}`)}>
                      Purchase
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center">
            <div className="flex gap-2 justify-center">
              {packages && packages.length > 0 && (
                <Button onClick={() => navigate(`/checkout/subscription/${packages[0].id}`)}>
                  <ShoppingCart className="h-4 w-4 mr-2" /> Subscribe Now
                </Button>
              )}
              <Link to="/pricing"><Button variant="outline">View Full Pricing Details <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
            </div>
      </div>
    </div>
  );
};

export default SellerSubscriptionDashboard;
