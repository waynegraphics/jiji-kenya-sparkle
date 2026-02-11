import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, DollarSign, TrendingUp, CheckCircle, XCircle, CreditCard } from "lucide-react";

const AdminAffiliates = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAffiliate, setSelectedAffiliate] = useState<any>(null);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutPhone, setPayoutPhone] = useState("");
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [payoutAffiliateId, setPayoutAffiliateId] = useState("");

  const { data: affiliates, isLoading } = useQuery({
    queryKey: ["admin-affiliates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const userIds = data.map((a: any) => a.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, phone")
        .in("user_id", userIds);

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
      const { data, error } = await supabase
        .from("affiliate_referrals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const { data: payouts } = useQuery({
    queryKey: ["admin-payouts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliate_payouts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: settings } = useQuery({
    queryKey: ["affiliate-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", [
          "affiliate_default_commission_registration",
          "affiliate_default_commission_subscription",
          "affiliate_min_payout",
          "affiliate_enabled",
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
      toast({ title: "Affiliate status updated" });
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

      // Update affiliate balance
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
      toast({ title: "Payout created successfully" });
      setShowPayoutDialog(false);
      setPayoutAmount("");
      setPayoutPhone("");
    },
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("platform_settings")
        .update({ value })
        .eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliate-settings"] });
      toast({ title: "Setting updated" });
    },
  });

  const totalAffiliates = affiliates?.length || 0;
  const activeAffiliates = affiliates?.filter((a: any) => a.status === "approved").length || 0;
  const totalEarnings = affiliates?.reduce((s: number, a: any) => s + Number(a.total_earnings), 0) || 0;
  const pendingPayouts = affiliates?.reduce((s: number, a: any) => s + Number(a.pending_balance), 0) || 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Affiliate Management</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Affiliates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAffiliates}</div>
            <p className="text-xs text-muted-foreground">{activeAffiliates} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referrals?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalEarnings.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
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
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="affiliates">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Referral Code</TableHead>
                    <TableHead>Status</TableHead>
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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setPayoutAffiliateId(a.id);
                                setPayoutPhone(a.mpesa_phone || a.phone || "");
                                setPayoutAmount(String(a.pending_balance));
                                setShowPayoutDialog(true);
                              }}
                            >
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
                      <TableCell>
                        <Badge variant={p.status === "completed" ? "default" : "secondary"}>{p.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader><CardTitle>Affiliate Program Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Registration Commission (%)</Label>
                  <Input
                    type="number"
                    value={settings?.affiliate_default_commission_registration || "10"}
                    onBlur={(e) => updateSetting.mutate({ key: "affiliate_default_commission_registration", value: e.target.value })}
                    onChange={() => {}}
                  />
                </div>
                <div>
                  <Label>Subscription Commission (%)</Label>
                  <Input
                    type="number"
                    value={settings?.affiliate_default_commission_subscription || "10"}
                    onBlur={(e) => updateSetting.mutate({ key: "affiliate_default_commission_subscription", value: e.target.value })}
                    onChange={() => {}}
                  />
                </div>
                <div>
                  <Label>Minimum Payout (KES)</Label>
                  <Input
                    type="number"
                    value={settings?.affiliate_min_payout || "500"}
                    onBlur={(e) => updateSetting.mutate({ key: "affiliate_min_payout", value: e.target.value })}
                    onChange={() => {}}
                  />
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
            <div>
              <Label>Amount (KES)</Label>
              <Input type="number" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} />
            </div>
            <div>
              <Label>M-Pesa Phone</Label>
              <Input value={payoutPhone} onChange={(e) => setPayoutPhone(e.target.value)} placeholder="254..." />
            </div>
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
