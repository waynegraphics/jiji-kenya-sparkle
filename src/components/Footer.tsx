import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-card py-10">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold text-card mb-4">About Jiji</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="#" className="hover:text-card transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-card transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-card transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-card transition-colors">Terms of Use</a></li>
              <li><a href="#" className="hover:text-card transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold text-card mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="#" className="hover:text-card transition-colors">Safety Tips</a></li>
              <li><a href="#" className="hover:text-card transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-card transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-card transition-colors">Sitemap</a></li>
            </ul>
          </div>

          {/* Regions */}
          <div>
            <h3 className="text-lg font-bold text-card mb-4">Our Regions</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="#" className="hover:text-card transition-colors">Nairobi</a></li>
              <li><a href="#" className="hover:text-card transition-colors">Mombasa</a></li>
              <li><a href="#" className="hover:text-card transition-colors">Kisumu</a></li>
              <li><a href="#" className="hover:text-card transition-colors">Nakuru</a></li>
              <li><a href="#" className="hover:text-card transition-colors">All Regions</a></li>
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
                <span>support@jiji.co.ke</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Nairobi, Kenya</span>
              </li>
            </ul>
            
            {/* Social Links */}
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
            <div className="text-2xl font-extrabold text-card">
              jiji<span className="text-primary text-sm ml-1">.co.ke</span>
            </div>
            <p className="text-sm text-muted">
              © 2025 Jiji Kenya. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;