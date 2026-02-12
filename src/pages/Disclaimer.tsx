import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AlertTriangle, Home, ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const Disclaimer = () => {
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
                <BreadcrumbPage>Disclaimer</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <AlertTriangle className="h-5 w-5" />
              Legal Notice
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Disclaimer
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Important information about using APA Bazaar
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">

          <div className="bg-card rounded-xl p-8 shadow-sm border border-border space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">General Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                APA Bazaar ("we," "our," or "us") operates as an online marketplace platform that 
                facilitates connections between buyers and sellers. This disclaimer outlines the 
                limitations of our service and your responsibilities when using our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Platform Nature</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                APA Bazaar is a classified advertising platform. We do not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Own, sell, or purchase any items listed on our platform</li>
                <li>Guarantee the accuracy, completeness, or quality of listings</li>
                <li>Verify the authenticity, condition, or ownership of items</li>
                <li>Act as an intermediary in transactions between buyers and sellers</li>
                <li>Provide escrow services or payment processing</li>
                <li>Warrant that sellers will complete transactions or that items will meet buyers' expectations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">User Responsibility</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Users are solely responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Verifying the identity and credibility of buyers or sellers</li>
                <li>Inspecting items before purchase and confirming their condition</li>
                <li>Conducting due diligence on transactions</li>
                <li>Ensuring compliance with all applicable laws and regulations</li>
                <li>Resolving disputes directly with the other party</li>
                <li>Protecting their personal information and financial security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">No Warranty</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                APA Bazaar is provided "as is" and "as available" without warranties of any kind, 
                either express or implied, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Warranties of merchantability or fitness for a particular purpose</li>
                <li>Warranties regarding the accuracy, reliability, or availability of the platform</li>
                <li>Warranties that the platform will be uninterrupted, secure, or error-free</li>
                <li>Warranties regarding the quality, safety, or legality of items listed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To the maximum extent permitted by law, APA Bazaar, its affiliates, officers, 
                directors, employees, and agents shall not be liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Any direct, indirect, incidental, special, or consequential damages</li>
                <li>Loss of profits, revenue, data, or business opportunities</li>
                <li>Damages resulting from transactions between users</li>
                <li>Fraud, misrepresentation, or scams conducted by users</li>
                <li>Technical failures, interruptions, or errors in the platform</li>
                <li>Unauthorized access to or alteration of user data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Third-Party Content</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our platform may contain links to third-party websites, services, or content. 
                We do not endorse, control, or assume responsibility for any third-party content, 
                products, or services. Your interactions with third parties are solely between 
                you and the third party.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Prohibited Items</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Users are prohibited from listing certain items, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Illegal goods or services</li>
                <li>Counterfeit or stolen items</li>
                <li>Items that infringe on intellectual property rights</li>
                <li>Hazardous materials or restricted substances</li>
                <li>Items that violate local, national, or international laws</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We reserve the right to remove any listing that violates our policies or applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to Platform</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify, suspend, or discontinue any aspect of the platform 
                at any time without notice. We are not liable for any consequences resulting from 
                such changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Jurisdiction</h2>
              <p className="text-muted-foreground leading-relaxed">
                This disclaimer is governed by the laws of Kenya. Any disputes arising from the 
                use of this platform shall be subject to the exclusive jurisdiction of the courts 
                of Kenya.
              </p>
            </section>

            <section className="bg-muted/50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">Contact</h2>
              <p className="text-muted-foreground">
                If you have questions about this disclaimer, please contact us at{" "}
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

export default Disclaimer;
