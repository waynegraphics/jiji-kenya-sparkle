import { useNavigate } from "react-router-dom";
import {
  Car,
  Home,
  Smartphone,
  Shirt,
  Wrench,
  Briefcase,
  Sofa,
  Dog,
  Baby,
  Bike,
  Music,
  HeartPulse,
} from "lucide-react";
const categories = [
  {
    name: "Vehicles",
    icon: Car,
    color: "bg-jiji-blue",
    count: "45,200+",
    slug: "vehicles",
  },
  {
    name: "Property",
    icon: Home,
    color: "bg-jiji-green",
    count: "32,100+",
    slug: "property",
  },
  {
    name: "Phones & Tablets",
    icon: Smartphone,
    color: "bg-jiji-orange",
    count: "28,500+",
    slug: "phones",
  },
  {
    name: "Fashion",
    icon: Shirt,
    color: "bg-jiji-purple",
    count: "56,800+",
    slug: "fashion",
  },
  {
    name: "Services",
    icon: Wrench,
    color: "bg-jiji-teal",
    count: "12,300+",
    slug: "services",
  },
  {
    name: "Jobs",
    icon: Briefcase,
    color: "bg-jiji-yellow",
    count: "8,900+",
    slug: "jobs",
  },
  {
    name: "Furniture",
    icon: Sofa,
    color: "bg-jiji-red",
    count: "15,600+",
    slug: "furniture",
  },
  {
    name: "Animals & Pets",
    icon: Dog,
    color: "bg-jiji-green",
    count: "4,200+",
    slug: "pets",
  },
  {
    name: "Babies & Kids",
    icon: Baby,
    color: "bg-jiji-purple",
    count: "9,100+",
    slug: "kids",
  },
  {
    name: "Sports & Outdoors",
    icon: Bike,
    color: "bg-jiji-blue",
    count: "7,800+",
    slug: "sports",
  },
  {
    name: "Electronics",
    icon: Music,
    color: "bg-jiji-orange",
    count: "21,400+",
    slug: "electronics",
  },
  {
    name: "Health & Beauty",
    icon: HeartPulse,
    color: "bg-jiji-teal",
    count: "18,200+",
    slug: "health",
  },
];

const CategoryGrid = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (slug: string) => {
    navigate(`/search?category=${encodeURIComponent(slug)}`);
  };

  return (
    <section className="py-8">
      <div className="container mx-auto">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
          Browse Categories
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
          {categories.map((category) => (
            <div
              key={category.name}
              onClick={() => handleCategoryClick(category.slug)}
              className="group cursor-pointer bg-card rounded-xl p-4 text-center shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1"
            >
              <div
                className={`${category.color} w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200`}
              >
                <category.icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
              <h3 className="text-xs md:text-sm font-semibold text-foreground line-clamp-2 leading-tight">
                {category.name}
              </h3>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                {category.count}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;