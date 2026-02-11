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
  LayoutDashboard, Users, DollarSign, CreditCard, TrendingUp, Link2, Home, Copy, Share2, BarChart3,
  MousePointerClick, Smartphone, Monitor, Tablet
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

function AffiliateSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  const items = [
    { title: "Overview", url: "/affiliate/dashboard", icon: LayoutDashboard },
    { title: "Referrals", url: "/affiliate/dashboard/referrals", icon: Users },
    { title: "Clicks", url: "/affiliate/dashboard/clicks", icon: MousePointerClick },
    { title: "Analytics", url: "/affiliate/dashboard/analytics", icon: BarChart3 },
    { title: "Payouts", url: "/affiliate/dashboard/payouts", icon: CreditCard },
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

  const { data: clicks } = useQuery({
    queryKey: ["my-clicks-count", affiliate?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("affiliate_clicks")
        .select("id, device_type, os_name, created_at, converted")
        .eq("affiliate_id", affiliate!.id);
      return data || [];
    },
    enabled: !!affiliate,
  });

  if (!affiliate) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  const referralLink = `${window.location.origin}?ref=${affiliate.referral_code}`;
  const totalClicks = clicks?.length || 0;
  const conversions = clicks?.filter((c: any) => c.converted).length || 0;
  const conversionRate = totalClicks > 0 ? ((conversions / totalClicks) * 100).toFixed(1) : "0";

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Referral link copied!" });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Affiliate Dashboard</h2>

      {affiliate.status === "pending" && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-4">
            <p className="text-yellow-700 font-medium">Your affiliate application is pending approval.</p>
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalClicks}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{referrals?.length || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{conversionRate}%</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">KES {Number(affiliate.total_earnings).toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">KES {Number(affiliate.pending_balance).toLocaleString()}</div></CardContent>
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

function AffiliateClicks() {
  const { user } = useAuth();
  const { data: affiliate } = useQuery({
    queryKey: ["my-affiliate", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("affiliates").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: clicks } = useQuery({
    queryKey: ["my-clicks", affiliate?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("affiliate_clicks")
        .select("*")
        .eq("affiliate_id", affiliate!.id)
        .order("created_at", { ascending: false })
        .limit(200);
      return data || [];
    },
    enabled: !!affiliate,
  });

  const deviceIcon = (type: string) => {
    if (type === "mobile") return <Smartphone className="h-4 w-4" />;
    if (type === "tablet") return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Click History</h2>
      <div className="text-sm text-muted-foreground">Total: {clicks?.length || 0} clicks tracked</div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>OS</TableHead>
                <TableHead>Browser</TableHead>
                <TableHead>Converted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clicks?.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="text-sm">{new Date(c.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {deviceIcon(c.device_type)}
                      <span className="capitalize text-sm">{c.device_type || "Unknown"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{c.os_name || "Unknown"}</TableCell>
                  <TableCell className="text-sm">{c.browser_name || "Unknown"}</TableCell>
                  <TableCell>
                    {c.converted ? (
                      <Badge className="bg-green-500/20 text-green-700">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {(!clicks || clicks.length === 0) && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No clicks yet. Share your referral link!</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(210, 60%, 50%)", "hsl(150, 60%, 40%)", "hsl(30, 80%, 50%)", "hsl(0, 60%, 50%)"];

function AffiliateAnalytics() {
  const { user } = useAuth();
  const { data: affiliate } = useQuery({
    queryKey: ["my-affiliate", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("affiliates").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: clicks } = useQuery({
    queryKey: ["my-clicks-analytics", affiliate?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("affiliate_clicks")
        .select("*")
        .eq("affiliate_id", affiliate!.id);
      return data || [];
    },
    enabled: !!affiliate,
  });

  const { data: referrals } = useQuery({
    queryKey: ["my-referrals", affiliate?.id],
    queryFn: async () => {
      const { data } = await supabase.from("affiliate_referrals").select("*").eq("affiliate_id", affiliate!.id);
      return data || [];
    },
    enabled: !!affiliate,
  });

  // Device breakdown
  const deviceData = clicks?.reduce((acc: Record<string, number>, c: any) => {
    const key = c.device_type || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const deviceChartData = Object.entries(deviceData || {}).map(([name, value]) => ({ name, value }));

  // OS breakdown
  const osData = clicks?.reduce((acc: Record<string, number>, c: any) => {
    const key = c.os_name || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const osChartData = Object.entries(osData || {}).map(([name, value]) => ({ name, value }));

  // Browser breakdown
  const browserData = clicks?.reduce((acc: Record<string, number>, c: any) => {
    const key = c.browser_name || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const browserChartData = Object.entries(browserData || {}).map(([name, value]) => ({ name, value }));

  // Clicks over last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });

  const clicksByDay = clicks?.reduce((acc: Record<string, number>, c: any) => {
    const day = c.created_at?.split("T")[0];
    if (day) acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dailyClickData = last30Days.map((day) => ({
    date: day.slice(5),
    clicks: clicksByDay?.[day] || 0,
  }));

  const totalClicks = clicks?.length || 0;
  const conversions = clicks?.filter((c: any) => c.converted).length || 0;
  const conversionRate = totalClicks > 0 ? ((conversions / totalClicks) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics</h2>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Clicks</p>
            <p className="text-2xl font-bold">{totalClicks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Conversions</p>
            <p className="text-2xl font-bold">{conversions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Conversion Rate</p>
            <p className="text-2xl font-bold">{conversionRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Referrals</p>
            <p className="text-2xl font-bold">{referrals?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Clicks over time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Clicks (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyClickData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <Tooltip />
                <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Device & OS & Browser */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Device Types</CardTitle></CardHeader>
          <CardContent>
            {deviceChartData.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deviceChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {deviceChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Operating Systems</CardTitle></CardHeader>
          <CardContent>
            {osChartData.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={osChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {osChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Browsers</CardTitle></CardHeader>
          <CardContent>
            {browserChartData.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={browserChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {browserChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
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
    if (path.includes("/clicks")) return "Clicks";
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
                <Route path="clicks" element={<AffiliateClicks />} />
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
