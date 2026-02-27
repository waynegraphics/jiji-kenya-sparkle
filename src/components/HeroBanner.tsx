import { Shield, BrainCircuit, HeadphonesIcon, CheckCircle } from "lucide-react";
import AjaxSearch from "./AjaxSearch";
import AISearchBar from "./AISearchBar";
import LocationPopup from "./LocationPopup";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const features = [
  { icon: Shield, title: "Safe & Secure" },
  { icon: BrainCircuit, title: "AI-Powered Search" },
  { icon: HeadphonesIcon, title: "24/7 Support" },
  { icon: CheckCircle, title: "Trusted Platform" },
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
            Kenya's most trusted marketplace with verified thousands of listings. Find great deals near you!
          </p>
        </div>

        {/* Search Bar + Location - Desktop */}
        <div className="hidden md:block max-w-3xl mx-auto mb-8">
          <Tabs defaultValue="classic" className="w-full">
            <TabsList className="grid w-48 grid-cols-2 mx-auto mb-3 bg-card/20">
              <TabsTrigger value="classic" className="text-xs text-primary-foreground data-[state=active]:bg-card/40">🔍 Classic</TabsTrigger>
              <TabsTrigger value="smart" className="text-xs text-primary-foreground data-[state=active]:bg-card/40">🧠 Smart</TabsTrigger>
            </TabsList>
            <div className="flex gap-2 items-center">
              <LocationPopup
                onSelect={handleLocationSelect}
                selectedCounty={selectedCounty}
                selectedTown={selectedTown}
              />
              <TabsContent value="smart" className="flex-1 mt-0">
                <AISearchBar />
              </TabsContent>
              <TabsContent value="classic" className="flex-1 mt-0">
                <AjaxSearch inputClassName="h-12 rounded-lg" />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Mobile Search + Location */}
        <div className="md:hidden max-w-lg mx-auto mb-6 px-2">
          <Tabs defaultValue="classic" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-2 bg-card/20">
              <TabsTrigger value="classic" className="text-xs text-primary-foreground data-[state=active]:bg-card/40">🔍 Classic</TabsTrigger>
              <TabsTrigger value="smart" className="text-xs text-primary-foreground data-[state=active]:bg-card/40">🧠 Smart Search</TabsTrigger>
            </TabsList>
            <div className="flex gap-1.5 items-center">
              <LocationPopup
                onSelect={handleLocationSelect}
                selectedCounty={selectedCounty}
                selectedTown={selectedTown}
              />
              <TabsContent value="smart" className="flex-1 mt-0">
                <AISearchBar />
              </TabsContent>
              <TabsContent value="classic" className="flex-1 mt-0">
                <AjaxSearch inputClassName="h-9 rounded-lg text-sm" />
              </TabsContent>
            </div>
          </Tabs>
        </div>

      </div>
    </section>
  );
};

export default HeroBanner;
