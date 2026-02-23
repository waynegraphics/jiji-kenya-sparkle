import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { Mail, Phone, MapPin, Send, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const useContactSettings = () => {
  return useQuery({
    queryKey: ["contact-settings"],
    queryFn: async () => {
      const keys = ["contact_email", "contact_phone", "contact_address", "contact_whatsapp", "support_email"];
      const { data } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", keys);
      const map: Record<string, string> = {};
      data?.forEach((row) => { map[row.key] = row.value; });
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });
};

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: settings } = useContactSettings();

  const phone = settings?.contact_phone || "+254 700 000 000";
  const email = settings?.contact_email || settings?.support_email || "support@apabazaar.co.ke";
  const address = settings?.contact_address || "Nairobi, Kenya";
  const whatsapp = settings?.contact_whatsapp || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("contact_submissions" as any)
        .insert({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        });

      if (error) throw error;

      toast.success("Message sent! We'll get back to you within 24 hours.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <PageHero
        title="Contact Us"
        subtitle="We're here to help! Get in touch with our support team"
        badge="Get in Touch"
        badgeIcon={MessageSquare}
        breadcrumbLabel="Contact Us"
      />

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Contact Information */}
            <div className="space-y-6">
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-sm text-muted-foreground">Call us during business hours</p>
                  </div>
                </div>
                <a href={`tel:${phone}`} className="text-primary font-medium hover:underline">{phone}</a>
                <p className="text-xs text-muted-foreground mt-1">Mon-Fri: 8:00 AM - 6:00 PM EAT</p>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-sm text-muted-foreground">Send us an email anytime</p>
                  </div>
                </div>
                <a href={`mailto:${email}`} className="text-primary font-medium hover:underline">{email}</a>
                <p className="text-xs text-muted-foreground mt-1">We respond within 24 hours</p>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Address</h3>
                    <p className="text-sm text-muted-foreground">Visit our office</p>
                  </div>
                </div>
                <p className="text-foreground">{address}</p>
                <p className="text-xs text-muted-foreground mt-1">By appointment only</p>
              </div>

              {whatsapp && (
                <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">WhatsApp</h3>
                      <p className="text-sm text-muted-foreground">Chat with us on WhatsApp</p>
                    </div>
                  </div>
                  <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">{whatsapp}</a>
                  <p className="text-xs text-muted-foreground mt-1">Available during business hours</p>
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Send us a Message</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    placeholder="What is this regarding?"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    placeholder="Tell us how we can help..."
                    rows={5}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* FAQ Link */}
          <div className="bg-muted/50 rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-2">
              Looking for quick answers? Check out our
            </p>
            <Link to="/faqs" className="text-primary font-semibold hover:underline">
              Frequently Asked Questions
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactUs;
