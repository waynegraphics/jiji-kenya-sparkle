import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import SellerReviews from "@/components/SellerReviews";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MapPin, Star, Shield, Calendar, Package, Phone, MessageCircle,
  UserPlus, UserMinus, Eye, EyeOff, ExternalLink, Search
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";
import { toast } from "sonner";
import ShareMenu from "@/components/ShareMenu";

interface SellerProfileData {
  display_name: string;
  phone: string | null;
  whatsapp_number: string | null;
  location: string | null;
  avatar_url: string | null;
  bio: string | null;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  created_at: string;
  account_type: string;
  business_name: string | null;
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
  main_categories?: { slug: string; name: string } | null;
}

const SellerProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [seller, setSeller] = useState<SellerProfileData | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!userId) return;

      const [profileResult, listingsResult, followerResult] = await Promise.allSettled([
        supabase.from("profiles").select("display_name, phone, whatsapp_number, location, avatar_url, bio, rating, total_reviews, is_verified, created_at, account_type, business_name").eq("user_id", userId).single(),
        supabase.from("base_listings")
          .select("id, title, price, location, images, is_featured, is_urgent, created_at, main_categories(slug, name)")
          .eq("user_id", userId).eq("status", "active")
          .order("created_at", { ascending: false }),
        supabase.from("follows").select("id", { count: "exact" }).eq("following_id", userId),
      ]);

      if (profileResult.status === "fulfilled" && profileResult.value.data) {
        setSeller(profileResult.value.data as SellerProfileData);
      } else {
        navigate("/");
        return;
      }

      if (listingsResult.status === "fulfilled" && listingsResult.value.data) {
        setListings(listingsResult.value.data as any);
      }

      if (followerResult.status === "fulfilled") {
        setFollowerCount(followerResult.value.count || 0);
      }

      if (user) {
        const [favResult, followResult] = await Promise.allSettled([
          supabase.from("favorites").select("listing_id").eq("user_id", user.id),
          supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", userId).maybeSingle(),
        ]);

        if (favResult.status === "fulfilled" && favResult.value.data) {
          setFavorites(new Set(favResult.value.data.map((f) => f.listing_id)));
        }
        if (followResult.status === "fulfilled" && followResult.value.data) {
          setIsFollowing(true);
        }
      }

      setLoading(false);
    };
    fetchSellerData();
  }, [userId, user, navigate]);

  const toggleFollow = async () => {
    if (!user) { setIsAuthModalOpen(true); return; }
    if (!userId) return;

    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", userId);
      setIsFollowing(false);
      setFollowerCount(prev => Math.max(0, prev - 1));
      toast.success("Unfollowed");
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: userId });
      setIsFollowing(true);
      setFollowerCount(prev => prev + 1);
      toast.success("Following!");
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(price);

  const getDisplayName = () => {
    if (!seller) return "";
    return seller.account_type === "business" && seller.business_name ? seller.business_name : seller.display_name;
  };

  // Extract unique categories from listings
  const categories = useMemo(() => {
    const cats = new Map<string, string>();
    listings.forEach((l) => {
      const cat = l.main_categories as any;
      if (cat?.slug && cat?.name) {
        cats.set(cat.slug, cat.name);
      }
    });
    return Array.from(cats.entries()).map(([slug, name]) => ({ slug, name }));
  }, [listings]);

  // Filtered listings
  const filteredListings = useMemo(() => {
    let result = listings;
    if (selectedCategory !== "all") {
      result = result.filter((l) => (l.main_categories as any)?.slug === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((l) => l.title.toLowerCase().includes(q));
    }
    return result;
  }, [listings, selectedCategory, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-6 px-4">
          <Skeleton className="h-48 rounded-xl mb-6" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-xl" />
            <div className="md:col-span-2"><Skeleton className="h-8 w-48 mb-4" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (!seller) return null;

  const memberSince = new Date(seller.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const isOwnProfile = user?.id === userId;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background border-b">
        <div className="container mx-auto px-4 pt-8 pb-16 md:pt-12 md:pb-20">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-card shadow-xl">
              <AvatarImage src={seller.avatar_url || ""} />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl md:text-4xl font-bold">
                {getDisplayName().charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{getDisplayName()}</h1>
                {seller.is_verified && (
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    <Shield className="h-3 w-3 mr-1" />Verified
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mt-2">
                {seller.location && (
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{seller.location}</span>
                )}
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Member since {memberSince}</span>
                <span className="flex items-center gap-1"><Package className="h-4 w-4" />{listings.length} listings</span>
                <span className="flex items-center gap-1"><UserPlus className="h-4 w-4" />{followerCount} followers</span>
              </div>

              {seller.rating > 0 && (
                <div className="flex items-center justify-center md:justify-start gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-4 w-4 ${s <= Math.round(seller.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                  ))}
                  <span className="text-sm font-medium ml-1">{seller.rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({seller.total_reviews} reviews)</span>
                </div>
              )}
            </div>

            {/* Actions - show for everyone except own profile */}
            {!isOwnProfile && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  onClick={toggleFollow}
                  className="gap-2"
                >
                  {isFollowing ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!user) { setIsAuthModalOpen(true); return; }
                    navigate(`/messages?user=${userId}`);
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />Message
                </Button>
                <ShareMenu title={getDisplayName()} />
              </div>
            )}
            {isOwnProfile && <ShareMenu title={getDisplayName()} />}
          </div>
        </div>
      </section>

      <main className="container mx-auto py-6 px-4">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Contact Card */}
            <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
              <h3 className="font-semibold text-sm mb-3">Contact</h3>
              <div className="space-y-2.5">
                {seller.phone && (
                  <Button
                    className="w-full font-semibold h-10"
                    onClick={() => {
                      if (!user) { setIsAuthModalOpen(true); return; }
                      if (showPhone) window.location.href = `tel:${seller.phone}`;
                      else setShowPhone(true);
                    }}
                  >
                    {showPhone ? <Phone className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                    {showPhone ? seller.phone : "Show Phone Number"}
                  </Button>
                )}

                {seller.whatsapp_number && (
                  <Button
                    variant="outline"
                    className="w-full border-green-500/50 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950/20 dark:hover:text-green-400 h-10"
                    onClick={() => {
                      window.open(
                        `https://wa.me/${seller.whatsapp_number!.replace(/\D/g, "")}?text=Hi, I found you on APA Bazaar!`,
                        "_blank"
                      );
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                  </Button>
                )}
              </div>
            </div>

            {/* About */}
            {seller.bio && (
              <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
                <h3 className="font-semibold text-sm mb-2">About</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{seller.bio}</p>
              </div>
            )}

            {/* Stats */}
            <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
              <h3 className="font-semibold text-sm mb-3">Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold text-foreground">{listings.length}</p>
                  <p className="text-xs text-muted-foreground">Listings</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold text-foreground">{seller.total_reviews}</p>
                  <p className="text-xs text-muted-foreground">Reviews</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold text-foreground">{followerCount}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold text-foreground">{seller.rating > 0 ? seller.rating.toFixed(1) : "N/A"}</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="listings">
              <TabsList className="mb-6 w-full sm:w-auto">
                <TabsTrigger value="listings" className="flex-1 sm:flex-none">
                  Listings ({listings.length})
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1 sm:flex-none">
                  Reviews ({seller.total_reviews})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="listings">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search listings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {categories.length > 1 && (
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {filteredListings.length === 0 ? (
                  <div className="bg-card rounded-xl p-12 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-1">
                      {listings.length === 0 ? "No active listings" : "No listings match your search"}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {listings.length === 0
                        ? "This seller hasn't posted any ads yet."
                        : "Try adjusting your search or filter."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    {filteredListings.map((listing) => (
                      <ProductCard
                        key={listing.id}
                        id={listing.id}
                        title={listing.title}
                        price={formatPrice(listing.price)}
                        location={listing.location}
                        time={formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
                        image={listing.images?.[0] || "/placeholder.svg"}
                        isFeatured={listing.is_featured}
                        isUrgent={listing.is_urgent}
                        isFavorited={favorites.has(listing.id)}
                        categorySlug={(listing.main_categories as any)?.slug}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews">
                {userId && <SellerReviews sellerId={userId} />}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} defaultTab="login" />
    </div>
  );
};

export default SellerProfile;
