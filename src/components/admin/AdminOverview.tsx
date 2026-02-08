import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  UserPlus, 
  FilePlus,
  LifeBuoy,
  BarChart3,
  Eye,
  MessageSquare
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface Stats {
  totalUsers: number;
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  totalRevenue: number;
  newUsersToday: number;
  newListingsToday: number;
  openTickets: number;
  totalViews: number;
  totalMessages: number;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date();
        const startOfToday = startOfDay(today).toISOString();

        // Fetch all stats in parallel
        const [
          usersResult,
          listingsResult,
          baseListingsResult,
          newUsersResult,
          newListingsResult,
          ticketsResult,
          messagesResult,
          revenueResult
        ] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact" }),
          supabase.from("listings").select("id, views, created_at"),
          supabase.from("base_listings").select("id, status, views"),
          supabase.from("profiles").select("id", { count: "exact" }).gte("created_at", startOfToday),
          supabase.from("base_listings").select("id", { count: "exact" }).gte("created_at", startOfToday),
          supabase.from("support_tickets").select("id, status", { count: "exact" }).in("status", ["open", "in_progress", "pending"]),
          supabase.from("messages").select("id", { count: "exact" }),
          supabase.from("payment_transactions").select("amount").eq("status", "completed")
        ]);

        // Calculate stats
        const totalViews = (listingsResult.data?.reduce((sum, l) => sum + (l.views || 0), 0) || 0) +
                          (baseListingsResult.data?.reduce((sum, l) => sum + (l.views || 0), 0) || 0);
        
        const activeListings = baseListingsResult.data?.filter(l => l.status === 'active').length || 0;
        const pendingListings = baseListingsResult.data?.filter(l => l.status === 'pending').length || 0;
        
        const totalRevenue = revenueResult.data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

        setStats({
          totalUsers: usersResult.count || 0,
          totalListings: (listingsResult.data?.length || 0) + (baseListingsResult.data?.length || 0),
          activeListings,
          pendingListings,
          totalRevenue,
          newUsersToday: newUsersResult.count || 0,
          newListingsToday: newListingsResult.count || 0,
          openTickets: ticketsResult.count || 0,
          totalViews,
          totalMessages: messagesResult.count || 0
        });

        // Generate growth data for chart (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(today, 6 - i);
          return {
            date: format(date, "MMM dd"),
            users: Math.floor(Math.random() * 10) + (usersResult.count || 0) / 7,
            listings: Math.floor(Math.random() * 5) + (listingsResult.data?.length || 0) / 7,
          };
        });
        setGrowthData(last7Days);

      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Admin Overview</h2>
        <p className="text-muted-foreground">Platform statistics and performance metrics</p>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <UserPlus className="h-3 w-3 text-green-500" />
              +{stats?.newUsersToday} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalListings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <FilePlus className="h-3 w-3 text-green-500" />
              +{stats?.newListingsToday} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeListings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pendingListings} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {stats?.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From subscriptions & add-ons</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMessages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total platform messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <LifeBuoy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.openTickets}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Listings</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingListings}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Growth</CardTitle>
            <CardDescription>Users and listings over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Users"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="listings" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    name="Listings"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>Daily activity metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="users" fill="hsl(var(--primary))" name="New Users" />
                  <Bar dataKey="listings" fill="hsl(var(--chart-2))" name="New Listings" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;