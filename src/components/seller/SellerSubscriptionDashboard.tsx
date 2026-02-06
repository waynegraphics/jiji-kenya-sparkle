import { useAuth } from "@/contexts/AuthContext";
import { 
  useSellerSubscription, 
  useSellerAddons,
  useSubscriptionPackages,
  useAddons,
  useAddonTiers
} from "@/hooks/useSubscriptions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Package, 
  Zap, 
  Star, 
  TrendingUp, 
  BarChart3, 
  ShoppingCart,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const SellerSubscriptionDashboard = () => {
  const { user } = useAuth();
  const { data: subscription, isLoading: subLoading } = useSellerSubscription(user?.id);
  const { data: sellerAddons, isLoading: addonsLoading } = useSellerAddons(user?.id);
  const { data: packages } = useSubscriptionPackages(true);
  const { data: availableAddons } = useAddons(true);
  const { data: allTiers } = useAddonTiers(undefined, true);

  const isLoading = subLoading || addonsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  const pkg = subscription?.package;
  const adsUsed = subscription?.ads_used || 0;
  const maxAds = pkg?.max_ads || 0;
  const adsRemaining = Math.max(0, maxAds - adsUsed);
  const adsPercentage = maxAds > 0 ? (adsUsed / maxAds) * 100 : 0;

  // Group seller addons by type
  const addonsByType = sellerAddons?.reduce((acc, sa) => {
    const type = sa.addon?.type || 'unknown';
    if (!acc[type]) acc[type] = [];
    acc[type].push(sa);
    return acc;
  }, {} as Record<string, typeof sellerAddons>);

  const getAddonIcon = (type: string) => {
    switch (type) {
      case 'bumping': return <Zap className="h-5 w-5" />;
      case 'featured': return <Star className="h-5 w-5" />;
      case 'promotion': return <TrendingUp className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getAddonColor = (type: string) => {
    switch (type) {
      case 'bumping': return 'bg-yellow-100 text-yellow-800';
      case 'featured': return 'bg-purple-100 text-purple-800';
      case 'promotion': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Current Subscription
              </CardTitle>
              <CardDescription>
                Your active subscription plan and usage
              </CardDescription>
            </div>
            {!subscription && (
              <Link to="/pricing">
                <Button>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-6">
              {/* Package Info */}
              <div 
                className="rounded-lg p-4 border"
                style={{ 
                  backgroundColor: pkg?.bg_color || '#f8fafc',
                  color: pkg?.text_color || '#1a1a1a'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">{pkg?.name}</h3>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </Badge>
                </div>
                <p className="text-sm opacity-80 mb-4">{pkg?.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="opacity-60">Price</p>
                    <p className="font-semibold">{pkg?.currency} {pkg?.price?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="opacity-60">Duration</p>
                    <p className="font-semibold">{pkg?.duration_days} days</p>
                  </div>
                  <div>
                    <p className="opacity-60">Analytics</p>
                    <p className="font-semibold">{pkg?.analytics_access ? 'Included' : 'Not included'}</p>
                  </div>
                  <div>
                    <p className="opacity-60">Expires</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {subscription.expires_at 
                        ? format(new Date(subscription.expires_at), 'MMM dd, yyyy')
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ads Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Ads Usage</span>
                  <span className="text-sm text-muted-foreground">
                    {adsUsed} / {maxAds} ads used
                  </span>
                </div>
                <Progress value={adsPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {adsRemaining} ads remaining in your plan
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Link to="/pricing">
                  <Button variant="outline" size="sm">
                    Upgrade Plan
                  </Button>
                </Link>
                {pkg?.analytics_access && (
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
              <p className="text-muted-foreground mb-4">
                Subscribe to a plan to start posting ads and grow your business.
              </p>
              <Link to="/pricing">
                <Button>View Plans</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchased Add-ons */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Your Add-ons
              </CardTitle>
              <CardDescription>
                Purchased add-ons and remaining credits
              </CardDescription>
            </div>
            <Link to="/pricing">
              <Button variant="outline" size="sm">
                Buy More
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {sellerAddons && sellerAddons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['bumping', 'featured', 'promotion'].map((type) => {
                const typeAddons = addonsByType?.[type] || [];
                const totalPurchased = typeAddons.reduce((sum, a) => sum + a.quantity_purchased, 0);
                const totalUsed = typeAddons.reduce((sum, a) => sum + a.quantity_used, 0);
                const remaining = totalPurchased - totalUsed;

                return (
                  <div
                    key={type}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-2 rounded-full ${getAddonColor(type)}`}>
                        {getAddonIcon(type)}
                      </div>
                      <div>
                        <h4 className="font-semibold capitalize">{type}</h4>
                        <p className="text-xs text-muted-foreground">
                          {remaining} remaining
                        </p>
                      </div>
                    </div>
                    <Progress 
                      value={totalPurchased > 0 ? (totalUsed / totalPurchased) * 100 : 0} 
                      className="h-2 mb-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {totalUsed} of {totalPurchased} used
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                No add-ons purchased yet. Boost your listings with add-ons!
              </p>
              <Link to="/pricing">
                <Button variant="outline">Browse Add-ons</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Add-ons Preview */}
      {availableAddons && availableAddons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Available Add-ons
            </CardTitle>
            <CardDescription>
              Enhance your listings with these add-ons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableAddons.slice(0, 3).map((addon) => {
                const tiers = allTiers?.filter(t => t.addon_id === addon.id) || [];
                const lowestPrice = tiers.length > 0 
                  ? Math.min(...tiers.map(t => t.price))
                  : 0;

                return (
                  <div
                    key={addon.id}
                    className="rounded-lg border p-4 hover:shadow-md transition-shadow"
                    style={{
                      backgroundColor: addon.bg_color || '#f8fafc',
                      color: addon.text_color || '#1a1a1a'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 rounded-full ${getAddonColor(addon.type)}`}>
                        {getAddonIcon(addon.type)}
                      </div>
                      <h4 className="font-semibold">{addon.name}</h4>
                    </div>
                    <p className="text-sm opacity-80 mb-3">{addon.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        From KES {lowestPrice.toLocaleString()}
                      </span>
                      <Link to="/pricing">
                        <Button size="sm" variant="secondary">
                          Buy Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SellerSubscriptionDashboard;
