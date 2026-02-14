import { useNavigate } from "react-router-dom";
import { useMainCategories } from "@/hooks/useCategories";
import { useCategoryCounts } from "@/hooks/useCategoryCounts";
import { Skeleton } from "@/components/ui/skeleton";

import categoryVehicles from "@/assets/category-vehicles.png";
import categoryProperty from "@/assets/category-property.png";
import categoryElectronics from "@/assets/category-electronics.png";
import categoryPhones from "@/assets/category-phones.png";
import categoryFurniture from "@/assets/category-furniture.png";
import categoryBabies from "@/assets/category-babies.png";
import categoryFashion from "@/assets/category-fashion.png";
import categoryServices from "@/assets/category-services.png";
import categoryJobs from "@/assets/category-jobs.png";
import categoryCommercial from "@/assets/category-commercial.png";
import categoryAgriculture from "@/assets/category-agriculture.png";
import categoryLeisure from "@/assets/category-leisure.png";
import categoryPets from "@/assets/category-pets.png";
import categoryBeauty from "@/assets/category-beauty.png";
import categoryConstruction from "@/assets/category-construction.png";

const imageMap: Record<string, string> = {
  vehicles: categoryVehicles,
  property: categoryProperty,
  electronics: categoryElectronics,
  "phones-tablets": categoryPhones,
  "furniture-appliances": categoryFurniture,
  "babies-kids": categoryBabies,
  fashion: categoryFashion,
  services: categoryServices,
  jobs: categoryJobs,
  "commercial-equipment": categoryCommercial,
  "food-agriculture": categoryAgriculture,
  "leisure-activities": categoryLeisure,
  "animals-pets": categoryPets,
  "beauty-care": categoryBeauty,
  "repair-construction": categoryConstruction,
};

const CategoryGrid = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading } = useMainCategories();
  const { data: counts } = useCategoryCounts();

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Browse Categories</h2>
        <div className="grid grid-cols-4 md:grid-cols-5 gap-1.5 sm:gap-2 md:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-36 md:h-44 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Browse Categories</h2>
        <div className="grid grid-cols-4 md:grid-cols-5 gap-1.5 sm:gap-2 md:gap-4">
          {categories?.map((category) => {
            const categoryImage = imageMap[category.slug];
            const adCount = counts?.[category.id] || 0;

            return (
              <div
                key={category.id}
                onClick={() => navigate(`/category/${category.slug}`)}
                className="group cursor-pointer relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
                }}
              >
                <div className="flex flex-col items-center justify-end h-28 md:h-44 p-2 pt-1 md:p-3 md:pt-2">
                  {categoryImage && (
                    <div className="flex-1 flex items-center justify-center w-full">
                      <img
                        src={categoryImage}
                        alt={category.name}
                        className="max-h-20 md:max-h-24 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="text-center mt-auto">
                    <h3 className="text-[10px] md:text-base font-bold text-white drop-shadow-md leading-tight">
                      {category.name}
                    </h3>
                    <p className="text-[9px] md:text-xs text-white/80 font-medium mt-0.5">
                      {adCount} {adCount === 1 ? "Ad" : "Ads"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
