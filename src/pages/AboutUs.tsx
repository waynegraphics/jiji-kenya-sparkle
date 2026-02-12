import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Target, Users, Shield, TrendingUp, Heart, Award, Home, ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const AboutUs = () => {
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
                <BreadcrumbPage>About Us</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <Users className="h-5 w-5" />
              Our Story
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              About APA Bazaar
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Kenya's trusted marketplace connecting buyers and sellers across the nation
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Mission Section */}
          <section className="bg-card rounded-xl p-8 shadow-sm border border-border mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">Our Mission</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              APA Bazaar is dedicated to creating a safe, reliable, and user-friendly platform that empowers 
              Kenyans to buy and sell goods and services with confidence. We believe in building a community 
              where trust, transparency, and convenience come together to make commerce accessible to everyone.
            </p>
          </section>

          {/* Values Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Trust & Safety</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  We prioritize the safety of our users through verification processes, secure transactions, 
                  and comprehensive safety guidelines.
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Community First</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  We build for and with our community, ensuring our platform serves the needs of both 
                  individual sellers and businesses across Kenya.
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Innovation</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  We continuously improve our platform with new features, better user experience, 
                  and cutting-edge technology to make buying and selling easier.
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Integrity</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  We operate with honesty, transparency, and ethical business practices in everything we do.
                </p>
              </div>
            </div>
          </section>

          {/* What We Offer Section */}
          <section className="bg-card rounded-xl p-8 shadow-sm border border-border mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">What We Offer</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <div>
                  <strong className="text-foreground">Wide Range of Categories:</strong> From electronics 
                  and fashion to vehicles and property, find everything you need in one place.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <div>
                  <strong className="text-foreground">Verified Sellers:</strong> Shop with confidence from 
                  identity-verified businesses and trusted individual sellers.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <div>
                  <strong className="text-foreground">Easy Listing:</strong> Post your items quickly with 
                  our intuitive listing process and powerful search tools.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <div>
                  <strong className="text-foreground">Secure Messaging:</strong> Communicate safely with 
                  buyers and sellers through our built-in messaging system.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <div>
                  <strong className="text-foreground">Premium Features:</strong> Boost your listings with 
                  featured placements, urgent tags, and subscription packages for sellers.
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">APA Bazaar by the Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-primary mb-2">10K+</p>
                <p className="text-sm text-muted-foreground">Active Listings</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary mb-2">5K+</p>
                <p className="text-sm text-muted-foreground">Verified Sellers</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary mb-2">50K+</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary mb-2">100+</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
            </div>
          </section>

          {/* Contact CTA */}
          <section className="text-center bg-card rounded-xl p-8 shadow-sm border border-border">
            <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
            <p className="text-muted-foreground mb-6">
              Have questions or feedback? We'd love to hear from you!
            </p>
            <Link
              to="/contact-us"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Contact Us
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;
