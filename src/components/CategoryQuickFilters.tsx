import { Link, useParams } from "react-router-dom";
import { useSubCategories, useCategoryBySlug } from "@/hooks/useCategories";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Car, Truck, Bike, Bus, Ship, Wrench, Radio, Shield,
  Home, Building, Landmark, Store, Warehouse, Key, BedDouble,
  Briefcase, GraduationCap, Stethoscope, Code, Hammer, Scale,
  Smartphone, Tablet, Watch, Headphones,
  Monitor, Tv, Camera, Gamepad, Speaker,
  Shirt, ShoppingBag, Gem, Glasses,
  Sofa, Lamp, CookingPot, WashingMachine,
  Dog, Cat, Fish, Bird,
  Baby, Blocks, BookOpen,
  Heart, Scissors, Sparkles,
  Tractor, Wheat, Apple,
  Dumbbell, Tent, Music,
  HardHat, PaintBucket, Ruler,
  Grid, Search, X, ChevronDown
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Map sub-category slugs to icons - popular ones get distinctive icons
const subCategoryIconMap: Record<string, React.ReactNode> = {
  // Vehicles
  "cars": <Car className="h-5 w-5" />,
  "trucks": <Truck className="h-5 w-5" />,
  "motorcycles": <Bike className="h-5 w-5" />,
  "buses": <Bus className="h-5 w-5" />,
  "boats": <Ship className="h-5 w-5" />,
  "spares": <Wrench className="h-5 w-5" />,
  "car-parts": <Wrench className="h-5 w-5" />,
  "car-parts-accessories": <Wrench className="h-5 w-5" />,
  "parts-accessories": <Wrench className="h-5 w-5" />,
  "car-audio": <Radio className="h-5 w-5" />,
  "car-accessories": <Shield className="h-5 w-5" />,
  // Property
  "apartments": <Building className="h-5 w-5" />,
  "houses": <Home className="h-5 w-5" />,
  "land": <Landmark className="h-5 w-5" />,
  "commercial": <Store className="h-5 w-5" />,
  "offices": <Building className="h-5 w-5" />,
  "warehouses": <Warehouse className="h-5 w-5" />,
  "rooms": <Key className="h-5 w-5" />,
  "short-stay": <BedDouble className="h-5 w-5" />,
  // Jobs
  "it-technology": <Code className="h-5 w-5" />,
  "finance-accounting": <Scale className="h-5 w-5" />,
  "healthcare": <Stethoscope className="h-5 w-5" />,
  "education": <GraduationCap className="h-5 w-5" />,
  "construction": <HardHat className="h-5 w-5" />,
  // Phones
  "smartphones": <Smartphone className="h-5 w-5" />,
  "tablets": <Tablet className="h-5 w-5" />,
  "smartwatches": <Watch className="h-5 w-5" />,
  "phone-accessories": <Headphones className="h-5 w-5" />,
  // Electronics
  "tvs": <Tv className="h-5 w-5" />,
  "laptops": <Monitor className="h-5 w-5" />,
  "cameras": <Camera className="h-5 w-5" />,
  "gaming": <Gamepad className="h-5 w-5" />,
  "audio": <Speaker className="h-5 w-5" />,
  // Fashion
  "clothing": <Shirt className="h-5 w-5" />,
  "shoes": <ShoppingBag className="h-5 w-5" />,
  "jewelry": <Gem className="h-5 w-5" />,
  "accessories": <Glasses className="h-5 w-5" />,
  // Furniture
  "living-room": <Sofa className="h-5 w-5" />,
  "bedroom": <Lamp className="h-5 w-5" />,
  "kitchen": <CookingPot className="h-5 w-5" />,
  "appliances": <WashingMachine className="h-5 w-5" />,
  // Pets
  "dogs": <Dog className="h-5 w-5" />,
  "cats": <Cat className="h-5 w-5" />,
  "fish": <Fish className="h-5 w-5" />,
  "birds": <Bird className="h-5 w-5" />,
  // Kids
  "baby-items": <Baby className="h-5 w-5" />,
  "toys": <Blocks className="h-5 w-5" />,
  "school-supplies": <BookOpen className="h-5 w-5" />,
  // Beauty
  "skincare": <Heart className="h-5 w-5" />,
  "haircare": <Scissors className="h-5 w-5" />,
  "makeup": <Sparkles className="h-5 w-5" />,
  // Agriculture
  "farming": <Tractor className="h-5 w-5" />,
  "crops": <Wheat className="h-5 w-5" />,
  "fruits": <Apple className="h-5 w-5" />,
  // Leisure
  "sports": <Dumbbell className="h-5 w-5" />,
  "camping": <Tent className="h-5 w-5" />,
  "instruments": <Music className="h-5 w-5" />,
  // Construction
  "materials": <HardHat className="h-5 w-5" />,
  "paint": <PaintBucket className="h-5 w-5" />,
  "tools": <Ruler className="h-5 w-5" />,
};

const getSubCategoryIcon = (slug: string) => {
  if (subCategoryIconMap[slug]) return subCategoryIconMap[slug];
  for (const [key, icon] of Object.entries(subCategoryIconMap)) {
    if (slug.includes(key) || key.includes(slug)) return icon;
  }
  return <Grid className="h-5 w-5" />;
};

const MOBILE_VISIBLE_COUNT = 0;

interface CategoryQuickFiltersProps {
  categorySlug?: string;
  currentSubSlug?: string;
}

const CategoryQuickFilters = ({ categorySlug, currentSubSlug }: CategoryQuickFiltersProps) => {
  const { data: mainCategory } = useCategoryBySlug(categorySlug);
  const { data: subCategories } = useSubCategories(mainCategory?.id);
  const [searchTerm, setSearchTerm] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const isMobile = useIsMobile();

  const { data: subCategoryCounts } = useQuery({
    queryKey: ["sub-category-counts", mainCategory?.id],
    queryFn: async () => {
      if (!mainCategory?.id) return {};
      const { data, error } = await supabase
        .from("base_listings")
        .select("sub_category_id")
        .eq("main_category_id", mainCategory.id)
        .eq("status", "active");
      if (error) return {};
      const counts: Record<string, number> = {};
      data?.forEach(l => {
        if (l.sub_category_id) {
          counts[l.sub_category_id] = (counts[l.sub_category_id] || 0) + 1;
        }
      });
      return counts;
    },
    enabled: !!mainCategory?.id,
    staleTime: 1000 * 60 * 5,
  });

  if (!subCategories || subCategories.length === 0) return null;

  const filteredSubs = searchTerm 
    ? subCategories.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : subCategories;

  const showMobilePopup = isMobile && subCategories.length > MOBILE_VISIBLE_COUNT;
  const activeSubName = currentSubSlug 
    ? subCategories.find(s => s.slug === currentSubSlug)?.name 
    : "All";

  // Render a single sub-category link item
  const renderSubItem = (sub: any, isActive: boolean, compact = false) => {
    const count = subCategoryCounts?.[sub.id] || 0;
    return (
      <Link
        key={sub.id}
        to={`/category/${categorySlug}/${sub.slug}`}
        onClick={() => sheetOpen && setSheetOpen(false)}
        className={`flex ${compact ? "flex-row items-center gap-3 p-3 rounded-lg" : "flex-col items-center gap-1.5 p-3 rounded-xl"} border text-center transition-all hover:shadow-md ${
          isActive
            ? "bg-primary/10 border-primary text-primary"
            : "bg-card border-border hover:border-primary/50"
        }`}
      >
        {getSubCategoryIcon(sub.slug)}
        <span className={`${compact ? "text-sm" : "text-xs"} font-medium leading-tight ${compact ? "" : "line-clamp-2"}`}>{sub.name}</span>
        {count > 0 && (
          <span className={`${compact ? "ml-auto text-xs" : "text-[10px]"} text-muted-foreground`}>{count} ads</span>
        )}
      </Link>
    );
  };

  // Mobile: just show a button that opens the full list in a bottom sheet
  if (showMobilePopup) {
    return (
      <div className="mb-4">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-between h-10">
              <span className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
                <span className="font-medium">{activeSubName}</span>
              </span>
              <span className="flex items-center gap-1 text-muted-foreground text-xs">
                {subCategories.length} subcategories
                <ChevronDown className="h-4 w-4" />
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
            <SheetHeader className="pb-2">
              <SheetTitle>Browse {mainCategory?.name} Categories</SheetTitle>
            </SheetHeader>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search in ${mainCategory?.name || "category"}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <ScrollArea className="h-[calc(70vh-120px)]">
              <div className="space-y-1 pr-4">
                <Link
                  to={`/category/${categorySlug}`}
                  onClick={() => setSheetOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    !currentSubSlug 
                      ? "bg-primary/10 border-primary text-primary" 
                      : "bg-card border-border hover:border-primary/50"
                  }`}
                >
                  <Grid className="h-5 w-5" />
                  <span className="text-sm font-medium">All Categories</span>
                </Link>
                {filteredSubs.map((sub) => renderSubItem(sub, currentSubSlug === sub.slug, true))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Desktop / tablet with few categories: show full grid
  return (
    <div className="mb-6">
      {/* Search within sub-categories */}
      {subCategories.length > 8 && (
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search in ${mainCategory?.name || "category"}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          {searchTerm && (
            <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Sub-category grid with icons */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        <Link
          to={`/category/${categorySlug}`}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all hover:shadow-md ${
            !currentSubSlug 
              ? "bg-primary/10 border-primary text-primary" 
              : "bg-card border-border hover:border-primary/50"
          }`}
        >
          <Grid className="h-5 w-5" />
          <span className="text-xs font-medium leading-tight">All</span>
        </Link>
        {filteredSubs.map((sub) => renderSubItem(sub, currentSubSlug === sub.slug))}
      </div>
    </div>
  );
};

export default CategoryQuickFilters;
