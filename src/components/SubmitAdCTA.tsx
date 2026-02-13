import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/AuthModal";
import ctaImage from "@/assets/cta-megaphone.png";

const SubmitAdCTA = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("register");

  const handleAuth = (tab: "login" | "register") => {
    if (user) {
      navigate("/seller-dashboard/post-ad");
    } else {
      setAuthTab(tab);
      setIsAuthOpen(true);
    }
  };

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div
          className="rounded-3xl overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
          }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 p-6 md:p-10 lg:p-14">
            <div className="flex-1 text-center md:text-left order-2 md:order-1">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4">
                Submit Your Ads
              </h2>
              <p className="text-white/90 text-sm md:text-base lg:text-lg leading-relaxed mb-6 max-w-lg">
                Reach thousands of ready buyers across Kenya in just minutes. Simple steps, clear photos, fast approval within 24 hours. Get inquiries the same day!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Button
                  size="lg"
                  className="bg-white text-primary font-bold hover:bg-white/90 rounded-full px-8"
                  onClick={() => handleAuth("register")}
                >
                  {user ? "Sell Now" : "Login / Register"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary font-bold rounded-full px-8"
                  onClick={() => handleAuth("login")}
                >
                  Start Selling
                </Button>
              </div>
            </div>
            <div className="flex-shrink-0 order-1 md:order-2">
              <img
                src={ctaImage}
                alt="Submit your ads"
                className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 object-contain object-top drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultTab={authTab} />
    </section>
  );
};

export default SubmitAdCTA;
