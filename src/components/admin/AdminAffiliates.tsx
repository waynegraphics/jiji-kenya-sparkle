import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, DollarSign, TrendingUp, CheckCircle, XCircle, CreditCard, MousePointerClick, Smartphone, Monitor, Tablet } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(210, 60%, 50%)", "hsl(150, 60%, 40%)", "hsl(30, 80%, 50%)", "hsl(0, 60%, 50%)"];

const AdminAffiliates = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [payoutAffiliateId, setPayoutAffiliateId] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutPhone, setPayoutPhone] = useState("");

  const { data: affiliates } = useQuery({
    queryKey: ["admin-affiliates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("affiliates").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      const userIds = data.map((a: any) => a.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, phone").in("user_id", userIds);
      return data.map((a: any) => ({
        ...a,
        display_name: profiles?.find((p: any) => p.user_id === a.user_id)?.display_name || "Unknown",
        phone: profiles?.find((p: any) => p.user_id === a.user_id)?.phone || "",
      }));
    },
  });

  const { data: referrals } = useQuery({
    queryKey: ["admin-referrals"],
    queryFn: async () => {
      const { data } = await supabase.from("affiliate_referrals").select("*").order("created_at", { ascending: false }).limit(200);
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
      const { data } = await supabase.from("affiliate_clicks").select("*").order("created_at", { ascending: false }).limit(500);
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

  // Stats
  const totalAffiliates = affiliates?.length || 0;
  const activeAffiliates = affiliates?.filter((a: any) => a.status === "approved").length || 0;
  const totalEarnings = affiliates?.reduce((s: number, a: any) => s + Number(a.total_earnings), 0) || 0;
  const pendingPayouts = affiliates?.reduce((s: number, a: any) => s + Number(a.pending_balance), 0) || 0;
  const totalClicks = allClicks?.length || 0;
  const totalConversions = allClicks?.filter((c: any) => c.converted).length || 0;

  // Click analytics
  const deviceData = allClicks?.reduce((acc: Record<string, number>, c: any) => {
    const key = c.device_type || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const deviceChartData = Object.entries(deviceData || {}).map(([name, value]) => ({ name, value }));

  const osData = allClicks?.reduce((acc: Record<string, number>, c: any) => {
    const key = c.os_name || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const osChartData = Object.entries(osData || {}).map(([name, value]) => ({ name, value }));

  // Clicks per affiliate
  const clicksByAffiliate = allClicks?.reduce((acc: Record<string, number>, c: any) => {
    acc[c.affiliate_id] = (acc[c.affiliate_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Daily clicks (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });
  const clicksByDay = allClicks?.reduce((acc: Record<string, number>, c: any) => {
    const day = c.created_at?.split("T")[0];
    if (day) acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const dailyClickData = last30Days.map((day) => ({ date: day.slice(5), clicks: clicksByDay?.[day] || 0 }));

  const deviceIcon = (type: string) => {
    if (type === "mobile") return <Smartphone className="h-4 w-4" />;
    if (type === "tablet") return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Affiliate Management</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Affiliates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAffiliates}</div>
            <p className="text-xs text-muted-foreground">{activeAffiliates} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Conversions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions}</div>
            <p className="text-xs text-muted-foreground">{totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : 0}% rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referrals?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalEarnings.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Pending Pay</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {pendingPayouts.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="affiliates">
        <TabsList>
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="clicks">Clicks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Affiliates Tab */}
        <TabsContent value="affiliates">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Referrals</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliates?.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.display_name}</TableCell>
                      <TableCell><code className="bg-muted px-2 py-1 rounded text-xs">{a.referral_code}</code></TableCell>
                      <TableCell>
                        <Badge variant={a.status === "approved" ? "default" : a.status === "pending" ? "secondary" : "destructive"}>
                          {a.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{clicksByAffiliate?.[a.id] || 0}</TableCell>
                      <TableCell>{referrals?.filter((r: any) => r.affiliate_id === a.id).length || 0}</TableCell>
                      <TableCell>KES {Number(a.total_earnings).toLocaleString()}</TableCell>
                      <TableCell>KES {Number(a.pending_balance).toLocaleString()}</TableCell>
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clicks Tab */}
        <TabsContent value="clicks">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Clicks ({allClicks?.length || 0} total)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Affiliate</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead>Browser</TableHead>
                    <TableHead>Converted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allClicks?.slice(0, 100).map((c: any) => {
                    const aff = affiliates?.find((a: any) => a.id === c.affiliate_id);
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="text-sm">{new Date(c.created_at).toLocaleString()}</TableCell>
                        <TableCell className="text-sm">{aff?.display_name || c.referral_code}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {deviceIcon(c.device_type)}
                            <span className="capitalize text-sm">{c.device_type || "?"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{c.os_name || "?"}</TableCell>
                        <TableCell className="text-sm">{c.browser_name || "?"}</TableCell>
                        <TableCell>
                          {c.converted ? (
                            <Badge className="bg-green-500/20 text-green-700">Yes</Badge>
                          ) : (
                            <Badge variant="secondary">No</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!allClicks || allClicks.length === 0) && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No clicks recorded yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Daily clicks chart */}
          <Card>
            <CardHeader><CardTitle className="text-base">Clicks (Last 30 Days)</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyClickData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Device Types</CardTitle></CardHeader>
              <CardContent>
                {deviceChartData.length > 0 ? (
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={deviceChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {deviceChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Operating Systems</CardTitle></CardHeader>
              <CardContent>
                {osChartData.length > 0 ? (
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={osChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {osChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts?.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>KES {Number(p.amount).toLocaleString()}</TableCell>
                      <TableCell>{p.mpesa_phone}</TableCell>
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
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader><CardTitle>Affiliate Program Settings</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Registration Commission (%)</Label>
                  <Input
                    type="number"
                    defaultValue={settings?.affiliate_default_commission_registration || "10"}
                    onBlur={(e) => updateSetting.mutate({ key: "affiliate_default_commission_registration", value: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subscription Commission (%)</Label>
                  <Input
                    type="number"
                    defaultValue={settings?.affiliate_default_commission_subscription || "10"}
                    onBlur={(e) => updateSetting.mutate({ key: "affiliate_default_commission_subscription", value: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Payout (KES)</Label>
                  <Input
                    type="number"
                    defaultValue={settings?.affiliate_min_payout || "500"}
                    onBlur={(e) => updateSetting.mutate({ key: "affiliate_min_payout", value: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Commission Type</Label>
                  <Select
                    defaultValue={settings?.affiliate_commission_type || "one_time"}
                    onValueChange={(val) => updateSetting.mutate({ key: "affiliate_commission_type", value: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
