import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useSellerAddons } from "@/hooks/useSubscriptions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Package, 
  FileText, 
  Eye, 
  MessageSquare, 
  Zap, 
  Star, 
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

const SellerOverview = () => {
  const { user } = useAuth();
  const { data: limits, isLoading: limitsLoading } = useSubscriptionLimits();
  const { data: sellerAddons } = useSellerAddons(user?.id);
  
  const [stats, setStats] = useState({
    totalListings: 0,
    totalViews: 0,
    totalMessages: 0,
    recentListings: [] as { id: string; title: string; views: number }[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        // Fetch listings
        const { data: listings } = await supabase
          .from("listings")
          .select("id, title, views")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        // Fetch messages
        const { data: messages } = await supabase
          .from("messages")
          .select("id")
          .eq("receiver_id", user.id);

        const totalViews = listings?.reduce((sum, l) => sum + (l.views || 0), 0) || 0;

        setStats({
          totalListings: listings?.length || 0,
          totalViews,
          totalMessages: messages?.length || 0,
          recentListings: listings?.slice(0, 3) || []
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  // Calculate add-on credits
  const bumpCredits = sellerAddons?.filter(sa => sa.addon?.type === 'bumping')
    .reduce((sum, a) => sum + (a.quantity_purchased - a.quantity_used), 0) || 0;
  const featuredCredits = sellerAddons?.filter(sa => sa.addon?.type === 'featured')
    .reduce((sum, a) => sum + (a.quantity_purchased - a.quantity_used), 0) || 0;
  const promotionCredits = sellerAddons?.filter(sa => sa.addon?.type === 'promotion')
    .reduce((sum, a) => sum + (a.quantity_purchased - a.quantity_used), 0) || 0;

  if (isLoading || limitsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
        </div>
        <Link to="/post-ad">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Post New Ad
          </Button>
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
                      <FileText className="h-4 w-4" />
                      {limits.adsUsed} / {limits.maxAds} ads used
                    </span>
                    {limits.expiresAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Expires {format(new Date(limits.expiresAt), "MMM dd, yyyy")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to="/seller-dashboard/subscription">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="sm">Upgrade</Button>
                </Link>
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
                  <p className="text-sm text-muted-foreground">
                    Subscribe to a plan to start posting ads and grow your business.
                  </p>
                </div>
              </div>
              <Link to="/pricing">
                <Button>Get Started</Button>
              </Link>
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
            <div className="text-2xl font-bold">{stats.totalListings}</div>
            {limits?.hasActiveSubscription && (
              <div className="mt-2">
                <Progress value={(limits.adsUsed / limits.maxAds) * 100} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-1">
                  {limits.adsRemaining} slots remaining
                </p>
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
        {/* Available Add-ons */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Your Add-ons
            </CardTitle>
            <CardDescription>Boost credits available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">Bump Credits</span>
                </div>
                <Badge variant="secondary">{bumpCredits}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Featured Credits</span>
                </div>
                <Badge variant="secondary">{featuredCredits}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Promotion Credits</span>
                </div>
                <Badge variant="secondary">{promotionCredits}</Badge>
              </div>
            </div>
            <Link to="/seller-dashboard/addons" className="block mt-4">
              <Button variant="outline" className="w-full">
                Manage Add-ons
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Listings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Listings
            </CardTitle>
            <CardDescription>Your latest ads</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentListings.length > 0 ? (
              <div className="space-y-3">
                {stats.recentListings.map((listing) => (
                  <Link
                    key={listing.id}
                    to={`/listing/${listing.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
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
                View All Listings
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerOverview;
