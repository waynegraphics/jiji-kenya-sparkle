import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { Shield, Lock, Eye, FileCheck, AlertTriangle } from "lucide-react";

const DataProtection = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <PageHero
        title="Data Protection Policy"
        subtitle="Our commitment to protecting your personal data"
        badge="Data Protection"
        badgeIcon={Shield}
        breadcrumbLabel="Data Protection"
      />

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">

          <div className="bg-card rounded-xl p-8 shadow-sm border border-border space-y-8">
            <section>
              <p className="text-muted-foreground leading-relaxed">
                APA Bazaar is committed to protecting your personal data in accordance with the 
                Data Protection Act, 2019 of Kenya and other applicable data protection laws. 
                This Data Protection Policy explains how we collect, process, store, and protect 
                your personal information.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <FileCheck className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Legal Basis for Processing</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We process your personal data based on the following legal grounds:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>
                  <strong className="text-foreground">Consent:</strong> When you provide explicit 
                  consent for specific processing activities
                </li>
                <li>
                  <strong className="text-foreground">Contract:</strong> To perform our contract 
                  with you (providing platform services)
                </li>
                <li>
                  <strong className="text-foreground">Legal obligation:</strong> To comply with 
                  applicable laws and regulations
                </li>
                <li>
                  <strong className="text-foreground">Legitimate interests:</strong> For our 
                  legitimate business interests, such as platform security and fraud prevention
                </li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Data Security Measures</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We implement comprehensive security measures to protect your data:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security audits and assessments</li>
                <li>Employee training on data protection</li>
                <li>Incident response and breach notification procedures</li>
                <li>Regular backups and disaster recovery plans</li>
                <li>Restricted access to personal data on a need-to-know basis</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Your Data Protection Rights</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Under the Data Protection Act, 2019, you have the following rights:
              </p>
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Right of Access</h3>
                  <p className="text-sm text-muted-foreground">
                    You have the right to request a copy of the personal data we hold about you.
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Right to Rectification</h3>
                  <p className="text-sm text-muted-foreground">
                    You can request correction of inaccurate or incomplete personal data.
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Right to Erasure</h3>
                  <p className="text-sm text-muted-foreground">
                    You can request deletion of your personal data in certain circumstances.
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Right to Restrict Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    You can request that we limit how we use your personal data.
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Right to Data Portability</h3>
                  <p className="text-sm text-muted-foreground">
                    You can request a copy of your data in a structured, machine-readable format.
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Right to Object</h3>
                  <p className="text-sm text-muted-foreground">
                    You can object to processing of your personal data for certain purposes.
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Right to Withdraw Consent</h3>
                  <p className="text-sm text-muted-foreground">
                    Where processing is based on consent, you can withdraw it at any time.
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground mt-4">
                To exercise any of these rights, please contact us at support@apabazaar.co.ke
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We retain your personal data only for as long as necessary to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Fulfill the purposes for which it was collected</li>
                <li>Comply with legal, regulatory, or contractual obligations</li>
                <li>Resolve disputes and enforce our agreements</li>
                <li>Maintain security and prevent fraud</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                When data is no longer needed, we securely delete or anonymize it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Sharing and Transfers</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may share your data with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>
                  <strong className="text-foreground">Service providers:</strong> Trusted third 
                  parties who assist in platform operations (subject to strict data protection 
                  agreements)
                </li>
                <li>
                  <strong className="text-foreground">Legal authorities:</strong> When required 
                  by law or to protect our rights
                </li>
                <li>
                  <strong className="text-foreground">Business partners:</strong> With your 
                  explicit consent
                </li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We do not sell your personal data. Any data transfers outside Kenya are conducted 
                in compliance with applicable data protection laws and with appropriate safeguards.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Breach Notification</h2>
              <p className="text-muted-foreground leading-relaxed">
                In the event of a data breach that poses a risk to your rights and freedoms, 
                we will:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-4">
                <li>Notify the relevant data protection authority within 72 hours</li>
                <li>Inform affected users without undue delay</li>
                <li>Provide details of the breach and measures taken to address it</li>
                <li>Offer guidance on steps you can take to protect yourself</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Children's Data</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our platform is not intended for users under 18 years of age. We do not knowingly 
                collect personal data from children. If we become aware that we have collected 
                data from a child, we will take steps to delete it immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Complaints</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you believe we have not handled your personal data in accordance with this 
                policy or applicable law, you have the right to lodge a complaint with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Our Data Protection Officer at support@apabazaar.co.ke</li>
                <li>The Office of the Data Protection Commissioner of Kenya</li>
              </ul>
            </section>

            <section className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive mb-2">Your Responsibility</h3>
                  <p className="text-sm text-muted-foreground">
                    You are responsible for keeping your account credentials secure and for the 
                    accuracy of information you provide. Please notify us immediately if you 
                    suspect unauthorized access to your account.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-muted/50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">Contact Our Data Protection Officer</h2>
              <p className="text-muted-foreground">
                For questions about data protection or to exercise your rights, contact us at{" "}
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

export default DataProtection;
