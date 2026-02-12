import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Send, MessageSquare, Home, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

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
                <BreadcrumbPage>Contact Us</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <MessageSquare className="h-5 w-5" />
              Get in Touch
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              We're here to help! Get in touch with our team for any questions or support.
            </p>
          </div>
        </div>
      </section>

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
                <p className="text-primary font-medium">+254 700 000 000</p>
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
                <p className="text-primary font-medium">support@apabazaar.co.ke</p>
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
                <p className="text-foreground">Nairobi, Kenya</p>
                <p className="text-xs text-muted-foreground mt-1">By appointment only</p>
              </div>
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
                    "Sending..."
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
