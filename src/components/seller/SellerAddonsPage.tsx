import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSellerAddons, useAddons, useAddonTiers } from "@/hooks/useSubscriptions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, Star, TrendingUp, ShoppingCart, Package } from "lucide-react";

const SellerAddonsPage = () => {
  const { user } = useAuth();
  const { data: sellerAddons, isLoading: addonsLoading } = useSellerAddons(user?.id);
  const { data: availableAddons } = useAddons(true);
  const { data: allTiers } = useAddonTiers(undefined, true);

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
      case 'bumping': return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' };
      case 'featured': return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' };
      case 'promotion': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  // Group seller addons by type
  const addonsByType = sellerAddons?.reduce((acc, sa) => {
    const type = sa.addon?.type || 'unknown';
    if (!acc[type]) acc[type] = [];
    acc[type].push(sa);
    return acc;
  }, {} as Record<string, typeof sellerAddons>) || {};

  if (addonsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Add-ons</h2>
          <p className="text-muted-foreground">Boost your listings with add-ons</p>
        </div>
        <Link to="/pricing">
          <Button>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy More
          </Button>
        </Link>
      </div>

      {/* Your Add-ons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Your Purchased Add-ons
          </CardTitle>
          <CardDescription>
            Track your add-on credits and usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sellerAddons && sellerAddons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['bumping', 'featured', 'promotion'].map((type) => {
                const typeAddons = addonsByType[type] || [];
                const totalPurchased = typeAddons.reduce((sum, a) => sum + a.quantity_purchased, 0);
                const totalUsed = typeAddons.reduce((sum, a) => sum + a.quantity_used, 0);
                const remaining = totalPurchased - totalUsed;
                const colors = getAddonColor(type);

                return (
                  <div
                    key={type}
                    className={`rounded-xl border p-6 ${colors.border}`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-full ${colors.bg} ${colors.text}`}>
                        {getAddonIcon(type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg capitalize">{type}</h4>
                        <p className="text-sm text-muted-foreground">
                          {remaining} credits remaining
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Used</span>
                        <span>{totalUsed} / {totalPurchased}</span>
                      </div>
                      <Progress 
                        value={totalPurchased > 0 ? (totalUsed / totalPurchased) * 100 : 0} 
                        className="h-2"
                      />
                    </div>

                    {remaining === 0 && totalPurchased > 0 && (
                      <Link to="/pricing" className="block mt-4">
                        <Button variant="outline" size="sm" className="w-full">
                          Buy More
                        </Button>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No add-ons yet</h3>
              <p className="text-muted-foreground mb-4">
                Purchase add-ons to boost your listings visibility.
              </p>
              <Link to="/pricing">
                <Button>Browse Add-ons</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Add-ons */}
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
          {availableAddons && availableAddons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availableAddons.map((addon) => {
                const tiers = allTiers?.filter(t => t.addon_id === addon.id) || [];
                const colors = getAddonColor(addon.type);
                
                return (
                  <div
                    key={addon.id}
                    className="rounded-xl border overflow-hidden hover:shadow-lg transition-shadow"
                    style={{
                      backgroundColor: addon.bg_color || undefined,
                      color: addon.text_color || undefined
                    }}
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-full ${colors.bg} ${colors.text}`}>
                          {getAddonIcon(addon.type)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{addon.name}</h4>
                          <Badge variant="outline" className="text-xs capitalize">
                            {addon.type}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm opacity-80 mb-4">{addon.description}</p>
                      
                      {/* Tiers */}
                      <div className="space-y-2 mb-4">
                        {tiers.map((tier) => (
                          <div
                            key={tier.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-black/5"
                          >
                            <div>
                              <span className="font-medium">{tier.name}</span>
                              <span className="text-sm opacity-70 ml-2">
                                ({tier.quantity} credits)
                              </span>
                            </div>
                            <span className="font-bold">
                              {tier.currency} {tier.price.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Link to="/pricing">
                        <Button className="w-full" variant="secondary">
                          Buy Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No add-ons available at the moment.
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle>How Add-ons Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6" />
              </div>
              <h4 className="font-semibold mb-2">Bumping</h4>
              <p className="text-sm text-muted-foreground">
                Move your listing to the top of search results for more visibility.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6" />
              </div>
              <h4 className="font-semibold mb-2">Featured</h4>
              <p className="text-sm text-muted-foreground">
                Get a special badge and appear in featured listings sections.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h4 className="font-semibold mb-2">Promotion</h4>
              <p className="text-sm text-muted-foreground">
                Get extra promotion across the platform for maximum exposure.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerAddonsPage;
