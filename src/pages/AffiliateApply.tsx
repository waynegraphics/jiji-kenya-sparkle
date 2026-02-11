import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link2, DollarSign, Users, TrendingUp, CheckCircle } from "lucide-react";

const AffiliateApply = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mpesaPhone, setMpesaPhone] = useState("");

  const { data: existingAffiliate } = useQuery({
    queryKey: ["my-affiliate", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("affiliates").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: settings } = useQuery({
    queryKey: ["affiliate-settings-public"],
    queryFn: async () => {
      const { data } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", ["affiliate_default_commission_registration", "affiliate_default_commission_subscription", "affiliate_enabled"]);
      const map: Record<string, string> = {};
      data?.forEach((s: any) => (map[s.key] = s.value));
      return map;
    },
  });

  const apply = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in first");
      
      const code = `APA${user.id.slice(0, 6).toUpperCase()}${Date.now().toString(36).slice(-4).toUpperCase()}`;
      
      const { error } = await supabase.from("affiliates").insert({
        user_id: user.id,
        referral_code: code,
        mpesa_phone: mpesaPhone || profile?.phone || "",
        commission_rate_registration: parseFloat(settings?.affiliate_default_commission_registration || "10"),
        commission_rate_subscription: parseFloat(settings?.affiliate_default_commission_subscription || "10"),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Application Submitted!", description: "We'll review your application shortly." });
      navigate("/affiliate/dashboard");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (existingAffiliate) {
    navigate("/affiliate/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Link2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Join the APA Affiliate Program</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Earn commissions by referring sellers and users to APA Bazaar. Share your unique link and earn on every registration and subscription.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6 text-center">
              <DollarSign className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Earn Commissions</h3>
              <p className="text-sm text-muted-foreground">
                {settings?.affiliate_default_commission_registration || "10"}% on registrations, {settings?.affiliate_default_commission_subscription || "10"}% on subscriptions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Unlimited Referrals</h3>
              <p className="text-sm text-muted-foreground">No cap on how many people you can refer</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Real-time Analytics</h3>
              <p className="text-sm text-muted-foreground">Track your referrals and earnings in real-time</p>
            </CardContent>
          </Card>
        </div>

        {/* Apply Form */}
        {user ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Apply Now</CardTitle>
              <CardDescription>Fill in your details to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={profile?.display_name || ""} disabled />
              </div>
              <div>
                <Label>M-Pesa Phone (for payouts)</Label>
                <Input
                  placeholder="254..."
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={() => apply.mutate()} disabled={apply.isPending}>
                {apply.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">Please sign in to apply for the affiliate program.</p>
              <Button onClick={() => navigate("/")}>Sign In</Button>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AffiliateApply;
