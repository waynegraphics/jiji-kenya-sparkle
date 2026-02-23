import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
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
} from "lucide-react";

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
      
      <PageHero
        title="Quick Links"
        subtitle="Find everything you need quickly and easily"
        badge="Quick Navigation"
        badgeIcon={LinkIcon}
        breadcrumbLabel="Quick Links"
      />

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
                { name: "Electronics", slug: "electronics" },
                { name: "Fashion", slug: "fashion" },
                { name: "Phones & Tablets", slug: "phones-tablets" },
                { name: "Vehicles", slug: "vehicles" },
                { name: "Property", slug: "property" },
                { name: "Furniture & Appliances", slug: "furniture-appliances" },
                { name: "Jobs", slug: "jobs" },
                { name: "Services", slug: "services" },
              ].map((category) => (
                <Link
                  key={category.slug}
                  to={`/category/${category.slug}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors text-center p-3 rounded-lg hover:bg-muted/50"
                >
                  {category.name}
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
