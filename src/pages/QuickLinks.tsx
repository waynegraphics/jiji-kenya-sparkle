import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { 
  Link as LinkIcon, 
  ShoppingBag, 
  Store, 
  Shield, 
  HelpCircle,
  FileText,
  CreditCard,
  Users,
  BookOpen,
  Briefcase,
  Lock,
  Home,
  ChevronRight
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const QuickLinks = () => {
  const linkCategories = [
    {
      title: "Shopping & Selling",
      icon: ShoppingBag,
      links: [
        { name: "Browse All Categories", path: "/search" },
        { name: "Post an Ad", path: "/post-ad" },
        { name: "My Ads", path: "/my-ads" },
        { name: "Saved Ads", path: "/saved-ads" },
        { name: "Pricing", path: "/pricing" },
      ],
    },
    {
      title: "Sellers",
      icon: Store,
      links: [
        { name: "All Sellers", path: "/sellers" },
        { name: "Verified Sellers", path: "/verified-sellers" },
        { name: "Seller Dashboard", path: "/seller-dashboard" },
        { name: "Become a Seller", path: "/seller-dashboard" },
      ],
    },
    {
      title: "Safety & Support",
      icon: Shield,
      links: [
        { name: "Safety Tips", path: "/safety-tips" },
        { name: "Contact Us", path: "/contact-us" },
        { name: "FAQs", path: "/faqs" },
        { name: "Report an Issue", path: "/contact-us" },
      ],
    },
    {
      title: "Legal & Policies",
      icon: FileText,
      links: [
        { name: "Terms & Conditions", path: "/terms-conditions" },
        { name: "Privacy Policy", path: "/privacy-policy" },
        { name: "Data Protection", path: "/data-protection" },
        { name: "Disclaimer", path: "/disclaimer" },
        { name: "Copyright Infringement", path: "/copyright-infringement" },
        { name: "Billing Policy", path: "/billing-policy" },
      ],
    },
    {
      title: "Company",
      icon: Users,
      links: [
        { name: "About Us", path: "/about-us" },
        { name: "Careers", path: "/careers" },
        { name: "Blog", path: "/blog" },
      ],
    },
    {
      title: "Account",
      icon: Lock,
      links: [
        { name: "Profile Settings", path: "/profile" },
        { name: "Messages", path: "/messages" },
        { name: "Favorites", path: "/favorites" },
      ],
    },
  ];

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
                <BreadcrumbPage>Quick Links</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <LinkIcon className="h-5 w-5" />
              Quick Navigation
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Quick Links
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Find everything you need quickly and easily
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xl text-muted-foreground">
              Find everything you need on APA Bazaar
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {linkCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div
                  key={index}
                  className="bg-card rounded-xl p-6 shadow-sm border border-border"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold">{category.title}</h2>
                  </div>
                  <ul className="space-y-2">
                    {category.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link
                          to={link.path}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/30"></span>
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Popular Searches */}
          <div className="mt-12 bg-card rounded-xl p-8 shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Popular Categories</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "Electronics",
                "Fashion",
                "Phones & Tablets",
                "Vehicles",
                "Property",
                "Furniture",
                "Jobs",
                "Services",
              ].map((category) => (
                <Link
                  key={category}
                  to={`/search?q=${encodeURIComponent(category)}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors text-center p-3 rounded-lg hover:bg-muted/50"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QuickLinks;
