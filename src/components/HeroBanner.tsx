import { Shield, Truck, HeadphonesIcon, CheckCircle, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import AjaxSearch from "./AjaxSearch";
import { useState } from "react";

const features = [
  { icon: Shield, title: "Safe & Secure", description: "Verified sellers" },
  { icon: Truck, title: "Fast Delivery", description: "Across Kenya" },
  { icon: HeadphonesIcon, title: "24/7 Support", description: "Always here to help" },
  { icon: CheckCircle, title: "Quality Assured", description: "Best products only" },
];

const locations = [
  "All Kenya", "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi", "Kitale", "Garissa"
];

const HeroBanner = () => {
  const [selectedLocation, setSelectedLocation] = useState("All Kenya");
  const [showLocations, setShowLocations] = useState(false);

  return (
    <section className="bg-gradient-to-br from-primary via-jiji-green-dark to-primary py-10 md:py-16">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl font-extrabold text-primary-foreground mb-3">
            Buy & Sell Anything in Kenya
          </h1>
          <p className="text-primary-foreground/80 text-sm md:text-lg max-w-2xl mx-auto">
            Kenya's largest marketplace with over 2 million listings. Find great deals near you!
          </p>
        </div>

        {/* Search Bar + Location - Desktop */}
        <div className="hidden md:flex max-w-3xl mx-auto mb-8 gap-2">
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowLocations(!showLocations)}
              className="h-12 px-4 bg-card border-border text-foreground gap-1 min-w-[140px] justify-between"
            >
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="truncate">{selectedLocation}</span>
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            </Button>
            {showLocations && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 w-48 max-h-64 overflow-y-auto">
                {locations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => { setSelectedLocation(loc); setShowLocations(false); }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors ${
                      selectedLocation === loc ? "text-primary font-semibold bg-primary/5" : "text-foreground"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>
          <AjaxSearch className="flex-1" inputClassName="h-12 rounded-lg" />
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-card/20 transition-colors"
            >
              <feature.icon className="h-8 w-8 text-secondary mx-auto mb-2" />
              <h3 className="font-semibold text-primary-foreground text-sm">
                {feature.title}
              </h3>
              <p className="text-primary-foreground/70 text-xs mt-1">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
