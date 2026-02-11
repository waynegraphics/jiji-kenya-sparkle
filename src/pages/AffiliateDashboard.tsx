import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Routes, Route, Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  LayoutDashboard, Users, DollarSign, CreditCard, TrendingUp, Link2, Home, Copy, Share2, BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function AffiliateSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  const items = [
    { title: "Overview", url: "/affiliate/dashboard", icon: LayoutDashboard },
    { title: "Referrals", url: "/affiliate/dashboard/referrals", icon: Users },
    { title: "Earnings", url: "/affiliate/dashboard/earnings", icon: DollarSign },
    { title: "Payouts", url: "/affiliate/dashboard/payouts", icon: CreditCard },
    { title: "Analytics", url: "/affiliate/dashboard/analytics", icon: BarChart3 },
  ];

  const isActive = (path: string) => path === "/affiliate/dashboard" ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <div className={`p-3 border-b ${collapsed ? "px-2" : ""}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Link2 className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && <div><h2 className="font-semibold text-sm">Affiliate Portal</h2></div>}
          </div>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={collapsed ? item.title : undefined}>
                    <Link to={item.url} className={`flex items-center gap-3 ${isActive(item.url) ? "bg-primary/10 text-primary" : ""}`}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function AffiliateOverview() {
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: affiliate } = useQuery({
    queryKey: ["my-affiliate", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("affiliates").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: referrals } = useQuery({
    queryKey: ["my-referrals", affiliate?.id],
    queryFn: async () => {
      const { data } = await supabase.from("affiliate_referrals").select("*").eq("affiliate_id", affiliate!.id);
      return data || [];
    },
    enabled: !!affiliate,
  });

  if (!affiliate) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  const referralLink = `${window.location.origin}?ref=${affiliate.referral_code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Referral link copied!" });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Affiliate Dashboard</h2>

      {affiliate.status === "pending" && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-yellow-800 font-medium">Your affiliate application is pending approval.</p>
          </CardContent>
        </Card>
      )}

      {/* Referral Link */}
      <Card>
        <CardHeader><CardTitle className="text-base">Your Referral Link</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="font-mono text-sm" />
            <Button variant="outline" onClick={copyLink}><Copy className="h-4 w-4" /></Button>
            <Button variant="outline" onClick={() => {
              if (navigator.share) navigator.share({ url: referralLink, title: "Join APA Bazaar" });
            }}><Share2 className="h-4 w-4" /></Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Code: <code className="bg-muted px-2 py-0.5 rounded">{affiliate.referral_code}</code></p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{referrals?.length || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">KES {Number(affiliate.total_earnings).toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Pending Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">KES {Number(affiliate.pending_balance).toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Paid</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">KES {Number(affiliate.total_paid).toLocaleString()}</div></CardContent>
        </Card>
      </div>

      {/* Commission Rates */}
      <Card>
        <CardHeader><CardTitle className="text-base">Your Commission Rates</CardTitle></CardHeader>
        <CardContent className="flex gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Registration</p>
            <p className="text-xl font-bold">{affiliate.commission_rate_registration}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Subscriptions</p>
            <p className="text-xl font-bold">{affiliate.commission_rate_subscription}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AffiliateReferrals() {
  const { user } = useAuth();
  const { data: affiliate } = useQuery({
    queryKey: ["my-affiliate", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("affiliates").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: referrals } = useQuery({
    queryKey: ["my-referrals", affiliate?.id],
    queryFn: async () => {
      const { data } = await supabase.from("affiliate_referrals").select("*").eq("affiliate_id", affiliate!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!affiliate,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Referrals</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals?.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  <TableCell><Badge variant="outline">{r.referral_type}</Badge></TableCell>
                  <TableCell>KES {Number(r.source_amount).toLocaleString()}</TableCell>
                  <TableCell>KES {Number(r.commission_amount).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={r.status === "completed" ? "default" : "secondary"}>{r.status}</Badge></TableCell>
                </TableRow>
              ))}
              {(!referrals || referrals.length === 0) && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No referrals yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function AffiliatePayouts() {
  const { user } = useAuth();
  const { data: affiliate } = useQuery({
    queryKey: ["my-affiliate", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("affiliates").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: payouts } = useQuery({
    queryKey: ["my-payouts", affiliate?.id],
    queryFn: async () => {
      const { data } = await supabase.from("affiliate_payouts").select("*").eq("affiliate_id", affiliate!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!affiliate,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Payout History</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts?.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>KES {Number(p.amount).toLocaleString()}</TableCell>
                  <TableCell>{p.payment_method}</TableCell>
                  <TableCell>{p.mpesa_receipt || "-"}</TableCell>
                  <TableCell><Badge variant={p.status === "completed" ? "default" : "secondary"}>{p.status}</Badge></TableCell>
                </TableRow>
              ))}
              {(!payouts || payouts.length === 0) && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No payouts yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function AffiliateAnalytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics</h2>
      <Card>
        <CardHeader>
          <CardTitle>Referral Performance</CardTitle>
          <CardDescription>Track your referral activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Analytics data will populate as you generate referrals.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const AffiliateDashboard = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const { data: affiliate, isLoading } = useQuery({
    queryKey: ["my-affiliate", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("affiliates").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  if (loading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (!user) return <Navigate to="/" replace />;
  if (!affiliate) return <Navigate to="/affiliate/apply" replace />;

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/referrals")) return "Referrals";
    if (path.includes("/earnings")) return "Earnings";
    if (path.includes("/payouts")) return "Payouts";
    if (path.includes("/analytics")) return "Analytics";
    return "Overview";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AffiliateSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <span className="font-medium text-sm">{getPageTitle()}</span>
            </div>
            <Link to="/"><Button variant="outline" size="sm"><Home className="h-4 w-4 mr-2" />Back to Site</Button></Link>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-6xl mx-auto">
              <Routes>
                <Route index element={<AffiliateOverview />} />
                <Route path="referrals" element={<AffiliateReferrals />} />
                <Route path="earnings" element={<AffiliateOverview />} />
                <Route path="payouts" element={<AffiliatePayouts />} />
                <Route path="analytics" element={<AffiliateAnalytics />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AffiliateDashboard;
