import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Heart, ArrowLeft, Loader2 } from "lucide-react";

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

const Favorites = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const fetchFavorites = async () => {
    if (!user) return;

    setLoading(true);

    // Get favorite listing IDs
    const { data: favoritesData } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", user.id);

    if (!favoritesData || favoritesData.length === 0) {
      setListings([]);
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }

    const ids = favoritesData.map((f) => f.listing_id);
    setFavoriteIds(new Set(ids));

    // Fetch the actual listings
    const { data: listingsData, error } = await supabase
      .from("base_listings")
      .select("id, title, price, location, images, is_featured, is_urgent, created_at")
      .in("id", ids)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching favorite listings:", error);
    }

    if (listingsData) {
      setListings(listingsData as Listing[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else if (!authLoading) {
      navigate("/");
    }
  }, [user, authLoading]);

  const formatPrice = (price: number) => {
    return `KSh ${price.toLocaleString()}`;
  };

  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: false });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-6 px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Heart className="h-6 w-6 text-primary fill-primary" />
          <h1 className="text-2xl font-bold text-foreground">My Favorites</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {[...Array(4)].map((_, i) => (
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
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {listings.map((listing) => (
              <ProductCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                price={formatPrice(listing.price)}
                location={listing.location}
                time={formatTime(listing.created_at)}
                image={
                  listing.images[0] ||
                  "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&h=300&fit=crop"
                }
                isFeatured={listing.is_featured}
                isUrgent={listing.is_urgent}
                isFavorited={favoriteIds.has(listing.id)}
                onFavoriteChange={fetchFavorites}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6">
              Start saving listings you're interested in by clicking the heart icon
            </p>
            <Button onClick={() => navigate("/search")}>Browse Listings</Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;
