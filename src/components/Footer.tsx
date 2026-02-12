import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-card py-10">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 mb-8">
          {/* About & Company */}
          <div>
            <h3 className="text-lg font-bold text-card mb-4">About APA Bazaar</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link to="/about-us" className="hover:text-card transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-card transition-colors">Careers</Link></li>
              <li><Link to="/blog" className="hover:text-card transition-colors">Blog</Link></li>
              <li><Link to="/quick-links" className="hover:text-card transition-colors">Quick Links</Link></li>
            </ul>
          </div>

          {/* Support & Help */}
          <div>
            <h3 className="text-lg font-bold text-card mb-4">Support & Help</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link to="/contact-us" className="hover:text-card transition-colors">Contact Us</Link></li>
              <li><Link to="/faqs" className="hover:text-card transition-colors">FAQs</Link></li>
              <li><Link to="/safety-tips" className="hover:text-card transition-colors">Safety Tips</Link></li>
              <li><Link to="/saved-ads" className="hover:text-card transition-colors">Saved Ads</Link></li>
            </ul>
          </div>

          {/* Sellers & Marketplace */}
          <div>
            <h3 className="text-lg font-bold text-card mb-4">Sellers & Marketplace</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link to="/sellers" className="hover:text-card transition-colors">All Sellers</Link></li>
              <li><Link to="/verified-sellers" className="hover:text-card transition-colors">Verified Sellers</Link></li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h3 className="text-lg font-bold text-card mb-4">Legal & Policies</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link to="/terms-conditions" className="hover:text-card transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-card transition-colors">Privacy Policy</Link></li>
              <li><Link to="/data-protection" className="hover:text-card transition-colors">Data Protection</Link></li>
              <li><Link to="/disclaimer" className="hover:text-card transition-colors">Disclaimer</Link></li>
              <li><Link to="/copyright-infringement" className="hover:text-card transition-colors">Copyright Infringement</Link></li>
              <li><Link to="/billing-policy" className="hover:text-card transition-colors">Billing Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold text-card mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-muted">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+254 700 000 000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@apabazaar.co.ke</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Nairobi, Kenya</span>
              </li>
            </ul>
            
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="w-9 h-9 rounded-full bg-card/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-card/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-card/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-card/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-card/10 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <img src={logo} alt="APA Bazaar" className="h-8 w-auto" />
            <p className="text-sm text-muted">
              © 2026 APA Bazaar Limited. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
