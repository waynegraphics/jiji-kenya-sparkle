import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText, Scale, AlertCircle, Home, ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const TermsConditions = () => {
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
                <BreadcrumbPage>Terms & Conditions</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <Scale className="h-5 w-5" />
              Legal Agreement
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Terms & Conditions
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              The rules and guidelines for using APA Bazaar
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">

          <div className="bg-card rounded-xl p-8 shadow-sm border border-border space-y-8">
            <section>
              <p className="text-muted-foreground leading-relaxed">
                These Terms and Conditions ("Terms") govern your access to and use of APA Bazaar 
                ("the Platform," "we," "our," or "us"). By accessing or using our platform, you 
                agree to be bound by these Terms. If you disagree with any part of these Terms, 
                you may not access the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By creating an account, posting a listing, or using any service on APA Bazaar, 
                you acknowledge that you have read, understood, and agree to be bound by these 
                Terms and our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To use APA Bazaar, you must:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Be at least 18 years old</li>
                <li>Have the legal capacity to enter into binding agreements</li>
                <li>Provide accurate and complete information when creating an account</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not be prohibited from using the Platform under applicable law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Account Creation</h3>
                  <p className="text-muted-foreground">
                    You are responsible for maintaining the confidentiality of your account 
                    credentials and for all activities that occur under your account.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Account Security</h3>
                  <p className="text-muted-foreground">
                    You must immediately notify us of any unauthorized use of your account or 
                    any other breach of security.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Account Termination</h3>
                  <p className="text-muted-foreground">
                    We reserve the right to suspend or terminate your account if you violate 
                    these Terms or engage in fraudulent, illegal, or harmful activities.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. User Conduct</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Post false, misleading, or fraudulent information</li>
                <li>List prohibited items (illegal goods, stolen items, etc.)</li>
                <li>Infringe on intellectual property rights</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Use the Platform for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to the Platform</li>
                <li>Interfere with or disrupt the Platform's operation</li>
                <li>Use automated systems to scrape or collect data</li>
                <li>Impersonate any person or entity</li>
                <li>Spam or send unsolicited communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Listings and Content</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Listing Requirements</h3>
                  <p className="text-muted-foreground">
                    All listings must be accurate, complete, and comply with applicable laws. 
                    You must own or have the right to sell the items you list.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Content Ownership</h3>
                  <p className="text-muted-foreground">
                    You retain ownership of content you post but grant us a license to use, 
                    display, and distribute it on the Platform.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Content Removal</h3>
                  <p className="text-muted-foreground">
                    We reserve the right to remove any content that violates these Terms or 
                    is otherwise objectionable.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Transactions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Buyer and Seller Responsibilities</h3>
                  <p className="text-muted-foreground">
                    APA Bazaar facilitates connections but is not a party to transactions. 
                    Buyers and sellers are responsible for:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                    <li>Negotiating terms and conditions</li>
                    <li>Completing transactions</li>
                    <li>Resolving disputes</li>
                    <li>Complying with applicable laws</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">No Warranty</h3>
                  <p className="text-muted-foreground">
                    We do not guarantee the quality, safety, or legality of items listed, 
                    the accuracy of listings, or that buyers or sellers will complete transactions.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Fees and Payments</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Some features on the Platform require payment. By purchasing premium features:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>You agree to pay all applicable fees</li>
                <li>Fees are non-refundable unless otherwise stated</li>
                <li>We may change fees with advance notice</li>
                <li>You are responsible for any taxes on purchases</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Platform and its content, including logos, trademarks, and software, are 
                owned by APA Bazaar or its licensors. You may not use our intellectual property 
                without our written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, APA Bazaar shall not be liable for any 
                indirect, incidental, special, or consequential damages arising from your use 
                of the Platform, including but not limited to loss of profits, data, or business 
                opportunities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify and hold harmless APA Bazaar, its affiliates, officers, 
                directors, employees, and agents from any claims, damages, losses, or expenses 
                (including legal fees) arising from your use of the Platform, violation of these 
                Terms, or infringement of any rights of another.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Dispute Resolution</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                In the event of a dispute:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Users should first attempt to resolve disputes directly</li>
                <li>We may assist in dispute resolution but are not obligated to do so</li>
                <li>Disputes between users and APA Bazaar shall be resolved through arbitration 
                or the courts of Kenya, as applicable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Modifications to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users 
                of material changes. Your continued use of the Platform after changes become 
                effective constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may suspend or terminate your access to the Platform at any time, with or 
                without cause or notice. You may also terminate your account at any time through 
                your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms are governed by the laws of Kenya. Any disputes shall be subject to 
                the exclusive jurisdiction of the courts of Kenya.
              </p>
            </section>

            <section className="bg-muted/50 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
                  <p className="text-muted-foreground">
                    If you have questions about these Terms, please contact us at{" "}
                    <a href="/contact-us" className="text-primary hover:underline">
                      support@apabazaar.co.ke
                    </a>
                    {" "}or visit our{" "}
                    <a href="/contact-us" className="text-primary hover:underline">
                      Contact Us
                    </a>
                    {" "}page.
                  </p>
                </div>
              </div>
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

export default TermsConditions;
