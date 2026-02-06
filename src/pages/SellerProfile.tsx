import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Star,
  Shield,
  Calendar,
  Package,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface SellerProfile {
  display_name: string;
  phone: string | null;
  location: string | null;
  avatar_url: string | null;
  bio: string | null;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  created_at: string;
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
}

const SellerProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!userId) return;

      // Fetch seller profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileError || !profileData) {
        navigate("/");
        return;
      }

      setSeller(profileData as SellerProfile);

      // Fetch seller's listings
      const { data: listingsData } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (listingsData) {
        setListings(listingsData as Listing[]);
      }

      // Fetch user's favorites if logged in
      if (user) {
        const { data: favData } = await supabase
          .from("favorites")
          .select("listing_id")
          .eq("user_id", user.id);

        if (favData) {
          setFavorites(new Set(favData.map((f) => f.listing_id)));
        }
      }

      setLoading(false);
    };

    fetchSellerData();
  }, [userId, user, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <Skeleton className="h-64 rounded-xl" />
            </div>
            <div className="md:col-span-3">
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!seller) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-6">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Seller Info Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-card rounded-xl p-6 shadow-card sticky top-24">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold mb-3">
                  {seller.avatar_url ? (
                    <img
                      src={seller.avatar_url}
                      alt={seller.display_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    seller.display_name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{seller.display_name}</h1>
                  {seller.is_verified && (
                    <Shield className="h-5 w-5 text-primary" />
                  )}
                </div>
                {seller.rating > 0 && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-jiji-yellow text-jiji-yellow" />
                    {seller.rating.toFixed(1)} ({seller.total_reviews} reviews)
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm">
                {seller.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{seller.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Member since{" "}
                    {new Date(seller.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>{listings.length} listings</span>
                </div>
              </div>

              {/* Bio */}
              {seller.bio && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-semibold text-sm mb-2">About</h3>
                  <p className="text-sm text-muted-foreground">{seller.bio}</p>
                </div>
              )}

              {/* Verified Badge */}
              {seller.is_verified && (
                <div className="mt-4 pt-4 border-t">
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified Seller
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Listings Grid */}
          <div className="md:col-span-3">
            <h2 className="text-xl font-bold mb-4">
              Listings by {seller.display_name}
            </h2>

            {listings.length === 0 ? (
              <div className="bg-card rounded-xl p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  This seller has no active listings.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {listings.map((listing) => (
                  <ProductCard
                    key={listing.id}
                    id={listing.id}
                    title={listing.title}
                    price={formatPrice(listing.price)}
                    location={listing.location}
                    time={formatDistanceToNow(new Date(listing.created_at), {
                      addSuffix: true,
                    })}
                    image={
                      listing.images?.[0] ||
                      "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&h=600&fit=crop"
                    }
                    isFeatured={listing.is_featured}
                    isUrgent={listing.is_urgent}
                    isFavorited={favorites.has(listing.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SellerProfile;
