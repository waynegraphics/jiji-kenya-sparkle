import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptionPackages } from "@/hooks/useSubscriptions";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Package, Crown, Zap, Megaphone, Star, Shield, Clock,
  BarChart3, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight,
  HelpCircle, RefreshCw, Eye, ChevronRight, Info, Layers, Target
} from "lucide-react";

const PricingDetails = () => {
  const { data: packages = [] } = useSubscriptionPackages(true);
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

  const placementLabels: Record<string, string> = {
    homepage_top: "Homepage Top Banner",
    category_top: "Category Page Top",
    sidebar: "Sidebar (All Pages)",
    search_boost: "Search Results Boost",
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-sm px-4 py-1">
            Complete Guide
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Pricing & Features Guide
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Everything you need to know about our subscriptions, ad tiers, bump credits, promotions, and how they all work together to grow your business.
          </p>
          <Link to="/pricing">
            <Button variant="outline" size="lg">
              View Plans & Purchase <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Table of Contents */}
        <Card className="mb-16 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Layers className="h-5 w-5 text-primary" /> Quick Navigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                { href: "#subscriptions", icon: <Package className="h-4 w-4" />, label: "Subscription Plans" },
                { href: "#expiry", icon: <AlertTriangle className="h-4 w-4" />, label: "What Happens When Subscriptions Expire" },
                { href: "#tiers", icon: <Crown className="h-4 w-4" />, label: "Ad Tiers (Gold, Silver, Bronze)" },
                { href: "#bumps", icon: <Zap className="h-4 w-4" />, label: "Bump Credits" },
                { href: "#promotions", icon: <Megaphone className="h-4 w-4" />, label: "Ad Promotions" },
                { href: "#how-it-works", icon: <HelpCircle className="h-4 w-4" />, label: "How It All Works Together" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium group"
                >
                  <span className="text-primary">{item.icon}</span>
                  {item.label}
                  <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ─── SECTION 1: SUBSCRIPTIONS ─── */}
        <section id="subscriptions" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">Subscription Plans</h2>
          </div>
          <Separator className="my-6" />

          <div className="space-y-6">
            <div className="bg-muted/30 rounded-xl p-6 border">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" /> What is a Subscription?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                A subscription is your <strong>foundation for posting ads</strong> on the platform. Without an active subscription, you cannot post new ads. Each subscription determines <strong>how long your ads stay live</strong> and <strong>how many ads you can post</strong> during that period. When you first try to post an ad, a free Starter Plan is automatically assigned so you can get started immediately.
              </p>
            </div>

            {packages.sort((a, b) => a.display_order - b.display_order).map((pkg) => (
              <Card key={pkg.id} className="overflow-hidden">
                <CardHeader className="pb-3" style={{ backgroundColor: pkg.bg_color || undefined, color: pkg.text_color || undefined }}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-xl flex items-center gap-2">
                      {pkg.name}
                      {pkg.is_popular && <Badge className="bg-primary text-primary-foreground text-xs">Most Popular</Badge>}
                    </CardTitle>
                    <span className="text-2xl font-extrabold">{pkg.price === 0 ? "Free" : fmt(pkg.price)}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-muted-foreground mb-4">{pkg.description}</p>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div><strong>Duration:</strong> {pkg.duration_days} days from activation</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div><strong>Ad Limit:</strong> Up to {pkg.max_ads.toLocaleString()} ads</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <BarChart3 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div><strong>Analytics:</strong> {pkg.analytics_access ? "Full dashboard access" : "Basic view counts"}</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div><strong>Categories:</strong> {pkg.allowed_categories?.length ? pkg.allowed_categories.join(", ") : "All categories included"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ─── SECTION 2: EXPIRY ─── */}
        <section id="expiry" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">What Happens When Your Subscription Expires?</h2>
          </div>
          <Separator className="my-6" />

          <div className="space-y-4">
            <Card className="border-destructive/30">
              <CardContent className="pt-6">
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-destructive font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Your Ads Move to Draft</h4>
                      <p className="text-muted-foreground text-sm">When your subscription expires, all your active listings are automatically transitioned to <strong>"draft"</strong> status. They become invisible to buyers but are <strong>not deleted</strong> — your content, images, and details are safely preserved.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-destructive font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">You Cannot Post New Ads</h4>
                      <p className="text-muted-foreground text-sm">Without an active subscription, the platform prevents new ad submissions. You'll be prompted to renew or purchase a new plan.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <RefreshCw className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Renew to Reactivate Instantly</h4>
                      <p className="text-muted-foreground text-sm">Once you purchase a new subscription, your draft ads are <strong>automatically re-published</strong> (up to the plan's ad limit). No need to re-enter any details — everything comes back exactly as it was.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Automatic Checks Every 6 Hours</h4>
                      <p className="text-muted-foreground text-sm">Our system checks subscription status every 6 hours. Expired subscriptions are detected and ads are moved to draft automatically — no manual intervention needed.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
              <p className="text-sm font-medium text-green-800 dark:text-green-200 flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span><strong>Pro Tip:</strong> Renew before your subscription expires to avoid any downtime. Your ads stay continuously visible without interruption.</span>
              </p>
            </div>
          </div>
        </section>

        {/* ─── SECTION 3: AD TIERS ─── */}
        <section id="tiers" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-yellow-500/10">
              <Crown className="h-6 w-6 text-yellow-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">Ad Tiers</h2>
          </div>
          <Separator className="my-6" />

          <div className="space-y-6">
            <div className="bg-muted/30 rounded-xl p-6 border">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Info className="h-5 w-5 text-yellow-600" /> What are Ad Tiers?
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Ad Tiers let you <strong>boost individual listings</strong> above the competition. While subscriptions control <em>whether</em> you can post, tiers control <em>how prominently</em> your ads appear. Higher tiers (Gold &gt; Silver &gt; Bronze) get priority placement in search results, visual badges, highlighted borders, and included Featured days.
              </p>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <div className="bg-background rounded-lg p-3 border">
                  <div className="font-semibold text-yellow-600 mb-1 flex items-center gap-1">
                    <Crown className="h-4 w-4" /> Priority Ranking
                  </div>
                  <p className="text-muted-foreground text-xs">Gold ads appear first, then Silver, then Bronze, then Free listings.</p>
                </div>
                <div className="bg-background rounded-lg p-3 border">
                  <div className="font-semibold text-yellow-600 mb-1 flex items-center gap-1">
                    <Shield className="h-4 w-4" /> Visual Badges
                  </div>
                  <p className="text-muted-foreground text-xs">Each tier gets a distinctive badge and border colour so buyers can spot premium listings instantly.</p>
                </div>
                <div className="bg-background rounded-lg p-3 border">
                  <div className="font-semibold text-yellow-600 mb-1 flex items-center gap-1">
                    <Star className="h-4 w-4" /> Featured Days
                  </div>
                  <p className="text-muted-foreground text-xs">Gold & Silver tiers include free Featured days, placing your ad in the Featured carousel.</p>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-xl p-6 border">
              <h3 className="font-semibold mb-3">How the Per-Set Model Works</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Each tier purchase covers a <strong>set of listings</strong>, not just one. For example, purchasing a Gold tier might give you <strong>15 ad slots</strong>. You can assign and remove tiers from individual listings as needed, reusing the slots within your purchase. When all slots are full, you'll need to either free up a slot or purchase another set.
              </p>
            </div>

            {tiers.sort((a, b) => a.display_order - b.display_order).map((tier) => {
              const name = tier.name.toLowerCase();
              const isGold = name.includes("gold");
              const isSilver = name.includes("silver");
              const isBronze = name.includes("bronze");
              const accentColor = isGold ? "#D4AF37" : isSilver ? "#888" : isBronze ? "#CD7F32" : tier.badge_color || "hsl(var(--primary))";

              return (
                <Card key={tier.id} className="overflow-hidden" style={{ borderLeft: `4px solid ${accentColor}` }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Crown className="h-5 w-5" style={{ color: accentColor }} />
                        {tier.name}
                        {tier.badge_label && (
                          <Badge style={{ backgroundColor: accentColor, color: "#fff" }} className="text-xs">
                            {tier.badge_label}
                          </Badge>
                        )}
                      </CardTitle>
                      <span className="text-2xl font-extrabold">{tier.price === 0 ? "Free" : fmt(tier.price)}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
                        <div><strong>Priority Weight:</strong> {tier.priority_weight} — higher means your ad appears first</div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div><strong>Ad Slots:</strong> Up to {tier.max_ads} listings per purchase</div>
                      </div>
                      {tier.included_featured_days > 0 && (
                        <div className="flex items-start gap-2">
                          <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <div><strong>Featured Days:</strong> {tier.included_featured_days} days included free</div>
                        </div>
                      )}
                      {tier.ribbon_text && (
                        <div className="flex items-start gap-2">
                          <Eye className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div><strong>Ribbon:</strong> "{tier.ribbon_text}" displayed on the listing card</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ─── SECTION 4: BUMPS ─── */}
        <section id="bumps" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-blue-500/10">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">Bump Credits</h2>
          </div>
          <Separator className="my-6" />

          <div className="space-y-6">
            <div className="bg-muted/30 rounded-xl p-6 border">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" /> What are Bumps?
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A <strong>bump</strong> pushes your ad to the <strong>top of its tier</strong> in listing results. Think of it like refreshing your ad — it gets a new timestamp that moves it above older listings. Bumps are purchased as <strong>credit packages</strong> and stored in your wallet. You can then spend one credit at a time on any of your active ads whenever you want a visibility boost.
              </p>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <div className="bg-background rounded-lg p-3 border text-center">
                  <Zap className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold mb-1">Buy Credits</div>
                  <p className="text-muted-foreground text-xs">Purchase bump credit packages. Larger packages = better value per bump.</p>
                </div>
                <div className="bg-background rounded-lg p-3 border text-center">
                  <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold mb-1">Bump Your Ad</div>
                  <p className="text-muted-foreground text-xs">Spend 1 credit to push any ad to the top of its category listing instantly.</p>
                </div>
                <div className="bg-background rounded-lg p-3 border text-center">
                  <Eye className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold mb-1">Get Seen First</div>
                  <p className="text-muted-foreground text-xs">Bumped ads appear before unbumped ads of the same tier level.</p>
                </div>
              </div>
            </div>

            {bumpPackages.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3 font-semibold">Package</th>
                      <th className="text-center p-3 font-semibold">Credits</th>
                      <th className="text-center p-3 font-semibold">Price</th>
                      <th className="text-center p-3 font-semibold">Per Bump</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bumpPackages.sort((a, b) => a.display_order - b.display_order).map((bp) => (
                      <tr key={bp.id} className="border-t">
                        <td className="p-3 font-medium">{bp.name}</td>
                        <td className="p-3 text-center">{bp.credits}</td>
                        <td className="p-3 text-center font-semibold">{fmt(bp.price)}</td>
                        <td className="p-3 text-center text-muted-foreground">{fmt(Math.round(bp.price / bp.credits))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span><strong>Low Credit Warning:</strong> When your bump wallet balance drops to 2 or fewer credits, you'll receive a notification so you can top up before running out.</span>
              </p>
            </div>
          </div>
        </section>

        {/* ─── SECTION 5: PROMOTIONS ─── */}
        <section id="promotions" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-orange-500/10">
              <Megaphone className="h-6 w-6 text-orange-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">Ad Promotions</h2>
          </div>
          <Separator className="my-6" />

          <div className="space-y-6">
            <div className="bg-muted/30 rounded-xl p-6 border">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Info className="h-5 w-5 text-orange-600" /> What are Promotions?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Promotions place your ads in <strong>premium, high-traffic positions</strong> across the platform — like the homepage top banner, category page headers, sidebars, and boosted search positions. Unlike tiers (which rank your ad within normal listings), promotions guarantee <strong>dedicated placement spots</strong> that stand out from regular content. Each promotion runs for a set number of days and has a limited number of ad slots.
              </p>
            </div>

            {promotions.sort((a, b) => a.display_order - b.display_order).map((promo) => (
              <Card key={promo.id} className="overflow-hidden" style={{ borderLeft: "4px solid hsl(var(--primary))" }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Megaphone className="h-5 w-5 text-orange-600" />
                      {promo.name}
                    </CardTitle>
                    <span className="text-2xl font-extrabold">{fmt(promo.price)}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Eye className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div><strong>Placement:</strong> {placementLabels[promo.placement] || promo.placement}</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div><strong>Duration:</strong> {promo.duration_days} days</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div><strong>Max Ads:</strong> {promo.max_ads} per slot</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ─── SECTION 6: HOW IT ALL WORKS TOGETHER ─── */}
        <section id="how-it-works" className="mb-20 scroll-mt-24">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">How It All Works Together</h2>
          </div>
          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="bg-muted/30 rounded-xl p-6 border">
              <div className="grid gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Start with a Subscription</h4>
                    <p className="text-muted-foreground text-sm">Choose a plan that fits your posting needs. This is your foundation — it determines your posting duration and ad limit. First-time sellers get a free Starter Plan automatically.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-yellow-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Upgrade with Ad Tiers (Optional)</h4>
                    <p className="text-muted-foreground text-sm">Want specific ads to stand out? Purchase a Gold, Silver, or Bronze tier. The tier gives your ads badges, highlighted borders, priority in search results, and included Featured days.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Bump When Needed (Optional)</h4>
                    <p className="text-muted-foreground text-sm">Buy bump credit packages and use them whenever your ad needs a visibility refresh. Great for competitive categories where new ads are posted frequently.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-orange-600">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Promote for Maximum Reach (Optional)</h4>
                    <p className="text-muted-foreground text-sm">For important listings, purchase premium promotions to guarantee placement in high-traffic areas like the homepage banner or category headers.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual summary */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-3">
                <CardTitle className="text-lg">Feature Comparison</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Feature</th>
                        <th className="text-center p-3 font-semibold">Subscription</th>
                        <th className="text-center p-3 font-semibold">Ad Tier</th>
                        <th className="text-center p-3 font-semibold">Bump</th>
                        <th className="text-center p-3 font-semibold">Promotion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { feature: "Required to post?", sub: "Yes", tier: "No", bump: "No", promo: "No" },
                        { feature: "Affects all ads?", sub: "Yes", tier: "Per ad", bump: "Per ad", promo: "Per ad" },
                        { feature: "Priority ranking", sub: "—", tier: "✓", bump: "✓", promo: "—" },
                        { feature: "Visual badges", sub: "—", tier: "✓", bump: "—", promo: "—" },
                        { feature: "Dedicated placement", sub: "—", tier: "—", bump: "—", promo: "✓" },
                        { feature: "Featured carousel", sub: "—", tier: "Gold/Silver", bump: "—", promo: "—" },
                        { feature: "Re-usable?", sub: "Duration-based", tier: "Slot-based", bump: "Credit-based", promo: "Duration-based" },
                      ].map((row, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="p-3 font-medium">{row.feature}</td>
                          <td className="p-3 text-center">{row.sub}</td>
                          <td className="p-3 text-center">{row.tier}</td>
                          <td className="p-3 text-center">{row.bump}</td>
                          <td className="p-3 text-center">{row.promo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center py-12 bg-muted/30 rounded-2xl border">
          <h2 className="text-2xl font-bold mb-3">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Choose a plan and start reaching buyers today. Upgrade anytime as your business grows.
          </p>
          <Link to="/pricing">
            <Button size="lg" className="px-8">
              View Plans & Purchase <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PricingDetails;
