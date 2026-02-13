import { forwardRef } from "react";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const useFooterSettings = () => {
  return useQuery({
    queryKey: ["footer-settings"],
    queryFn: async () => {
      const keys = [
        "contact_email", "contact_phone", "contact_address",
        "copyright_text", "support_email",
        "social_facebook", "social_twitter", "social_instagram", "social_youtube", "social_tiktok",
      ];
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

const Footer = forwardRef<HTMLElement, object>((_, ref) => {
  const { data: settings } = useFooterSettings();

  const phone = settings?.contact_phone || "+254 700 000 000";
  const email = settings?.contact_email || settings?.support_email || "support@apabazaar.co.ke";
  const address = settings?.contact_address || "Nairobi, Kenya";
  const copyright = settings?.copyright_text || `© ${new Date().getFullYear()} APA Bazaar. All rights reserved.`;

  const socials = [
    { key: "social_facebook", icon: Facebook, label: "Facebook" },
    { key: "social_twitter", icon: Twitter, label: "X (Twitter)" },
    { key: "social_instagram", icon: Instagram, label: "Instagram" },
    { key: "social_youtube", icon: Youtube, label: "YouTube" },
  ].filter((s) => settings?.[s.key]);

  return (
    <footer ref={ref} className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Column 1 — Brand & Contact */}
          <div className="space-y-5">
            <Link to="/" className="inline-block">
              <img src={logo} alt="APA Bazaar" className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kenya's trusted marketplace for buying and selling everything — vehicles, property, electronics, fashion and more.
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-foreground transition-colors">{phone}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-foreground transition-colors">{email}</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{address}</span>
              </li>
            </ul>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/about-us" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/contact-us" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/faqs" className="hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link to="/safety-tips" className="hover:text-primary transition-colors">Safety Tips</Link></li>
            </ul>
          </div>

          {/* Column 3 — Marketplace */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Marketplace</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/sellers" className="hover:text-primary transition-colors">All Sellers</Link></li>
              <li><Link to="/verified-sellers" className="hover:text-primary transition-colors">Verified Sellers</Link></li>
              <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link to="/favorites" className="hover:text-primary transition-colors">Saved Ads</Link></li>
              <li><Link to="/quick-links" className="hover:text-primary transition-colors">Quick Links</Link></li>
            </ul>
          </div>

          {/* Column 4 — Legal & Socials */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/terms-conditions" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/data-protection" className="hover:text-primary transition-colors">Data Protection</Link></li>
              <li><Link to="/disclaimer" className="hover:text-primary transition-colors">Disclaimer</Link></li>
              <li><Link to="/billing-policy" className="hover:text-primary transition-colors">Billing Policy</Link></li>
            </ul>

            {/* Social Icons */}
            {socials.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider">Follow Us</h4>
                <div className="flex items-center gap-2.5">
                  {socials.map((s) => (
                    <a
                      key={s.key}
                      href={settings?.[s.key] || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <s.icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground text-center sm:text-left">{copyright}</p>
          <p className="text-xs text-muted-foreground">
            <a href={`mailto:${email}`} className="hover:text-primary transition-colors">{email}</a>
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
