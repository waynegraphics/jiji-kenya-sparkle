import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { 
  Package, FileText, Eye, MessageSquare, Zap, Star, TrendingUp,
  Plus, ArrowRight, AlertCircle, AlertTriangle, Crown, Megaphone
} from "lucide-react";
import { CountdownTimer } from "@/components/CountdownTimer";

const SellerOverview = () => {
  const { user } = useAuth();
  const { data: limits, isLoading: limitsLoading } = useSubscriptionLimits();
  const [lowCreditWarning, setLowCreditWarning] = useState<string | null>(null);
  
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalViews: 0,
    totalMessages: 0,
    recentListings: [] as { id: string; title: string; views: number }[],
    activeTiers: 0,
    activePromotions: 0,
    unusedTierCredits: 0,
    unusedPromotionCredits: 0,
    bumpBalance: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        // Fetch all data in parallel
        const [listingsRes, messagesRes, unusedTiersRes, unusedPromosRes, profileRes] = await Promise.all([
          supabase
            .from("base_listings")
            .select("id, title, views, status, tier_id, tier_expires_at, promotion_type_id, promotion_expires_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("messages")
            .select("id", { count: "exact" })
            .eq("receiver_id", user.id),
          supabase
            .from("listing_tier_purchases")
            .select("id, tier_id, listing_tiers(max_ads)")
            .eq("user_id", user.id)
            .eq("status", "active")
            .eq("payment_status", "completed"),
          supabase
            .from("listing_promotions")
            .select("id", { count: "exact" })
            .eq("user_id", user.id)
            .is("listing_id", null)
            .eq("status", "active")
            .eq("payment_status", "completed"),
          supabase
            .from("profiles")
            .select("bump_wallet_balance")
            .eq("user_id", user.id)
            .single(),
        ]);

        const listings = listingsRes.data || [];
        const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
        const activeListings = listings.filter(l => l.status === "active").length;
        const now = new Date();
        const activeTiers = listings.filter(l => l.tier_id && l.tier_expires_at && new Date(l.tier_expires_at) > now).length;
        const activePromotions = listings.filter(l => l.promotion_type_id && l.promotion_expires_at && new Date(l.promotion_expires_at) > now).length;
        const bumpBalance = profileRes.data?.bump_wallet_balance || 0;
        // Calculate available tier slots (per-set model)
        let unusedTierCredits = 0;
        if (unusedTiersRes.data) {
          for (const p of unusedTiersRes.data) {
            const maxAds = (p.listing_tiers as any)?.max_ads || 1;
            const { count } = await supabase.from("base_listings").select("id", { count: "exact", head: true }).eq("tier_purchase_id", p.id);
            unusedTierCredits += Math.max(0, maxAds - (count || 0));
          }
        }
        const unusedPromotionCredits = unusedPromosRes.count || 0;

        setStats({
          totalListings: listings.length,
          activeListings,
          totalViews,
          totalMessages: messagesRes.count || 0,
          recentListings: listings.slice(0, 3).map(l => ({ id: l.id, title: l.title, views: l.views || 0 })),
          activeTiers,
          activePromotions,
          unusedTierCredits,
          unusedPromotionCredits,
          bumpBalance,
        });

        // Low credit warnings
        const warnings: string[] = [];
        if (bumpBalance > 0 && bumpBalance <= 2) warnings.push(`Only ${bumpBalance} bump credit${bumpBalance > 1 ? 's' : ''} left`);
        if (unusedPromotionCredits > 0 && unusedPromotionCredits <= 2) warnings.push(`Only ${unusedPromotionCredits} promotion credit${unusedPromotionCredits > 1 ? 's' : ''} left`);
        if (unusedTierCredits > 0 && unusedTierCredits <= 2) warnings.push(`Only ${unusedTierCredits} tier credit${unusedTierCredits > 1 ? 's' : ''} left`);
        if (warnings.length > 0) {
          setLowCreditWarning(warnings.join(". ") + ". Buy more to keep boosting your ads!");
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (isLoading || limitsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Low Credit Warning */}
      <Dialog open={!!lowCreditWarning} onOpenChange={() => setLowCreditWarning(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" /> Credits Running Low
            </DialogTitle>
            <DialogDescription>{lowCreditWarning}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setLowCreditWarning(null)}>Dismiss</Button>
            <Link to="/seller-dashboard/subscription">
              <Button onClick={() => setLowCreditWarning(null)}>Buy More Credits</Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Welcome Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Overview</h2>
          <p className="text-muted-foreground text-sm">Welcome back! Here's what's happening.</p>
        </div>
        <Link to="/seller-dashboard/post-ad">
          <Button className="w-full sm:w-auto"><Plus className="h-4 w-4 mr-2" />Post New Ad</Button>
        </Link>
      </div>

      {/* Subscription Status */}
      <Card className={limits?.hasActiveSubscription ? "border-primary/20 bg-primary/5" : "border-destructive/20 bg-destructive/5"}>
        <CardContent className="pt-6">
          {limits?.hasActiveSubscription ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{limits.subscriptionName}</h3>
                    <Badge className="bg-primary/20 text-primary">Active</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />{limits.adsUsed} / {limits.maxAds} ads used
                    </span>
                    {limits.expiresAt && <CountdownTimer expiresAt={limits.expiresAt} variant="compact" />}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to="/seller-dashboard/subscription"><Button variant="outline" size="sm">View Details</Button></Link>
                <Link to="/pricing"><Button size="sm">Upgrade</Button></Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">No Active Subscription</h3>
                  <p className="text-sm text-muted-foreground">Subscribe to a plan to start posting ads.</p>
                </div>
              </div>
              <Link to="/pricing"><Button>Get Started</Button></Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeListings}</div>
            {limits?.hasActiveSubscription && (
              <div className="mt-2">
                <Progress value={(limits.adsUsed / limits.maxAds) * 100} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-1">{limits.adsRemaining} slots remaining</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">Inquiries received</p>
          </CardContent>
        </Card>
      </div>

      {/* Add-ons & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />Your Credits & Boosts
            </CardTitle>
            <CardDescription>Available credits and active boosts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Bump Credits */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <div>
                    <span className="font-medium">Bump Credits</span>
                    <p className="text-xs text-muted-foreground">Push ads to the top</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={stats.bumpBalance <= 2 && stats.bumpBalance > 0 ? "destructive" : "secondary"}>{stats.bumpBalance}</Badge>
                  <Link to="/seller-dashboard/subscription">
                    <Button variant="outline" size="sm" className="h-7 text-xs px-2">Buy</Button>
                  </Link>
                </div>
              </div>

              {/* Unused Promotion Credits */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-orange-500" />
                  <div>
                    <span className="font-medium">Promotion Credits</span>
                    <p className="text-xs text-muted-foreground">{stats.unusedPromotionCredits} unused • {stats.activePromotions} active</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={stats.unusedPromotionCredits <= 2 && stats.unusedPromotionCredits > 0 ? "destructive" : "secondary"}>{stats.unusedPromotionCredits}</Badge>
                  <Link to="/seller-dashboard/subscription">
                    <Button variant="outline" size="sm" className="h-7 text-xs px-2">Buy</Button>
                  </Link>
                </div>
              </div>

              {/* Unused Tier Credits */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <div>
                    <span className="font-medium">Tier Credits</span>
                    <p className="text-xs text-muted-foreground">{stats.unusedTierCredits} unused • {stats.activeTiers} active</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={stats.unusedTierCredits <= 2 && stats.unusedTierCredits > 0 ? "destructive" : "secondary"}>{stats.unusedTierCredits}</Badge>
                  <Link to="/seller-dashboard/subscription">
                    <Button variant="outline" size="sm" className="h-7 text-xs px-2">Buy</Button>
                  </Link>
                </div>
              </div>
            </div>
            <Link to="/seller-dashboard/subscription" className="block mt-4">
              <Button variant="outline" className="w-full">
                Manage Packages & Add-ons <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Listings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />Recent Listings
            </CardTitle>
            <CardDescription>Your latest ads</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentListings.length > 0 ? (
              <div className="space-y-3">
                {stats.recentListings.map((listing) => (
                  <Link key={listing.id} to={`/listing/${listing.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                    <span className="font-medium line-clamp-1">{listing.title}</span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {listing.views || 0}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No listings yet</p>
              </div>
            )}
            <Link to="/seller-dashboard/listings" className="block mt-4">
              <Button variant="outline" className="w-full">
                View All Listings <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerOverview;
