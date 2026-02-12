import { Heart, MapPin, Clock, Crown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TierInfo {
  name: string;
  badge_label: string | null;
  badge_color: string;
  border_style: string;
  shadow_intensity: string;
  ribbon_text: string | null;
}

interface ProductCardProps {
  id: string;
  title: string;
  price: string;
  location: string;
  time: string;
  image: string;
  isFeatured?: boolean;
  isUrgent?: boolean;
  isFavorited?: boolean;
  onFavoriteChange?: () => void;
  tier?: TierInfo | null;
  isPromoted?: boolean;
}

const ProductCard = ({
  id, title, price, location, time, image,
  isFeatured = false, isUrgent = false, isFavorited = false,
  onFavoriteChange, tier, isPromoted = false,
}: ProductCardProps) => {
  const [isFavorite, setIsFavorite] = useState(isFavorited);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { toast.error("Please login to save favorites"); return; }
    try {
      if (isFavorite) {
        await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", id);
        setIsFavorite(false); toast.success("Removed from favorites");
      } else {
        await supabase.from("favorites").insert({ user_id: user.id, listing_id: id });
        setIsFavorite(true); toast.success("Added to favorites");
      }
      onFavoriteChange?.();
    } catch { toast.error("Failed to update favorites"); }
  };

  const hasTier = tier && tier.badge_label && tier.name !== "Free";
  const cardStyle: React.CSSProperties = {};
  if (hasTier) {
    if (tier.border_style && tier.border_style !== "none") cardStyle.border = tier.border_style;
    if (tier.shadow_intensity && tier.shadow_intensity !== "none") cardStyle.boxShadow = tier.shadow_intensity;
  }

  return (
    <div
      className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 cursor-pointer relative"
      style={cardStyle}
      onClick={() => navigate(`/listing/${id}`)}
    >
      {/* Tier Ribbon */}
      {hasTier && tier.ribbon_text && (
        <div className="absolute top-0 right-0 z-10 px-2 py-0.5 text-[10px] font-bold text-white rounded-bl-lg"
          style={{ backgroundColor: tier.badge_color }}>
          {tier.ribbon_text}
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isPromoted && (
            <span className="bg-orange-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded">PROMOTED</span>
          )}
          {isFeatured && (
            <span className="bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded">FEATURED</span>
          )}
          {isUrgent && (
            <span className="bg-secondary text-secondary-foreground text-[10px] font-semibold px-2 py-0.5 rounded">URGENT</span>
          )}
          {hasTier && tier.badge_label && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-0.5 text-white"
              style={{ backgroundColor: tier.badge_color }}>
              <Crown className="h-3 w-3" />{tier.badge_label}
            </span>
          )}
        </div>

        <button onClick={handleFavoriteClick}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
          style={hasTier && tier.ribbon_text ? { top: '1.75rem' } : undefined}>
          <Heart className={`h-4 w-4 transition-colors ${isFavorite ? "fill-jiji-red text-jiji-red" : "text-muted-foreground"}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 md:p-4">
        <h3 className="font-semibold text-foreground text-sm md:text-base line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]">{title}</h3>
        <p className="text-lg md:text-xl font-bold text-primary mt-1">{price}</p>
        <div className="flex items-center justify-between mt-2 text-muted-foreground">
          <div className="flex items-center gap-1 text-xs"><MapPin className="h-3 w-3" /><span className="truncate max-w-[80px]">{location}</span></div>
          <div className="flex items-center gap-1 text-xs"><Clock className="h-3 w-3" /><span>{time}</span></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
