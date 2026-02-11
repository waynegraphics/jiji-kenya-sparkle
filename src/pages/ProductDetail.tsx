import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BentoGallery from "@/components/BentoGallery";
import ReportAdDialog from "@/components/ReportAdDialog";
import ProductCard from "@/components/ProductCard";
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
  Shield,
  Star,
  Eye,
  AlertTriangle,
  Copy,
  GitCompare,
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

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", listingData.user_id)
        .single();

      if (profileData) setSeller(profileData as SellerProfile);

      if (user) {
        const { data: favData } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("listing_id", id)
          .single();
        setIsFavorite(!!favData);
      }

      await supabase
        .from("listings")
        .update({ views: (listingData.views || 0) + 1 })
        .eq("id", id);

      setLoading(false);
    };
    fetchListing();
  }, [id, user, navigate]);

  const toggleFavorite = async () => {
    if (!user) { setIsAuthModalOpen(true); return; }
    if (!listing) return;
    if (isFavorite) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", listing.id);
      setIsFavorite(false);
      toast.success("Removed from favorites");
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, listing_id: listing.id });
      setIsFavorite(true);
      toast.success("Added to favorites");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.share({ title: listing?.title, url });
    } catch {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  const handleCompare = () => {
    if (!listing) return;
    const existing = JSON.parse(localStorage.getItem("compare_items") || "[]");
    if (existing.find((item: any) => item.id === listing.id)) {
      toast.info("Already in comparison list");
      return;
    }
    if (existing.length >= 4) {
      toast.error("Max 4 items for comparison");
      return;
    }
    // Only allow same category
    if (existing.length > 0 && existing[0].category !== listing.category) {
      toast.error("Can only compare items in the same category");
      return;
    }
    existing.push({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      category: listing.category,
      image: listing.images?.[0] || "/placeholder.svg",
    });
    localStorage.setItem("compare_items", JSON.stringify(existing));
    toast.success(`Added to compare (${existing.length}/4)`);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(price);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-6 px-4">
          <Skeleton className="h-[480px] rounded-xl mb-6" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const images = listing.images?.length > 0
    ? listing.images
    : ["/placeholder.svg"];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-6 px-4">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to listings
        </button>

        {/* Bento Gallery */}
        <BentoGallery
          images={images}
          title={listing.title}
          isFeatured={listing.is_featured}
          isUrgent={listing.is_urgent}
        />

        {/* Action Bar */}
        <div className="flex items-center justify-between mt-4 mb-6">
          <div className="flex gap-2">
            <Badge variant="secondary">{listing.category}</Badge>
            <Badge variant="outline">{listing.condition}</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={toggleFavorite}>
              <Heart className={`h-4 w-4 mr-1 ${isFavorite ? "fill-jiji-red text-jiji-red" : ""}`} />
              {isFavorite ? "Saved" : "Save"}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCompare}>
              <GitCompare className="h-4 w-4 mr-1" />
              Compare
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left - Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-card">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {listing.title}
              </h1>
              <p className="text-3xl font-bold text-primary mb-1">
                {formatPrice(listing.price)}
                {listing.is_negotiable && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">Negotiable</span>
                )}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-4">
                <div className="flex items-center gap-1"><MapPin className="h-4 w-4" />{listing.location}</div>
                <div className="flex items-center gap-1"><Clock className="h-4 w-4" />{formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}</div>
                <div className="flex items-center gap-1"><Eye className="h-4 w-4" />{listing.views} views</div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-card rounded-xl p-6 shadow-card">
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {listing.description || "No description provided."}
              </p>
            </div>

            {/* Disclaimer */}
            <div className="bg-muted/50 border border-border rounded-xl p-6">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <h3 className="font-semibold text-sm text-foreground">Disclaimer</h3>
              </div>
              <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                <p>
                  This ad is offered by{" "}
                  <Link to={`/seller/${listing.user_id}`} className="text-primary font-medium hover:underline">
                    {seller?.display_name || "the seller"}
                  </Link>
                  , not APA Bazaar Marketplace.
                </p>
                <p>All listings are posted and managed directly by individual users (private sellers or dealers/businesses). APA Bazaar acts only as a marketplace and is not a party to any transaction between buyers and sellers.</p>
                <p>The accuracy, completeness, legality, or reliability of any advertisement content (including descriptions, prices, photos, contact details, and availability) is the sole responsibility of the person or business who created the listing.</p>
                <p>Prices, specifications, conditions, and availability shown in listings are subject to change without notice and may differ from the final terms offered by the seller.</p>
                <p>Any arrangements, contracts, payments, deliveries, warranties, or disputes are strictly between the buyer and seller. APA Bazaar is not involved and accepts no liability.</p>
                <p>
                  Users are strongly advised to verify all information independently, meet in safe locations, use secure payment methods, and exercise the same caution they would when dealing with strangers offline. Visit our{" "}
                  <Link to="/safety-tips" className="text-primary font-medium hover:underline">Safety Tips</Link> page for more details.
                </p>
              </div>
            </div>
          </div>

          {/* Right - Seller & Actions */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-6 shadow-card">
              <div
                className="flex items-center gap-4 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate(`/seller/${listing.user_id}`)}
              >
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold overflow-hidden">
                  {seller?.avatar_url ? (
                    <img src={seller.avatar_url} alt={seller.display_name} className="w-full h-full object-cover" />
                  ) : (
                    seller?.display_name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-primary hover:underline">{seller?.display_name}</h3>
                    {seller?.is_verified && <Shield className="h-4 w-4 text-primary" />}
                  </div>
                  {seller?.rating !== undefined && seller.rating > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-jiji-yellow text-jiji-yellow" />
                      {seller.rating.toFixed(1)} ({seller.total_reviews} reviews)
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Member since {seller?.created_at ? new Date(seller.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {seller?.phone && (
                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => {
                      if (!user) { setIsAuthModalOpen(true); return; }
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
                    if (!user) { setIsAuthModalOpen(true); return; }
                    if (user.id === listing.user_id) { toast.info("You can't message yourself"); return; }
                    navigate(`/messages?user=${listing.user_id}&listing=${listing.id}`);
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
              </div>
            </div>

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

            <ReportAdDialog
              listingId={listing.id}
              onAuthRequired={() => setIsAuthModalOpen(true)}
            />
          </div>
        </div>

        {/* Similar Ads */}
        <SimilarAds category={listing.category} currentId={listing.id} />
      </main>

      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} defaultTab="login" />
    </div>
  );
};

// Similar Ads with infinite loading
const SimilarAds = ({ category, currentId }: { category: string; currentId: string }) => {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 6;

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("category", category as any)
      .neq("id", currentId)
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error || !data || data.length < PAGE_SIZE) setHasMore(false);
    if (data) setAds((prev) => [...prev, ...data]);
    setPage((p) => p + 1);
    setLoading(false);
  };

  useEffect(() => { loadMore(); }, []);

  if (ads.length === 0 && !loading) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(price);

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">Similar Ads</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {ads.map((ad) => (
          <ProductCard
            key={ad.id}
            id={ad.id}
            title={ad.title}
            price={formatPrice(ad.price)}
            location={ad.location}
            time={formatDistanceToNow(new Date(ad.created_at), { addSuffix: true })}
            image={ad.images?.[0] || "/placeholder.svg"}
            isFeatured={ad.is_featured}
            isUrgent={ad.is_urgent}
          />
        ))}
      </div>
      {hasMore && (
        <div className="text-center mt-6">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
