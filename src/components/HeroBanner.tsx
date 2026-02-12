import { Shield, Truck, HeadphonesIcon, CheckCircle } from "lucide-react";
import AjaxSearch from "./AjaxSearch";
import LocationPopup from "./LocationPopup";
import { useState } from "react";

const features = [
  { icon: Shield, title: "Safe & Secure", description: "Verified sellers" },
  { icon: Truck, title: "Fast Delivery", description: "Across Kenya" },
  { icon: HeadphonesIcon, title: "24/7 Support", description: "Always here to help" },
  { icon: CheckCircle, title: "Quality Assured", description: "Best products only" },
];

const HeroBanner = () => {
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedTown, setSelectedTown] = useState("");

  const handleLocationSelect = (county: string, town?: string) => {
    setSelectedCounty(county);
    setSelectedTown(town || "");
  };

  return (
    <section className="bg-gradient-to-br from-primary via-apa-green-dark to-primary py-10 md:py-16">
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
        <div className="hidden md:flex max-w-3xl mx-auto mb-8 gap-2 items-center">
          <LocationPopup
            onSelect={handleLocationSelect}
            selectedCounty={selectedCounty}
            selectedTown={selectedTown}
          />
          <AjaxSearch className="flex-1" inputClassName="h-12 rounded-lg" />
        </div>

        {/* Mobile Search + Location */}
        <div className="md:hidden max-w-lg mx-auto mb-6 space-y-2 px-2">
          <LocationPopup
            onSelect={handleLocationSelect}
            selectedCounty={selectedCounty}
            selectedTown={selectedTown}
          />
          <AjaxSearch inputClassName="h-10 rounded-lg" />
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
