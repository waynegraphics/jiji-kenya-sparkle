import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionPackages, useAddons, useAddonTiers } from "@/hooks/useSubscriptions";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, TrendingUp, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("packages");
  
  const { data: packages = [], isLoading: packagesLoading } = useSubscriptionPackages();
  const { data: addons = [], isLoading: addonsLoading } = useAddons();
  const { data: allTiers = [] } = useAddonTiers();

  const handleSubscribe = (packageId: string) => {
    if (!user) {
      navigate("/", { state: { openAuth: true } });
      return;
    }
    navigate(`/checkout/subscription/${packageId}`);
  };

  const handlePurchaseAddon = (addonId: string, tierId: string) => {
    if (!user) {
      navigate("/", { state: { openAuth: true } });
      return;
    }
    navigate(`/checkout/addon/${addonId}/${tierId}`);
  };

  const getAddonIcon = (type: string) => {
    switch (type) {
      case "bumping":
        return <TrendingUp className="h-5 w-5" />;
      case "featured":
        return <Star className="h-5 w-5" />;
      case "promotion":
        return <Sparkles className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto py-8 px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the perfect subscription package to boost your sales and reach more customers
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="packages">Subscription Plans</TabsTrigger>
            <TabsTrigger value="addons">Add-ons</TabsTrigger>
          </TabsList>

          {/* Subscription Packages */}
          <TabsContent value="packages">
            {packagesLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : packages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No subscription packages available yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((pkg) => (
                    <Card
                      key={pkg.id}
                      className="relative overflow-hidden transition-all hover:shadow-lg"
                      style={{
                        backgroundColor: pkg.bg_color || undefined,
                        color: pkg.text_color || undefined,
                      }}
                    >
                      {pkg.is_popular && (
                        <div className="absolute top-0 right-0">
                          <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground">
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      
                      <CardHeader>
                        <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                        <CardDescription style={{ color: pkg.text_color ? `${pkg.text_color}99` : undefined }}>
                          {pkg.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="mb-6">
                          <span className="text-4xl font-bold">
                            {formatPrice(pkg.price, pkg.currency)}
                          </span>
                          <span className="text-muted-foreground ml-1">
                            / {pkg.duration_days} days
                          </span>
                        </div>
                        
                        <ul className="space-y-3">
                          <li className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-primary flex-shrink-0" />
                            <span>Up to {pkg.max_ads} ads</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-primary flex-shrink-0" />
                            <span>
                              {pkg.analytics_access ? "Full analytics access" : "Basic analytics"}
                            </span>
                          </li>
                          {pkg.allowed_categories && pkg.allowed_categories.length > 0 && (
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              <span>
                                Categories: {pkg.allowed_categories.join(", ")}
                              </span>
                            </li>
                          )}
                          <li className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-primary flex-shrink-0" />
                            <span>Priority support</span>
                          </li>
                        </ul>
                      </CardContent>
                      
                      <CardFooter>
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={() => handleSubscribe(pkg.id)}
                          style={{
                            backgroundColor: pkg.button_color || undefined,
                            color: pkg.button_text_color || undefined,
                          }}
                        >
                          Get Started
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Add-ons */}
          <TabsContent value="addons">
            {addonsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : addons.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No add-ons available yet.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {addons
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((addon) => {
                    const tiers = allTiers
                      .filter((t) => t.addon_id === addon.id)
                      .sort((a, b) => a.display_order - b.display_order);

                    return (
                      <Card
                        key={addon.id}
                        className="overflow-hidden"
                        style={{
                          backgroundColor: addon.bg_color || undefined,
                          color: addon.text_color || undefined,
                        }}
                      >
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              {getAddonIcon(addon.type)}
                            </div>
                            <div>
                              <CardTitle className="text-xl">{addon.name}</CardTitle>
                              <CardDescription style={{ color: addon.text_color ? `${addon.text_color}99` : undefined }}>
                                {addon.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          {tiers.length === 0 ? (
                            <p className="text-muted-foreground">No pricing tiers available.</p>
                          ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {tiers.map((tier) => (
                                <div
                                  key={tier.id}
                                  className="bg-background/50 rounded-lg p-4 border"
                                >
                                  <h4 className="font-semibold mb-1">{tier.name}</h4>
                                  {tier.description && (
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {tier.description}
                                    </p>
                                  )}
                                  <p className="text-lg font-bold mb-1">
                                    {formatPrice(tier.price, tier.currency)}
                                  </p>
                                  <p className="text-sm text-muted-foreground mb-3">
                                    {tier.quantity} {addon.type === "bumping" ? "bump" : addon.type}
                                    {tier.quantity > 1 ? "s" : ""}
                                  </p>
                                  <Button
                                    size="sm"
                                    className="w-full"
                                    onClick={() => handlePurchaseAddon(addon.id, tier.id)}
                                  >
                                    Purchase
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2">How does billing work?</h3>
              <p className="text-muted-foreground">
                Payments are processed securely via M-Pesa. Once payment is confirmed, your subscription or add-on is activated immediately.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2">Can I upgrade my plan?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade your subscription at any time. The new plan will take effect immediately.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2">What are add-ons?</h3>
              <p className="text-muted-foreground">
                Add-ons are optional features you can purchase to boost your listings. They work independently from your subscription.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
