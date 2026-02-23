import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import vehiclesImg from "@/assets/category-vehicles.png";
import propertyImg from "@/assets/category-property.png";
import phonesImg from "@/assets/category-phones.png";
import fashionImg from "@/assets/category-fashion.png";
import electronicsImg from "@/assets/category-electronics.png";
import furnitureImg from "@/assets/category-furniture.png";

const categories = [
  {
    title: "Vehicles",
    description: "Explore an extensive selection of vehicles across Kenya — from compact cars and family SUVs to trucks and motorcycles.",
    cta: "Explore a range of Vehicles",
    image: vehiclesImg,
    slug: "vehicles",
  },
  {
    title: "Property",
    description: "Find your dream home or investment property — apartments, houses, land, and commercial spaces across Kenya.",
    cta: "Explore wide range of Properties",
    image: propertyImg,
    slug: "property",
  },
  {
    title: "Phones & Tablets",
    description: "Discover the latest phones, tablets, and accessories — from flagship brands to budget-friendly options.",
    cta: "Explore wide range of Phones",
    image: phonesImg,
    slug: "phones-tablets",
  },
  {
    title: "Fashion",
    description: "Shop trending fashion — clothing, shoes, bags, and accessories for men, women, and kids.",
    cta: "Explore wide range of Fashion",
    image: fashionImg,
    slug: "fashion",
  },
  {
    title: "Electronics",
    description: "Browse laptops, TVs, cameras, gaming consoles, and all kinds of electronics at great prices.",
    cta: "Explore wide range of Electronics",
    image: electronicsImg,
    slug: "electronics",
  },
  {
    title: "Furniture & Décor",
    description: "Transform your space with quality furniture, home décor, and household items from trusted sellers.",
    cta: "Explore wide range of Furniture",
    image: furnitureImg,
    slug: "furniture-appliances",
  },
];

const SuperchargeSearch = () => {
  return (
    <section className="py-10 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-3">
            Supercharge your search
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-3xl mx-auto">
            Find everything you need — from jobs and homes to cars and gadgets — all in one place.
            Browse trusted listings, compare deals, and connect directly with sellers near you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="group flex items-center gap-4 md:gap-6 bg-card border border-border rounded-xl p-4 md:p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg md:text-xl font-bold text-primary mb-1.5">
                  {cat.title}
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm leading-relaxed mb-3 line-clamp-3">
                  {cat.description}
                </p>
                <span className="inline-flex items-center gap-1.5 text-secondary font-semibold text-xs md:text-sm group-hover:gap-2.5 transition-all">
                  {cat.cta}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuperchargeSearch;
