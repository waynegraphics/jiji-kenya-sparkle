import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Users, DollarSign, TrendingUp, CheckCircle, XCircle, CreditCard, MousePointerClick,
  Smartphone, Monitor, Tablet, Eye, Clock, Trophy, BarChart3, Settings, Percent, Search
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const CHART_COLORS = ["hsl(var(--primary))", "hsl(142, 76%, 36%)", "hsl(210, 60%, 50%)", "hsl(45, 93%, 47%)", "hsl(30, 80%, 50%)", "hsl(0, 60%, 50%)"];

const AdminAffiliates = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [payoutAffiliateId, setPayoutAffiliateId] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutPhone, setPayoutPhone] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // --- Data Queries ---
  const { data: affiliates } = useQuery({
    queryKey: ["admin-affiliates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("affiliates").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      const userIds = data.map((a: any) => a.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, phone").in("user_id", userIds);
      const { data: emails } = await supabase.rpc("get_user_emails");
      return data.map((a: any) => ({
        ...a,
        display_name: profiles?.find((p: any) => p.user_id === a.user_id)?.display_name || "Unknown",
        phone: profiles?.find((p: any) => p.user_id === a.user_id)?.phone || "",
        email: emails?.find((e: any) => e.user_id === a.user_id)?.email || "",
      }));
    },
  });

  const { data: referrals } = useQuery({
    queryKey: ["admin-referrals"],
    queryFn: async () => {
      const { data } = await supabase.from("affiliate_referrals").select("*").order("created_at", { ascending: false }).limit(500);
      return data || [];
    },
  });

  const { data: payouts } = useQuery({
    queryKey: ["admin-payouts"],
    queryFn: async () => {
      const { data } = await supabase.from("affiliate_payouts").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: allClicks } = useQuery({
    queryKey: ["admin-affiliate-clicks"],
    queryFn: async () => {
      const { data } = await supabase.from("affiliate_clicks").select("*").order("created_at", { ascending: false }).limit(1000);
      return data || [];
    },
  });

  const { data: settings } = useQuery({
    queryKey: ["affiliate-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("platform_settings").select("key, value").in("key", [
        "affiliate_default_commission_registration", "affiliate_default_commission_subscription",
        "affiliate_min_payout", "affiliate_enabled", "affiliate_commission_type",
      ]);
      const map: Record<string, string> = {};
      data?.forEach((s: any) => (map[s.key] = s.value));
      return map;
    },
  });

  // --- Mutations ---
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("affiliates").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-affiliates"] });
      toast({ title: "Status updated" });
    },
  });

  const createPayout = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("affiliate_payouts").insert({
        affiliate_id: payoutAffiliateId,
        amount: parseFloat(payoutAmount),
        mpesa_phone: payoutPhone,
        status: "processing",
        processed_by: user?.id,
        processed_at: new Date().toISOString(),
      });
      if (error) throw error;
      const affiliate = affiliates?.find((a: any) => a.id === payoutAffiliateId);
      if (affiliate) {
        await supabase.from("affiliates").update({
          pending_balance: Math.max(0, affiliate.pending_balance - parseFloat(payoutAmount)),
          total_paid: affiliate.total_paid + parseFloat(payoutAmount),
        }).eq("id", payoutAffiliateId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-affiliates", "admin-payouts"] });
      toast({ title: "Payout processed" });
      setShowPayoutDialog(false);
      setPayoutAmount("");
      setPayoutPhone("");
    },
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase.from("platform_settings").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliate-settings"] });
      toast({ title: "Setting saved" });
    },
  });

  // --- Computed Stats ---
  const totalAffiliates = affiliates?.length || 0;
  const pendingApproval = affiliates?.filter((a: any) => a.status === "pending").length || 0;
  const activeAffiliates = affiliates?.filter((a: any) => a.status === "approved").length || 0;
  const totalEarnings = affiliates?.reduce((s: number, a: any) => s + Number(a.total_earnings), 0) || 0;
  const totalPaidOut = affiliates?.reduce((s: number, a: any) => s + Number(a.total_paid), 0) || 0;
  const totalClicks = allClicks?.length || 0;
  const totalConversions = allClicks?.filter((c: any) => c.converted).length || 0;

  // Clicks per affiliate
  const clicksByAffiliate = allClicks?.reduce((acc: Record<string, number>, c: any) => {
    acc[c.affiliate_id] = (acc[c.affiliate_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const conversionsByAffiliate = allClicks?.reduce((acc: Record<string, number>, c: any) => {
    if (c.converted) acc[c.affiliate_id] = (acc[c.affiliate_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Daily clicks (30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });
  const clicksByDay = allClicks?.reduce((acc: Record<string, number>, c: any) => {
    const day = c.created_at?.split("T")[0];
    if (day) acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const dailyClickData = last30Days.map(day => ({ date: day.slice(5), clicks: clicksByDay?.[day] || 0 }));

  // Device/OS analytics
  const deviceData = allClicks?.reduce((acc: Record<string, number>, c: any) => {
    acc[c.device_type || "Unknown"] = (acc[c.device_type || "Unknown"] || 0) + 1; return acc;
  }, {} as Record<string, number>);
  const deviceChartData = Object.entries(deviceData || {}).map(([name, value]) => ({ name, value }));

  const osData = allClicks?.reduce((acc: Record<string, number>, c: any) => {
    acc[c.os_name || "Unknown"] = (acc[c.os_name || "Unknown"] || 0) + 1; return acc;
  }, {} as Record<string, number>);
  const osChartData = Object.entries(osData || {}).map(([name, value]) => ({ name, value }));

  const browserData = allClicks?.reduce((acc: Record<string, number>, c: any) => {
    acc[c.browser_name || "Unknown"] = (acc[c.browser_name || "Unknown"] || 0) + 1; return acc;
  }, {} as Record<string, number>);
  const browserChartData = Object.entries(browserData || {}).map(([name, value]) => ({ name, value }));

  // Commission analytics
  const pendingCommissions = referrals?.filter((r: any) => r.status === "pending") || [];
  const approvedCommissions = referrals?.filter((r: any) => r.status === "completed") || [];
  const rejectedCommissions = referrals?.filter((r: any) => r.status === "rejected") || [];
  const avgCommission = approvedCommissions.length > 0
    ? approvedCommissions.reduce((s: number, r: any) => s + Number(r.commission_amount), 0) / approvedCommissions.length
    : 0;

  // Commission trends (30 days)
  const commissionsByDay = referrals?.reduce((acc: Record<string, number>, r: any) => {
    const day = r.created_at?.split("T")[0];
    if (day) acc[day] = (acc[day] || 0) + Number(r.commission_amount);
    return acc;
  }, {} as Record<string, number>);
  const dailyCommissionData = last30Days.map(day => ({ date: day.slice(5), amount: commissionsByDay?.[day] || 0 }));

  // Commission status distribution
  const commStatusData = [
    { name: "Approved", value: approvedCommissions.length, color: "hsl(142, 76%, 36%)" },
    { name: "Pending", value: pendingCommissions.length, color: "hsl(45, 93%, 47%)" },
    { name: "Rejected", value: rejectedCommissions.length, color: "hsl(0, 60%, 50%)" },
  ].filter(d => d.value > 0);

  // Leaderboard - sort by earnings
  const leaderboard = [...(affiliates || [])].sort((a: any, b: any) => Number(b.total_earnings) - Number(a.total_earnings));

  const getTierInfo = (earnings: number, conversions: number) => {
    if (conversions >= 50 || earnings >= 250000) return { name: "Platinum", color: "text-purple-600", bg: "bg-purple-100" };
    if (conversions >= 15 || earnings >= 75000) return { name: "Gold", color: "text-yellow-600", bg: "bg-yellow-100" };
    if (conversions >= 5 || earnings >= 25000) return { name: "Silver", color: "text-gray-500", bg: "bg-gray-100" };
    return { name: "Bronze", color: "text-orange-600", bg: "bg-orange-100" };
  };

  const filteredAffiliates = affiliates?.filter((a: any) =>
    !searchQuery || a.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.referral_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deviceIcon = (type: string) => {
    if (type === "mobile") return <Smartphone className="h-4 w-4" />;
    if (type === "tablet") return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Affiliate Management</h2>
        <p className="text-muted-foreground">Manage affiliates, commissions, and payouts</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Affiliates</p>
              <p className="text-2xl font-bold">{totalAffiliates}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending Approval</p>
              <p className="text-2xl font-bold">{pendingApproval}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Affiliates</p>
              <p className="text-2xl font-bold">{activeAffiliates}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold">KES {totalEarnings.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="affiliates">
        <TabsList className="flex-wrap">
          <TabsTrigger value="affiliates" className="gap-1.5"><Users className="h-3.5 w-3.5" />Affiliates</TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-1.5"><Trophy className="h-3.5 w-3.5" />Leaderboard</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" />Analytics</TabsTrigger>
          <TabsTrigger value="commissions" className="gap-1.5"><Percent className="h-3.5 w-3.5" />Pending Commissions</TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5"><Settings className="h-3.5 w-3.5" />Settings</TabsTrigger>
          <TabsTrigger value="payouts" className="gap-1.5"><DollarSign className="h-3.5 w-3.5" />Payouts</TabsTrigger>
        </TabsList>

        {/* ===== AFFILIATES TAB ===== */}
        <TabsContent value="affiliates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">All Affiliates</CardTitle>
                <CardDescription>Manage affiliate applications and accounts</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search affiliates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Referral Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Conversions</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAffiliates?.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.display_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{a.email}</TableCell>
                      <TableCell><code className="bg-muted px-2 py-1 rounded text-xs font-mono">{a.referral_code}</code></TableCell>
                      <TableCell>
                        <Badge variant={a.status === "approved" ? "default" : a.status === "pending" ? "secondary" : "destructive"}
                          className={a.status === "approved" ? "bg-green-500/20 text-green-700 border-green-200" : ""}>
                          {a.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{clicksByAffiliate?.[a.id] || 0}</TableCell>
                      <TableCell>{conversionsByAffiliate?.[a.id] || 0}</TableCell>
                      <TableCell className="font-medium">KES {Number(a.total_earnings).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {a.status === "pending" && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => updateStatus.mutate({ id: a.id, status: "approved" })}>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => updateStatus.mutate({ id: a.id, status: "rejected" })}>
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                          {a.status === "approved" && Number(a.pending_balance) > 0 && (
                            <Button size="sm" variant="outline" onClick={() => {
                              setPayoutAffiliateId(a.id);
                              setPayoutPhone(a.mpesa_phone || a.phone || "");
                              setPayoutAmount(String(a.pending_balance));
                              setShowPayoutDialog(true);
                            }}>
                              <CreditCard className="h-4 w-4 mr-1" />Pay
                            </Button>
                          )}
                          <Button size="sm" variant="outline"><Eye className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!filteredAffiliates || filteredAffiliates.length === 0) && (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No affiliates found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== LEADERBOARD TAB ===== */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-500" />Top Affiliates</CardTitle>
              <CardDescription>Leaderboard by conversions and earnings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaderboard.map((a: any, i: number) => {
                const conversions = conversionsByAffiliate?.[a.id] || 0;
                const clicks = clicksByAffiliate?.[a.id] || 0;
                const tier = getTierInfo(Number(a.total_earnings), conversions);
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div key={a.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-xl w-8 text-center">{medals[i] || `#${i + 1}`}</span>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                          {a.display_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{a.display_name}</p>
                        <Badge variant="outline" className={`text-xs ${tier.color} ${tier.bg} border-0`}>{tier.name}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MousePointerClick className="h-3.5 w-3.5" />{clicks} clicks
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />{conversions} conversions
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold">
                        <TrendingUp className="h-3.5 w-3.5" />KES {Number(a.total_earnings).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{totalClicks}</p>
                  <p className="text-xs text-muted-foreground">Total Clicks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{totalConversions}</p>
                  <p className="text-xs text-muted-foreground">Total Conversions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">KES {totalEarnings.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== ANALYTICS TAB ===== */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Commission Analytics Header */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Commission Analytics</CardTitle>
              <CardDescription>Performance metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Percent className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Approval Rate</p>
                    <p className="text-xl font-bold">
                      {referrals && referrals.length > 0 ? ((approvedCommissions.length / referrals.length) * 100).toFixed(1) : "0"}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Commission</p>
                    <p className="text-xl font-bold">KES {Math.round(avgCommission).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Paid Out</p>
                    <p className="text-xl font-bold">KES {totalPaidOut.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pending Review</p>
                    <p className="text-xl font-bold">{pendingCommissions.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commission Trends + Status Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Commission Trends (30 Days)</CardTitle>
                <CardDescription>Daily commission value over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyCommissionData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => [`KES ${v.toLocaleString()}`, "Commission"]} />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Commission Status Distribution</CardTitle>
                <CardDescription>Breakdown by approval status</CardDescription>
              </CardHeader>
              <CardContent>
                {commStatusData.length > 0 ? (
                  <>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={commStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                            {commStatusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 text-sm">
                      {commStatusData.map(d => (
                        <div key={d.name} className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                          {d.name}: {d.value}
                        </div>
                      ))}
                    </div>
                  </>
                ) : <p className="text-sm text-muted-foreground text-center py-12">No commission data yet</p>}
              </CardContent>
            </Card>
          </div>

          {/* Click Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Click Trends (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyClickData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="clicks" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Device/OS/Browser breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Device Types", data: deviceChartData },
              { title: "Operating Systems", data: osChartData },
              { title: "Browsers", data: browserChartData },
            ].map(({ title, data }) => (
              <Card key={title}>
                <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
                <CardContent>
                  {data.length > 0 ? (
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ===== PENDING COMMISSIONS TAB ===== */}
        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Commissions</CardTitle>
              <CardDescription>Review and approve affiliate commissions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Affiliate</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Source Amount</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals?.map((r: any) => {
                    const aff = affiliates?.find((a: any) => a.id === r.affiliate_id);
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="text-sm">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{aff?.display_name || "Unknown"}</TableCell>
                        <TableCell><Badge variant="outline">{r.referral_type}</Badge></TableCell>
                        <TableCell>KES {Number(r.source_amount).toLocaleString()}</TableCell>
                        <TableCell className="font-medium">KES {Number(r.commission_amount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={r.status === "completed" ? "default" : r.status === "pending" ? "secondary" : "destructive"}
                            className={r.status === "completed" ? "bg-green-500/20 text-green-700 border-green-200" : ""}>
                            {r.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!referrals || referrals.length === 0) && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No commissions yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== SETTINGS TAB ===== */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Affiliate Program Settings</CardTitle>
              <CardDescription>Configure commission rates and payout rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Registration Commission (%)</Label>
                  <Input type="number" defaultValue={settings?.affiliate_default_commission_registration || "10"}
                    onBlur={(e) => updateSetting.mutate({ key: "affiliate_default_commission_registration", value: e.target.value })} />
                  <p className="text-xs text-muted-foreground">Commission earned when a referred user registers</p>
                </div>
                <div className="space-y-2">
                  <Label>Subscription Commission (%)</Label>
                  <Input type="number" defaultValue={settings?.affiliate_default_commission_subscription || "10"}
                    onBlur={(e) => updateSetting.mutate({ key: "affiliate_default_commission_subscription", value: e.target.value })} />
                  <p className="text-xs text-muted-foreground">Commission earned on subscription purchases</p>
                </div>
                <div className="space-y-2">
                  <Label>Minimum Payout (KES)</Label>
                  <Input type="number" defaultValue={settings?.affiliate_min_payout || "500"}
                    onBlur={(e) => updateSetting.mutate({ key: "affiliate_min_payout", value: e.target.value })} />
                  <p className="text-xs text-muted-foreground">Minimum balance required before payout</p>
                </div>
                <div className="space-y-2">
                  <Label>Commission Type</Label>
                  <Select defaultValue={settings?.affiliate_commission_type || "one_time"}
                    onValueChange={(val) => updateSetting.mutate({ key: "affiliate_commission_type", value: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_time">One-Time (per user)</SelectItem>
                      <SelectItem value="recurring">Recurring (every payment)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    One-time: commission only on first payment. Recurring: commission on every payment from referred user.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== PAYOUTS TAB ===== */}
        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payout History</CardTitle>
              <CardDescription>All processed and pending affiliate payouts</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Affiliate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts?.map((p: any) => {
                    const aff = affiliates?.find((a: any) => a.id === p.affiliate_id);
                    return (
                      <TableRow key={p.id}>
                        <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{aff?.display_name || "Unknown"}</TableCell>
                        <TableCell className="font-medium">KES {Number(p.amount).toLocaleString()}</TableCell>
                        <TableCell>{p.mpesa_phone}</TableCell>
                        <TableCell>{p.mpesa_receipt || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={p.status === "completed" ? "default" : "secondary"}
                            className={p.status === "completed" ? "bg-green-500/20 text-green-700 border-green-200" : ""}>
                            {p.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!payouts || payouts.length === 0) && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No payouts yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payout Dialog */}
      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Process Payout</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Amount (KES)</Label><Input type="number" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} /></div>
            <div><Label>M-Pesa Phone</Label><Input value={payoutPhone} onChange={(e) => setPayoutPhone(e.target.value)} placeholder="254..." /></div>
            <Button onClick={() => createPayout.mutate()} disabled={createPayout.isPending}>
              {createPayout.isPending ? "Processing..." : "Process Payout"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAffiliates;
