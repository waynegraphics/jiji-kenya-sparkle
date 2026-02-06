import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptionPackages, useAddons, useAddonTiers } from "@/hooks/useSubscriptions";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone, CreditCard, CheckCircle, XCircle } from "lucide-react";

const Checkout = () => {
  const { type, id, tierId } = useParams<{ type: string; id: string; tierId?: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const { data: packages = [] } = useSubscriptionPackages();
  const { data: addons = [] } = useAddons();
  const { data: allTiers = [] } = useAddonTiers();

  // Get the item being purchased
  const isSubscription = type === "subscription";
  const selectedPackage = isSubscription ? packages.find(p => p.id === id) : null;
  const selectedAddon = !isSubscription ? addons.find(a => a.id === id) : null;
  const selectedTier = tierId ? allTiers.find(t => t.id === tierId) : null;

  const amount = isSubscription 
    ? selectedPackage?.price || 0 
    : selectedTier?.price || 0;
  const currency = isSubscription 
    ? selectedPackage?.currency || "KES" 
    : selectedTier?.currency || "KES";
  const itemName = isSubscription 
    ? selectedPackage?.name 
    : `${selectedAddon?.name} - ${selectedTier?.name}`;

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    // Pre-fill phone from profile
    if (profile?.phone) {
      setPhoneNumber(profile.phone);
    }
  }, [user, profile, navigate]);

  // Poll for payment status
  useEffect(() => {
    if (!transactionId || paymentStatus !== "pending") return;

    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from("payment_transactions")
        .select("status")
        .eq("id", transactionId)
        .single();

      if (!error && data) {
        if (data.status === "completed") {
          setPaymentStatus("success");
          toast({
            title: "Payment Successful!",
            description: `Your ${isSubscription ? "subscription" : "add-on"} has been activated.`,
          });
        } else if (data.status === "failed") {
          setPaymentStatus("failed");
          toast({
            title: "Payment Failed",
            description: "The payment was not completed. Please try again.",
            variant: "destructive",
          });
        }
      }
    }, 3000);

    // Stop polling after 2 minutes
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (paymentStatus === "pending") {
        setPaymentStatus("idle");
        toast({
          title: "Payment Timeout",
          description: "Please check your M-Pesa messages for payment status.",
          variant: "destructive",
        });
      }
    }, 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [transactionId, paymentStatus, isSubscription, toast]);

  const handlePayment = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Required",
        description: "Please enter your M-Pesa phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setPaymentStatus("pending");

    try {
      // First, create the subscription/addon record
      let subscriptionId: string | undefined;
      let addonPurchaseId: string | undefined;

      if (isSubscription && selectedPackage) {
        const { data: subData, error: subError } = await supabase
          .from("seller_subscriptions")
          .insert({
            user_id: user!.id,
            package_id: selectedPackage.id,
            status: "pending",
            payment_status: "pending",
          })
          .select()
          .single();

        if (subError) throw subError;
        subscriptionId = subData.id;
      } else if (selectedAddon && selectedTier) {
        const { data: addonData, error: addonError } = await supabase
          .from("seller_addons")
          .insert({
            user_id: user!.id,
            addon_id: selectedAddon.id,
            tier_id: selectedTier.id,
            quantity_purchased: selectedTier.quantity,
            status: "pending",
            payment_status: "pending",
          })
          .select()
          .single();

        if (addonError) throw addonError;
        addonPurchaseId = addonData.id;
      }

      // Initiate STK Push
      const { data, error } = await supabase.functions.invoke("mpesa-stk-push", {
        body: {
          phone_number: phoneNumber,
          amount: amount,
          subscription_id: subscriptionId,
          addon_purchase_id: addonPurchaseId,
          account_reference: itemName?.substring(0, 12) || "Payment",
          transaction_desc: `Payment for ${itemName}`,
        },
      });

      if (error) throw error;

      if (data.success) {
        setTransactionId(data.transaction_id);
        toast({
          title: "Check Your Phone",
          description: "Enter your M-Pesa PIN to complete the payment.",
        });
      } else {
        throw new Error(data.error || "Failed to initiate payment");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setPaymentStatus("failed");
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number, curr: string) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: curr,
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!selectedPackage && !selectedAddon) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Item Not Found</h1>
          <Button onClick={() => navigate("/pricing")}>View Pricing</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-center mb-8">Complete Your Purchase</h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-semibold">{itemName}</p>
                  <p className="text-sm text-muted-foreground">
                    {isSubscription 
                      ? `${selectedPackage?.duration_days} days subscription`
                      : `${selectedTier?.quantity} ${selectedAddon?.type}${selectedTier?.quantity && selectedTier.quantity > 1 ? "s" : ""}`
                    }
                  </p>
                </div>
                <p className="text-xl font-bold">{formatPrice(amount, currency)}</p>
              </div>
            </CardContent>
          </Card>

          {paymentStatus === "success" ? (
            <Card className="border-green-500">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Payment Successful!</h2>
                <p className="text-muted-foreground mb-4">
                  Your {isSubscription ? "subscription" : "add-on"} has been activated.
                </p>
                <Button onClick={() => navigate("/my-ads")}>
                  Go to My Ads
                </Button>
              </CardContent>
            </Card>
          ) : paymentStatus === "failed" ? (
            <Card className="border-destructive">
              <CardContent className="pt-6 text-center">
                <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Payment Failed</h2>
                <p className="text-muted-foreground mb-4">
                  The payment was not completed. Please try again.
                </p>
                <Button onClick={() => setPaymentStatus("idle")}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  M-Pesa Payment
                </CardTitle>
                <CardDescription>
                  Enter your M-Pesa phone number to receive the payment prompt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isProcessing || paymentStatus === "pending"}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Format: 0712345678 or 254712345678
                  </p>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePayment}
                  disabled={isProcessing || paymentStatus === "pending"}
                >
                  {isProcessing || paymentStatus === "pending" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {paymentStatus === "pending" ? "Waiting for payment..." : "Processing..."}
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay {formatPrice(amount, currency)}
                    </>
                  )}
                </Button>

                {paymentStatus === "pending" && (
                  <p className="text-sm text-center text-muted-foreground">
                    Check your phone for the M-Pesa prompt and enter your PIN to complete the payment.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
