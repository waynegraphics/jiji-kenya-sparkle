import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionPackages } from "@/hooks/useSubscriptions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Check, Star, Zap, TrendingUp, Crown, Package, ArrowRight,
  Shield, Clock, BarChart3, Megaphone, ChevronDown, ChevronUp
} from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const { data: packages = [], isLoading: pkgLoading } = useSubscriptionPackages(true);

  const { data: tiers = [] } = useQuery({
    queryKey: ["listing-tiers-active"],
    queryFn: async () => {
      const { data, error } = await supabase.from("listing_tiers").select("*").eq("is_active", true).order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: bumpPackages = [] } = useQuery({
    queryKey: ["bump-packages-active"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bump_packages").select("*").eq("is_active", true).order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: promotions = [] } = useQuery({
    queryKey: ["promotion-types-active"],
    queryFn: async () => {
      const { data, error } = await supabase.from("promotion_types").select("*").eq("is_active", true).order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const fmt = (price: number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(price);

  const handleSubscribe = (packageId: string) => {
    if (!user) { navigate("/", { state: { openAuth: true } }); return; }
    navigate(`/checkout/subscription/${packageId}`);
  };

  const faqs = [
    { q: "How does billing work?", a: "Payments are processed securely via M-Pesa. Once payment is confirmed, your subscription or purchase is activated immediately." },
    { q: "Can I upgrade my plan?", a: "Yes! You can upgrade your subscription at any time. The new plan takes effect immediately and your remaining ads carry over." },
    { q: "What happens when my subscription expires?", a: "Your existing ads transition to draft status. Renew your subscription to re-activate them and continue posting new ads." },
    { q: "What are Ad Tiers?", a: "Ad Tiers (Gold, Silver, Bronze) boost your individual ad's visibility with badges, borders, and priority ranking. Higher tiers appear first in search results." },
    { q: "How do Bump Credits work?", a: "Each bump pushes your ad to the top of its tier in listings. Credits are purchased in packages and used one-at-a-time per ad." },
    { q: "What are Promotions?", a: "Promotions place your ads in premium positions like the homepage top banner, category pages, and sidebar — guaranteeing maximum exposure." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-8 px-4">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-sm px-4 py-1">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Grow Your Business
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from flexible subscription plans, boost individual ads with tiers, bump listings to the top, or get premium placements.
          </p>
        </div>

        {/* ─── PILLAR 1: Subscription Packages ─── */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10"><Package className="h-5 w-5 text-primary" /></div>
            <h2 className="text-2xl font-bold">Subscription Plans</h2>
          </div>
          <p className="text-muted-foreground mb-8 ml-12">Choose how long you want to post ads. Each plan defines your posting duration and ad limit.</p>

          {pkgLoading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : packages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No subscription plans available yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages.sort((a, b) => a.display_order - b.display_order).map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`relative overflow-hidden transition-all hover:shadow-lg ${pkg.is_popular ? "ring-2 ring-primary shadow-lg scale-[1.02]" : ""}`}
                  style={{ backgroundColor: pkg.bg_color || undefined, color: pkg.text_color || undefined }}
                >
                  {pkg.is_popular && (
                    <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center text-xs font-bold py-1">
                      ⭐ MOST POPULAR
                    </div>
                  )}
                  <CardHeader className={pkg.is_popular ? "pt-8" : ""}>
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <p className="text-sm opacity-70">{pkg.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-3xl font-extrabold">{fmt(pkg.price)}</span>
                      <span className="text-sm opacity-60 ml-1">/ {pkg.duration_days} days</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary flex-shrink-0" />Up to {pkg.max_ads} ads</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary flex-shrink-0" />{pkg.duration_days} days posting</li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        {pkg.analytics_access ? "Full analytics" : "Basic analytics"}
                      </li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary flex-shrink-0" />All categories</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => handleSubscribe(pkg.id)}
                      style={{ backgroundColor: pkg.button_color || undefined, color: pkg.button_text_color || undefined }}
                    >
                      Get Started <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>

        <Separator className="mb-20" />

        {/* ─── PILLAR 2: Ad Tiers ─── */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-yellow-500/10"><Crown className="h-5 w-5 text-yellow-600" /></div>
            <h2 className="text-2xl font-bold">Ad Tiers</h2>
          </div>
          <p className="text-muted-foreground mb-8 ml-12">Boost individual ads with Gold, Silver, or Bronze ranking. Higher tiers get priority placement, visual badges, and included Featured days.</p>

          {tiers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No tiers available yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tiers.sort((a, b) => a.display_order - b.display_order).map((tier) => (
                <Card
                  key={tier.id}
                  className="relative overflow-hidden transition-all hover:shadow-lg"
                  style={{ borderColor: tier.badge_color, borderWidth: tier.price > 0 ? 2 : 1, boxShadow: tier.shadow_intensity !== "none" ? tier.shadow_intensity : undefined }}
                >
                  {tier.ribbon_text && (
                    <div className="absolute top-0 left-0 right-0 text-center text-xs font-bold py-1 text-white" style={{ backgroundColor: tier.badge_color }}>
                      {tier.ribbon_text}
                    </div>
                  )}
                  <CardHeader className={tier.ribbon_text ? "pt-8" : ""}>
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5" style={{ color: tier.badge_color }} />
                      <CardTitle className="text-lg">{tier.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-3xl font-extrabold">{tier.price === 0 ? "Free" : fmt(tier.price)}</span>
                      {tier.price > 0 && <span className="text-sm opacity-60 ml-1">/ per ad</span>}
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 flex-shrink-0" style={{ color: tier.badge_color }} />Priority weight: {tier.priority_weight}</li>
                      {tier.included_featured_days > 0 && (
                        <li className="flex items-center gap-2"><Star className="h-4 w-4 flex-shrink-0 text-yellow-500" />{tier.included_featured_days} Featured days included</li>
                      )}
                      {tier.badge_label && (
                        <li className="flex items-center gap-2"><Shield className="h-4 w-4 flex-shrink-0" style={{ color: tier.badge_color }} />{tier.badge_label} badge on listing</li>
                      )}
                      <li className="flex items-center gap-2"><BarChart3 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />Higher search ranking</li>
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <Separator className="mb-20" />

        {/* ─── PILLAR 3: Bump Packages ─── */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10"><Zap className="h-5 w-5 text-blue-600" /></div>
            <h2 className="text-2xl font-bold">Bump Credit Packages</h2>
          </div>
          <p className="text-muted-foreground mb-8 ml-12">Purchase bump credits to push your ads to the top of their tier. Each bump refreshes your ad's position instantly.</p>

          {bumpPackages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No bump packages available yet.</p>
          ) : (
            <div className="grid sm:grid-cols-3 gap-4">
              {bumpPackages.sort((a, b) => a.display_order - b.display_order).map((bp) => (
                <Card key={bp.id} className="text-center hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="mx-auto w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                      <Zap className="h-7 w-7 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{bp.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-extrabold mb-1">{fmt(bp.price)}</p>
                    <p className="text-sm text-muted-foreground">{bp.credits} bump credits</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {fmt(Math.round(bp.price / bp.credits))}/bump
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="outline" onClick={() => {
                      if (!user) { navigate("/", { state: { openAuth: true } }); return; }
                      navigate("/seller-dashboard/billing");
                    }}>
                      Purchase
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>

        <Separator className="mb-20" />

        {/* ─── PILLAR 4: Promotions ─── */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-500/10"><Megaphone className="h-5 w-5 text-orange-600" /></div>
            <h2 className="text-2xl font-bold">Ad Promotions</h2>
          </div>
          <p className="text-muted-foreground mb-8 ml-12">Get premium placements for maximum visibility. Promoted ads appear before all other listings.</p>

          {promotions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No promotions available yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {promotions.sort((a, b) => a.display_order - b.display_order).map((promo) => {
                const placementLabels: Record<string, { label: string; icon: React.ReactNode; desc: string }> = {
                  homepage_top: { label: "Homepage Top", icon: <TrendingUp className="h-5 w-5" />, desc: "Your ad at the very top of the homepage" },
                  category_top: { label: "Category Top", icon: <Crown className="h-5 w-5" />, desc: "First position in category listings" },
                  sidebar: { label: "Sidebar", icon: <BarChart3 className="h-5 w-5" />, desc: "Persistent sidebar visibility on all pages" },
                  search_boost: { label: "Search Boost", icon: <Zap className="h-5 w-5" />, desc: "Boosted ranking in search results" },
                };
                const info = placementLabels[promo.placement] || { label: promo.placement, icon: <Megaphone className="h-5 w-5" />, desc: "" };

                return (
                  <Card key={promo.id} className="hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600 mb-2">
                        {info.icon}
                      </div>
                      <CardTitle className="text-lg">{promo.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{info.desc}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-extrabold mb-1">{fmt(promo.price)}</p>
                      <p className="text-sm text-muted-foreground">{promo.duration_days} days • Max {promo.max_ads} ads/slot</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <Separator className="mb-16" />

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left font-medium hover:bg-muted/50 transition-colors"
                >
                  {faq.q}
                  {expandedFaq === i ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {expandedFaq === i && (
                  <div className="px-4 pb-4 text-muted-foreground text-sm animate-fade-in">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
