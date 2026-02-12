import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { Copyright, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const CopyrightInfringement = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <PageHero
        title="Copyright Infringement Policy"
        subtitle="How to report copyright violations on APA Bazaar"
        badge="Intellectual Property"
        badgeIcon={Copyright}
        breadcrumbLabel="Copyright Infringement"
      />

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">

          <div className="bg-card rounded-xl p-8 shadow-sm border border-border space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Commitment</h2>
              <p className="text-muted-foreground leading-relaxed">
                APA Bazaar respects the intellectual property rights of others and expects our users 
                to do the same. We take copyright infringement seriously and will respond promptly 
                to valid notices of alleged copyright infringement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">What is Copyright Infringement?</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Copyright infringement occurs when someone uses copyrighted material without permission 
                from the copyright owner. This includes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Using copyrighted images, text, or videos in listings without authorization</li>
                <li>Reproducing product descriptions or images from other websites</li>
                <li>Using trademarked logos or brand names without permission</li>
                <li>Creating derivative works based on copyrighted material</li>
                <li>Distributing copyrighted content without a license</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Reporting Copyright Infringement</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you believe that content on APA Bazaar infringes your copyright, please provide 
                us with the following information in writing:
              </p>
              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">1. Identification of Copyrighted Work</h3>
                  <p className="text-sm text-muted-foreground">
                    A description of the copyrighted work that you claim has been infringed, including 
                    the URL or other location where the original work can be found.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2. Identification of Infringing Material</h3>
                  <p className="text-sm text-muted-foreground">
                    The URL or specific location of the listing or content that you claim infringes 
                    your copyright.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">3. Contact Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Your name, address, telephone number, and email address where we can contact you.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">4. Statement of Good Faith</h3>
                  <p className="text-sm text-muted-foreground">
                    A statement that you have a good faith belief that the disputed use is not 
                    authorized by the copyright owner, its agent, or the law.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">5. Statement of Accuracy</h3>
                  <p className="text-sm text-muted-foreground">
                    A statement that the information in your notice is accurate and that you are 
                    the copyright owner or authorized to act on behalf of the copyright owner.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">6. Signature</h3>
                  <p className="text-sm text-muted-foreground">
                    Your physical or electronic signature (as the copyright owner or authorized agent).
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Where to Send Notices</h2>
              <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
                <p className="font-semibold mb-2">Copyright Agent</p>
                <p className="text-muted-foreground mb-1">APA Bazaar Limited</p>
                <p className="text-muted-foreground mb-1">Email: copyright@apabazaar.co.ke</p>
                <p className="text-muted-foreground">Subject: Copyright Infringement Notice</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Response Process</h2>
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground ml-4">
                <li>
                  <strong className="text-foreground">Review:</strong> We will review your notice 
                  within 5-7 business days to ensure it contains all required information.
                </li>
                <li>
                  <strong className="text-foreground">Investigation:</strong> If the notice is valid, 
                  we will investigate the alleged infringement and may contact the user who posted 
                  the content.
                </li>
                <li>
                  <strong className="text-foreground">Action:</strong> If we determine that copyright 
                  infringement has occurred, we will remove or disable access to the infringing content.
                </li>
                <li>
                  <strong className="text-foreground">Notification:</strong> We will notify the user 
                  who posted the content and provide them with your contact information if appropriate.
                </li>
                <li>
                  <strong className="text-foreground">Repeat Offenders:</strong> Users who repeatedly 
                  infringe copyrights may have their accounts suspended or terminated.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Counter-Notification</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you believe that your content was removed in error, you may submit a 
                counter-notification. Your counter-notification must include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Identification of the content that was removed</li>
                <li>A statement under penalty of perjury that you have a good faith belief the content was removed by mistake</li>
                <li>Your contact information</li>
                <li>Your consent to the jurisdiction of Kenyan courts</li>
                <li>Your physical or electronic signature</li>
              </ul>
            </section>

            <section className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive mb-2">False Claims Warning</h3>
                  <p className="text-sm text-muted-foreground">
                    Knowingly submitting a false copyright infringement notice may result in liability 
                    for damages, including costs and attorney fees. Please ensure that you have a 
                    valid claim before submitting a notice.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Trademark Infringement</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you believe that a listing infringes your trademark rights, please contact us 
                at the same address with similar information, including proof of your trademark 
                registration and details of the alleged infringement.
              </p>
            </section>

            <div className="flex justify-center pt-6">
              <Button asChild>
                <a href="/contact-us">Contact Our Copyright Agent</a>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground pt-4 border-t text-center">
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CopyrightInfringement;
