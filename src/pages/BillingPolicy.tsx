import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CreditCard, DollarSign, RefreshCw, XCircle, Home, ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const BillingPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Modern Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 border-b overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>Billing Policy</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Billing Policy
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Understanding payments, subscriptions, and refunds on APA Bazaar
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">

          <div className="bg-card rounded-xl p-8 shadow-sm border border-border space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Payment Methods</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We accept the following payment methods for premium features and subscriptions:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>M-Pesa (Mobile Money)</li>
                <li>Credit and Debit Cards (Visa, Mastercard)</li>
                <li>Bank Transfer</li>
                <li>Other payment methods as may be added from time to time</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Pricing and Fees</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Free Features</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Creating basic listings</li>
                    <li>• Browsing and searching listings</li>
                    <li>• Contacting sellers</li>
                    <li>• Saving favorite listings</li>
                  </ul>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Premium Features</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Featured listing placements</li>
                    <li>• Urgent listing tags</li>
                    <li>• Subscription packages for sellers</li>
                    <li>• Bump packages to refresh listings</li>
                    <li>• Analytics and advanced seller tools</li>
                  </ul>
                </div>
              </div>
              <p className="text-muted-foreground mt-4">
                All prices are displayed in Kenyan Shillings (KES) and are subject to change. 
                We will notify users of any price changes in advance.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <RefreshCw className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Subscriptions</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Subscription Plans</h3>
                  <p className="text-muted-foreground mb-4">
                    We offer various subscription plans for sellers with different features and benefits. 
                    Subscription details, pricing, and features are available on our Pricing page.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Auto-Renewal</h3>
                  <p className="text-muted-foreground mb-4">
                    Subscriptions automatically renew at the end of each billing period unless cancelled. 
                    You will be charged the subscription fee on the renewal date.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Cancellation</h3>
                  <p className="text-muted-foreground">
                    You can cancel your subscription at any time through your account settings. 
                    Cancellation takes effect at the end of the current billing period. You will 
                    continue to have access to premium features until the period ends.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Refunds</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Refund Eligibility</h3>
                  <p className="text-muted-foreground mb-4">
                    Refund policies vary by product type:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>
                      <strong className="text-foreground">One-time purchases:</strong> Generally 
                      non-refundable once the service has been provided (e.g., featured listing 
                      has been activated).
                    </li>
                    <li>
                      <strong className="text-foreground">Subscriptions:</strong> Refunds may be 
                      available for unused portions if cancelled within 7 days of purchase, 
                      subject to our discretion.
                    </li>
                    <li>
                      <strong className="text-foreground">Technical issues:</strong> If you 
                      experience technical problems that prevent you from using a paid feature, 
                      contact support for assistance.
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Refund Process</h3>
                  <p className="text-muted-foreground mb-4">
                    To request a refund:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Contact our support team at support@apabazaar.co.ke</li>
                    <li>Provide your order number and reason for refund</li>
                    <li>We will review your request within 5-7 business days</li>
                    <li>If approved, refunds will be processed to your original payment method within 14 business days</li>
                  </ol>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Note:</strong> Refunds are processed in 
                    the same currency and method as the original payment. Processing times may 
                    vary depending on your payment provider.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Billing Disputes</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you notice an unauthorized charge or billing error:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                <li>Contact us immediately at support@apabazaar.co.ke</li>
                <li>Provide details of the charge, including date and amount</li>
                <li>We will investigate and respond within 5 business days</li>
                <li>If the charge was in error, we will issue a refund</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Taxes</h2>
              <p className="text-muted-foreground leading-relaxed">
                All prices are exclusive of applicable taxes. You are responsible for any taxes 
                (including VAT, sales tax, or other applicable taxes) that may be levied on your 
                purchases, as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Currency</h2>
              <p className="text-muted-foreground leading-relaxed">
                All transactions are processed in Kenyan Shillings (KES). If you use a payment 
                method in a different currency, your bank or payment provider will convert the 
                amount at their exchange rate, which may include additional fees.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Failed Payments</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If a payment fails:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>We will notify you via email</li>
                <li>Your subscription or feature access may be suspended until payment is successful</li>
                <li>You can update your payment method in your account settings</li>
                <li>We may retry failed payments in accordance with your payment provider's policies</li>
              </ul>
            </section>

            <section className="bg-muted/50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">Questions?</h2>
              <p className="text-muted-foreground">
                If you have questions about billing, payments, or refunds, please contact us at{" "}
                <a href="/contact-us" className="text-primary hover:underline">
                  support@apabazaar.co.ke
                </a>
                {" "}or visit our{" "}
                <a href="/contact-us" className="text-primary hover:underline">
                  Contact Us
                </a>
                {" "}page.
              </p>
            </section>

            <p className="text-sm text-muted-foreground pt-4 border-t">
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BillingPolicy;
