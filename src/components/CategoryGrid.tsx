import { useNavigate } from "react-router-dom";
import {
  Car, Home, Smartphone, Shirt, Wrench, Briefcase, Sofa, Dog, Baby,
  Bike, Music, HeartPulse, Wheat, HardHat, Gamepad2, LucideIcon, Laptop, Sparkles, Factory, Hammer, Tractor,
} from "lucide-react";
import { useMainCategories } from "@/hooks/useCategories";
import { useCategoryCounts } from "@/hooks/useCategoryCounts";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, LucideIcon> = {
  Car, Home, Smartphone, Shirt, Wrench, Briefcase, Sofa, Dog, Baby,
  Bike, Music, HeartPulse, Wheat, HardHat, Gamepad2, Laptop, Sparkles, Factory, Hammer, Tractor,
};

const colorMap: Record<string, string> = {
  vehicles: "bg-jiji-blue",
  property: "bg-jiji-green",
  "phones-tablets": "bg-jiji-orange",
  fashion: "bg-jiji-purple",
  services: "bg-jiji-teal",
  jobs: "bg-jiji-yellow",
  "furniture-appliances": "bg-jiji-red",
  "animals-pets": "bg-jiji-green",
  "babies-kids": "bg-jiji-purple",
  "beauty-care": "bg-jiji-orange",
  electronics: "bg-jiji-blue",
  "commercial-equipment": "bg-jiji-teal",
  "food-agriculture": "bg-jiji-green",
  "leisure-activities": "bg-jiji-blue",
  "repair-construction": "bg-jiji-yellow",
};

const CategoryGrid = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading } = useMainCategories();
  const { data: counts } = useCategoryCounts();

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Browse Categories</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-4 text-center">
                <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
                <Skeleton className="h-4 w-20 mx-auto mb-2" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="container mx-auto">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Browse Categories</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
          {categories?.map((category) => {
            const IconComponent = iconMap[category.icon || ""] || Briefcase;
            const colorClass = colorMap[category.slug] || "bg-jiji-blue";
            const adCount = counts?.[category.id] || 0;

            return (
              <div
                key={category.id}
                onClick={() => navigate(`/category/${category.slug}`)}
                className="group cursor-pointer bg-card rounded-xl p-4 text-center shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1"
              >
                <div
                  className={`${colorClass} w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200`}
                >
                  <IconComponent className="h-6 w-6 md:h-7 md:w-7 text-white" />
                </div>
                <h3 className="text-xs md:text-sm font-semibold text-foreground line-clamp-2 leading-tight">
                  {category.name}
                </h3>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1 font-medium">
                  {adCount} {adCount === 1 ? "ad" : "ads"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
