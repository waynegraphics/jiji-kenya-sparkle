import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
  is_featured: boolean;
  is_urgent: boolean;
  created_at: string;
}

const FeaturedListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const fetchListings = async () => {
    // Fetch from base_listings (new system)
    const { data: baseData, error: baseError } = await supabase
      .from("base_listings")
      .select("id, title, price, location, images, is_featured, is_urgent, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(8);

    if (!baseError && baseData && baseData.length > 0) {
      setListings(baseData as Listing[]);
    } else {
      // Fallback to old listings table
      const { data: oldData, error: oldError } = await supabase
        .from("listings")
        .select("id, title, price, location, images, is_featured, is_urgent, created_at")
        .order("created_at", { ascending: false })
        .limit(8);

      if (!oldError && oldData && oldData.length > 0) {
        setListings(oldData as Listing[]);
      }
    }
    setLoading(false);
  };

  const fetchFavorites = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", user.id);
    if (data) {
      setFavorites(new Set(data.map((f) => f.listing_id)));
    }
  };

  useEffect(() => { fetchListings(); }, []);
  useEffect(() => { fetchFavorites(); }, [user]);

  const formatPrice = (price: number) => `KSh ${price.toLocaleString()}`;
  const formatTime = (date: string) => formatDistanceToNow(new Date(date), { addSuffix: false });

  if (loading) {
    return (
      <section className="py-8 bg-muted/50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden shadow-card">
                <Skeleton className="aspect-[4/3]" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (listings.length === 0) return null;

  return (
    <section className="py-8 bg-muted/50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Trending Ads
          </h2>
          <Link to="/search" className="text-sm font-semibold text-primary hover:underline">
            View All
          </Link>
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
              isFeatured={listing.is_featured}
              isUrgent={listing.is_urgent}
              isFavorited={favorites.has(listing.id)}
              onFavoriteChange={fetchFavorites}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;