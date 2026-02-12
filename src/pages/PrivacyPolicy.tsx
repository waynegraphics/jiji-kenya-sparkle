import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Lock, Eye, User, Database, Home, ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const PrivacyPolicy = () => {
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
                <BreadcrumbPage>Privacy Policy</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <Shield className="h-5 w-5" />
              Your Privacy Matters
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              How we collect, use, and protect your personal information
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">

          <div className="bg-card rounded-xl p-8 shadow-sm border border-border space-y-8">
            <section>
              <p className="text-muted-foreground leading-relaxed">
                This Privacy Policy describes how APA Bazaar ("we," "our," or "us") collects, uses, 
                and protects your personal information when you use our platform. By using APA Bazaar, 
                you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Information We Collect</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Information You Provide</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Name, email address, phone number</li>
                    <li>Profile information and photos</li>
                    <li>Listing details, descriptions, and images</li>
                    <li>Payment information (processed securely through third-party providers)</li>
                    <li>Messages and communications with other users</li>
                    <li>Feedback, reviews, and ratings</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Automatically Collected Information</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Device information (type, operating system, browser)</li>
                    <li>IP address and location data</li>
                    <li>Usage data (pages visited, features used, time spent)</li>
                    <li>Cookies and similar tracking technologies</li>
                    <li>Search queries and preferences</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and manage your account</li>
                <li>Facilitate communication between buyers and sellers</li>
                <li>Send you service-related notifications and updates</li>
                <li>Personalize your experience and show relevant listings</li>
                <li>Detect and prevent fraud, abuse, and security issues</li>
                <li>Comply with legal obligations and enforce our terms</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Analyze usage patterns to improve our platform</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Information Sharing</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell your personal information. We may share your information only in 
                the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>
                  <strong className="text-foreground">With other users:</strong> Your profile 
                  information and listings are visible to other users as part of the platform's 
                  functionality.
                </li>
                <li>
                  <strong className="text-foreground">Service providers:</strong> We share 
                  information with trusted third-party service providers who assist us in operating 
                  our platform (e.g., payment processors, hosting services).
                </li>
                <li>
                  <strong className="text-foreground">Legal requirements:</strong> We may disclose 
                  information if required by law, court order, or government regulation.
                </li>
                <li>
                  <strong className="text-foreground">Business transfers:</strong> In the event 
                  of a merger, acquisition, or sale of assets, your information may be transferred 
                  to the new entity.
                </li>
                <li>
                  <strong className="text-foreground">With your consent:</strong> We may share 
                  information when you explicitly consent to such sharing.
                </li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Data Security</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational measures to protect your 
                personal information against unauthorized access, alteration, disclosure, or 
                destruction. However, no method of transmission over the internet or electronic 
                storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <User className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Your Rights</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Access and receive a copy of your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal information</li>
                <li>Object to or restrict processing of your information</li>
                <li>Data portability (receive your data in a structured format)</li>
                <li>Withdraw consent where processing is based on consent</li>
                <li>Lodge a complaint with relevant data protection authorities</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                To exercise these rights, please contact us at support@apabazaar.co.ke
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Remember your preferences and settings</li>
                <li>Analyze how you use our platform</li>
                <li>Provide personalized content and advertisements</li>
                <li>Improve security and prevent fraud</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                You can control cookies through your browser settings, though this may affect 
                some functionality of our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Third-Party Links</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our platform may contain links to third-party websites. We are not responsible 
                for the privacy practices of these external sites. We encourage you to review 
                their privacy policies before providing any information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our platform is not intended for users under the age of 18. We do not knowingly 
                collect personal information from children. If you believe we have collected 
                information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information for as long as necessary to provide our services, 
                comply with legal obligations, resolve disputes, and enforce our agreements. When 
                you delete your account, we will delete or anonymize your personal information, 
                except where we are required to retain it by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any 
                material changes by posting the new policy on this page and updating the "Last 
                updated" date. Your continued use of our platform after changes become effective 
                constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="bg-muted/50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy or wish to exercise your rights, 
                please contact us at{" "}
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

export default PrivacyPolicy;
