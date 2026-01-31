import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Star,
  Eye,
  Flag,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  location: string;
  images: string[];
  is_featured: boolean;
  is_urgent: boolean;
  is_negotiable: boolean;
  condition: string;
  views: number;
  created_at: string;
  user_id: string;
}

interface SellerProfile {
  display_name: string;
  phone: string | null;
  location: string | null;
  avatar_url: string | null;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  created_at: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;

      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (listingError || !listingData) {
        toast.error("Listing not found");
        navigate("/");
        return;
      }

      setListing(listingData as Listing);

      // Fetch seller profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", listingData.user_id)
        .single();

      if (profileData) {
        setSeller(profileData as SellerProfile);
      }

      // Check if favorited
      if (user) {
        const { data: favData } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("listing_id", id)
          .single();

        setIsFavorite(!!favData);
      }

      // Increment views
      await supabase
        .from("listings")
        .update({ views: (listingData.views || 0) + 1 })
        .eq("id", id);

      setLoading(false);
    };

    fetchListing();
  }, [id, user, navigate]);

  const toggleFavorite = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!listing) return;

    if (isFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listing.id);
      setIsFavorite(false);
      toast.success("Removed from favorites");
    } else {
      await supabase
        .from("favorites")
        .insert({ user_id: user.id, listing_id: listing.id });
      setIsFavorite(true);
      toast.success("Added to favorites");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: listing?.title,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const nextImage = () => {
    if (listing && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = () => {
    if (listing && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

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
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="aspect-[4/3] rounded-xl" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-12" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  const images = listing.images.length > 0 
    ? listing.images 
    : ["https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&h=600&fit=crop"];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-6">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to listings
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative bg-card rounded-xl overflow-hidden shadow-card">
              <div className="aspect-[4/3] relative">
                <img
                  src={images[currentImageIndex]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-foreground/80 text-card px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {listing.is_featured && (
                    <Badge className="bg-primary text-primary-foreground">FEATURED</Badge>
                  )}
                  {listing.is_urgent && (
                    <Badge className="bg-secondary text-secondary-foreground">URGENT</Badge>
                  )}
                </div>
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        idx === currentImageIndex ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="bg-card rounded-xl p-6 shadow-card">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {listing.title}
                </h1>
                <div className="flex gap-2">
                  <button
                    onClick={toggleFavorite}
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        isFavorite ? "fill-jiji-red text-jiji-red" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                  >
                    <Share2 className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <p className="text-3xl font-bold text-primary mb-4">
                {formatPrice(listing.price)}
                {listing.is_negotiable && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    Negotiable
                  </span>
                )}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {listing.location}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {listing.views} views
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary">{listing.category}</Badge>
                <Badge variant="outline">{listing.condition}</Badge>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold mb-3">Description</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {listing.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Seller Info & Actions */}
          <div className="space-y-4">
            {/* Seller Card */}
            <div className="bg-card rounded-xl p-6 shadow-card">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
                  {seller?.avatar_url ? (
                    <img
                      src={seller.avatar_url}
                      alt={seller.display_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    seller?.display_name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{seller?.display_name}</h3>
                    {seller?.is_verified && (
                      <Shield className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  {seller?.rating !== undefined && seller.rating > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-jiji-yellow text-jiji-yellow" />
                      {seller.rating.toFixed(1)} ({seller.total_reviews} reviews)
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Member since{" "}
                    {seller?.created_at
                      ? new Date(seller.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="space-y-3">
                {seller?.phone && (
                  <Button
                    className="w-full bg-primary hover:bg-jiji-green-dark"
                    onClick={() => {
                      if (!user) {
                        setIsAuthModalOpen(true);
                        return;
                      }
                      setShowPhone(true);
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {showPhone ? seller.phone : "Show Phone Number"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (!user) {
                      setIsAuthModalOpen(true);
                      return;
                    }
                    toast.info("Chat feature coming soon!");
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-muted rounded-xl p-4">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Safety Tips
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Meet in a safe, public place</li>
                <li>• Don't pay in advance</li>
                <li>• Inspect the item before payment</li>
                <li>• Check seller's profile and reviews</li>
              </ul>
            </div>

            {/* Report */}
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Flag className="h-4 w-4" />
              Report this ad
            </button>
          </div>
        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab="login"
      />
    </div>
  );
};

export default ProductDetail;