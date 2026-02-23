import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { getPreferredCategoryId } from "@/lib/searchHistory";
import { BrainCircuit } from "lucide-react";

interface ListingTier {
  name: string;
  badge_label: string | null;
  badge_color: string;
  border_style: string;
  shadow_intensity: string;
  ribbon_text: string | null;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
  is_featured: boolean;
  is_urgent: boolean;
  created_at: string;
  tier_priority: number;
  bumped_at: string | null;
  promotion_type_id: string | null;
  promotion_expires_at: string | null;
  featured_until: string | null;
  listing_tiers: ListingTier | null;
}

const TRENDING_COUNT = 16;

const selectFields = "id, title, price, location, images, is_featured, is_urgent, created_at, tier_priority, bumped_at, promotion_type_id, promotion_expires_at, featured_until, main_category_id, listing_tiers(name, badge_label, badge_color, border_style, shadow_intensity, ribbon_text), main_category:main_categories(slug, name)";

const rankListings = (data: any[]): any[] => {
  const now = new Date().toISOString();
  return [...data].sort((a, b) => {
    const aPromoted = a.promotion_type_id && (!a.promotion_expires_at || a.promotion_expires_at > now) ? 1 : 0;
    const bPromoted = b.promotion_type_id && (!b.promotion_expires_at || b.promotion_expires_at > now) ? 1 : 0;
    if (aPromoted !== bPromoted) return bPromoted - aPromoted;

    const aFeatured = a.is_featured && (!a.featured_until || a.featured_until > now) ? 1 : 0;
    const bFeatured = b.is_featured && (!b.featured_until || b.featured_until > now) ? 1 : 0;
    if (aFeatured !== bFeatured) return bFeatured - aFeatured;

    if ((a.tier_priority || 0) !== (b.tier_priority || 0)) return (b.tier_priority || 0) - (a.tier_priority || 0);

    const aBump = a.bumped_at ? new Date(a.bumped_at).getTime() : 0;
    const bBump = b.bumped_at ? new Date(b.bumped_at).getTime() : 0;
    if (aBump !== bBump) return bBump - aBump;

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};

const FeaturedListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isPersonalized, setIsPersonalized] = useState(false);
  const { user } = useAuth();

  const fetchListings = async () => {
    const preferredCategoryId = getPreferredCategoryId();
    let finalListings: any[] = [];

    if (preferredCategoryId) {
      // First: fetch from preferred category
      const { data: catData } = await supabase
        .from("base_listings")
        .select(selectFields)
        .eq("status", "active")
        .eq("main_category_id", preferredCategoryId)
        .order("tier_priority", { ascending: false })
        .order("bumped_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(TRENDING_COUNT);

      if (catData && catData.length > 0) {
        finalListings = rankListings(catData);
        setIsPersonalized(true);
      }

      // If not enough from preferred category, fill with other listings
      if (finalListings.length < TRENDING_COUNT) {
        const existingIds = finalListings.map(l => l.id);
        const remaining = TRENDING_COUNT - finalListings.length;
        const { data: otherData } = await supabase
          .from("base_listings")
          .select(selectFields)
          .eq("status", "active")
          .neq("main_category_id", preferredCategoryId)
          .order("tier_priority", { ascending: false })
          .order("bumped_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })
          .limit(remaining);

        if (otherData) {
          const filtered = otherData.filter(l => !existingIds.includes(l.id));
          finalListings = [...finalListings, ...rankListings(filtered)];
        }
      }
    }

    // Fallback: no preference, just fetch latest
    if (finalListings.length === 0) {
      const { data } = await supabase
        .from("base_listings")
        .select(selectFields)
        .eq("status", "active")
        .order("tier_priority", { ascending: false })
        .order("bumped_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(TRENDING_COUNT);

      if (data) {
        finalListings = rankListings(data);
        setIsPersonalized(false);
      }
    }

    setListings(finalListings.slice(0, TRENDING_COUNT) as unknown as Listing[]);
    setLoading(false);
  };

  const fetchFavorites = async () => {
    if (!user) return;
    const { data } = await supabase.from("favorites").select("listing_id").eq("user_id", user.id);
    if (data) setFavorites(new Set(data.map(f => f.listing_id)));
  };

  useEffect(() => { fetchListings(); }, []);
  useEffect(() => { fetchFavorites(); }, [user]);

  const formatPrice = (price: number) => `KSh ${price.toLocaleString()}`;
  const formatTime = (date: string) => formatDistanceToNow(new Date(date), { addSuffix: false });

  if (loading) {
    return (
      <section className="py-8 bg-muted/50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6"><Skeleton className="h-8 w-40" /><Skeleton className="h-6 w-20" /></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {[...Array(TRENDING_COUNT)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden shadow-card"><Skeleton className="aspect-[4/3]" /><div className="p-4 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-6 w-1/2" /><Skeleton className="h-3 w-full" /></div></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (listings.length === 0) return null;

  const now = new Date().toISOString();

  return (
    <section className="py-8 bg-muted/50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Trending Ads</h2>
            {isPersonalized && (
              <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                <BrainCircuit className="h-3 w-3" />
                For You
              </span>
            )}
          </div>
          <Link to="/search" className="text-sm font-semibold text-primary hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {listings.map((listing) => (
            <ProductCard
              key={listing.id}
              id={listing.id}
              title={listing.title}
              price={formatPrice(listing.price)}
              location={listing.location}
              time={formatTime(listing.created_at)}
              image={listing.images?.[0] || "/placeholder.svg"}
              isFeatured={listing.is_featured && (!listing.featured_until || listing.featured_until > now)}
              isUrgent={listing.is_urgent}
              isFavorited={favorites.has(listing.id)}
              onFavoriteChange={fetchFavorites}
              tier={listing.listing_tiers || null}
              isPromoted={!!(listing.promotion_type_id && (!listing.promotion_expires_at || listing.promotion_expires_at > now))}
              categorySlug={(listing as any).main_category?.slug}
              categoryName={(listing as any).main_category?.name}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;
