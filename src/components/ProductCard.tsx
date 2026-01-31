import { Heart, MapPin, Clock } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  id: number;
  title: string;
  price: string;
  location: string;
  time: string;
  image: string;
  isFeatured?: boolean;
  isUrgent?: boolean;
}

const ProductCard = ({
  title,
  price,
  location,
  time,
  image,
  isFeatured = false,
  isUrgent = false,
}: ProductCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 cursor-pointer">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isFeatured && (
            <span className="bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded">
              FEATURED
            </span>
          )}
          {isUrgent && (
            <span className="bg-secondary text-secondary-foreground text-[10px] font-semibold px-2 py-0.5 rounded">
              URGENT
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isFavorite ? "fill-jiji-red text-jiji-red" : "text-muted-foreground"
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 md:p-4">
        <h3 className="font-semibold text-foreground text-sm md:text-base line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]">
          {title}
        </h3>
        <p className="text-lg md:text-xl font-bold text-primary mt-1">
          {price}
        </p>
        <div className="flex items-center justify-between mt-2 text-muted-foreground">
          <div className="flex items-center gap-1 text-xs">
            <MapPin className="h-3 w-3" />
            <span className="truncate max-w-[80px]">{location}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3" />
            <span>{time}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;