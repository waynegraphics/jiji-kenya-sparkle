import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

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

// Mock data for when no real listings exist
const mockProducts = [
  {
    id: "mock-1",
    title: "Toyota Corolla 2019 Gray | Cars for sale",
    price: 1850000,
    location: "Nairobi",
    images: ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop"],
    is_featured: true,
    is_urgent: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-2",
    title: "iPhone 14 Pro Max 256GB Deep Purple",
    price: 145000,
    location: "Westlands",
    images: ["https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&h=300&fit=crop"],
    is_featured: false,
    is_urgent: true,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-3",
    title: "3 Bedroom Apartment for Rent in Kilimani",
    price: 85000,
    location: "Kilimani",
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop"],
    is_featured: true,
    is_urgent: false,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-4",
    title: "Samsung 55\" Smart TV 4K UHD",
    price: 48500,
    location: "Mombasa",
    images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop"],
    is_featured: false,
    is_urgent: false,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-5",
    title: "Ladies Designer Handbag - Brown Leather",
    price: 4500,
    location: "Nairobi CBD",
    images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=300&fit=crop"],
    is_featured: false,
    is_urgent: false,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-6",
    title: "PlayStation 5 Console + 2 Controllers",
    price: 72000,
    location: "Karen",
    images: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop"],
    is_featured: false,
    is_urgent: true,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-7",
    title: "Office Desk and Chair Set",
    price: 15000,
    location: "Thika",
    images: ["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop"],
    is_featured: false,
    is_urgent: false,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-8",
    title: "German Shepherd Puppies - 3 months",
    price: 25000,
    location: "Kiambu",
    images: ["https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=300&fit=crop"],
    is_featured: true,
    is_urgent: false,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
];

const FeaturedListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from("listings")
      .select("id, title, price, location, images, is_featured, is_urgent, created_at")
      .order("created_at", { ascending: false })
      .limit(8);

    if (!error && data && data.length > 0) {
      setListings(data as Listing[]);
    } else {
      // Use mock data if no real listings
      setListings(mockProducts);
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

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const formatPrice = (price: number) => {
    return `KSh ${price.toLocaleString()}`;
  };

  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: false });
  };

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

  return (
    <section className="py-8 bg-muted/50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Trending Ads
          </h2>
          <button className="text-sm font-semibold text-primary hover:underline">
            View All
          </button>
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
              image={listing.images[0] || "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&h=300&fit=crop"}
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