import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, MapPin, CreditCard, AlertTriangle, Users, Phone, Home, ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const SafetyTips = () => {
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
                <BreadcrumbPage>Safety Tips</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <Shield className="h-5 w-5" />
              Stay Safe
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Safety Tips
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Stay safe while buying and selling on APA Bazaar. Follow these guidelines to protect yourself.
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">

          <div className="space-y-8">
            <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Meeting Safely</h2>
              </div>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>• Always meet in a public, well-lit place (e.g., a mall, police station, or busy café)</li>
                <li>• Bring a friend or family member with you</li>
                <li>• Tell someone you trust where you're going and when you expect to return</li>
                <li>• Never invite strangers to your home or go to theirs</li>
                <li>• Meet during daylight hours whenever possible</li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Payment Safety</h2>
              </div>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>• Never pay for items before seeing and inspecting them in person</li>
                <li>• Use M-Pesa for traceable payments when possible</li>
                <li>• Be wary of sellers asking for deposits or advance payments</li>
                <li>• If a deal seems too good to be true, it probably is</li>
                <li>• Keep records of all transactions and communications</li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Verifying Items</h2>
              </div>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>• Thoroughly inspect items before completing a purchase</li>
                <li>• For vehicles, request a logbook and verify ownership at NTSA</li>
                <li>• For electronics, test all features and check serial numbers</li>
                <li>• For property, verify ownership documents with a lawyer</li>
                <li>• Ask for receipts or proof of purchase from the seller</li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold">Red Flags to Watch For</h2>
              </div>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>• Prices significantly below market value</li>
                <li>• Sellers pressuring you to pay quickly or in unusual ways</li>
                <li>• Sellers refusing to meet in person or show the item</li>
                <li>• Requests for personal information (ID numbers, passwords, PINs)</li>
                <li>• Sellers who only communicate via platforms outside APA Bazaar</li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">For Sellers</h2>
              </div>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>• Confirm payment (e.g., M-Pesa confirmation) before handing over items</li>
                <li>• Don't share personal details unnecessarily</li>
                <li>• Be honest and accurate in your listings</li>
                <li>• Meet buyers in safe public places</li>
                <li>• Report suspicious buyers through our platform</li>
              </ul>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Report a Problem</h2>
              </div>
              <p className="text-muted-foreground text-sm">
                If you encounter a scam or suspicious activity, please report it immediately through the listing's "Report" button or contact our support team. We take all reports seriously and will investigate promptly.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SafetyTips;
