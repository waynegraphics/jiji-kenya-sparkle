import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import AuthModal from "@/components/AuthModal";
import {
  MapPin,
  Star,
  Shield,
  Calendar,
  Package,
  Search,
  Users,
  Building2,
  Store,
  Phone,
  Eye,
  EyeOff,
  UserPlus,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import PageHero from "@/components/PageHero";
import { toast } from "sonner";

interface Seller {
  user_id: string;
  display_name: string;
  business_name: string | null;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
  rating: number;
  total_reviews: number;
  created_at: string;
  account_type: string;
  is_verified: boolean;
  phone: string | null;
  whatsapp_number: string | null;
  listing_count?: number;
}

const Sellers = () => {
  const { user } = useAuth();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "individual" | "business">("all");
  const [revealedPhones, setRevealedPhones] = useState<Set<string>>(new Set());
  const [followedSellers, setFollowedSellers] = useState<Set<string>>(new Set());
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const fetchSellers = async () => {
      let query = supabase
        .from("profiles")
        .select("user_id, display_name, business_name, avatar_url, location, bio, rating, total_reviews, created_at, account_type, is_verified, phone, whatsapp_number")
        .eq("account_type", "seller");

      if (filter === "verified") {
        query = query.eq("is_verified", true);
      } else if (filter === "business") {
        query = query.eq("account_type", "business");
      } else if (filter === "individual") {
        query = query.eq("account_type", "seller").is("business_name", null);
      }

      const { data: profiles, error } = await query.order("rating", { ascending: false });

      if (error) {
        console.error("Error fetching sellers:", error);
        setLoading(false);
        return;
      }

      const sellersWithCounts: Seller[] = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { count } = await supabase
            .from("base_listings")
            .select("id", { count: "exact", head: true })
            .eq("user_id", profile.user_id)
            .eq("status", "active");

          return {
            ...profile,
            listing_count: count || 0,
          };
        })
      );

      setSellers(sellersWithCounts);
      setLoading(false);
    };

    fetchSellers();
  }, [filter]);

  useEffect(() => {
    if (!user) return;
    const fetchFollows = async () => {
      const { data } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);
      if (data) setFollowedSellers(new Set(data.map((f) => f.following_id)));
    };
    fetchFollows();
  }, [user]);

  const handleFollow = async (e: React.MouseEvent, sellerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { setShowAuth(true); return; }
    const isFollowing = followedSellers.has(sellerId);
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", sellerId);
      setFollowedSellers((prev) => { const n = new Set(prev); n.delete(sellerId); return n; });
      toast.success("Unfollowed seller");
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: sellerId });
      setFollowedSellers((prev) => new Set(prev).add(sellerId));
      toast.success("Following seller");
    }
  };

  const handleRevealPhone = (e: React.MouseEvent, sellerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { setShowAuth(true); return; }
    setRevealedPhones((prev) => new Set(prev).add(sellerId));
  };

  const handleWhatsApp = (e: React.MouseEvent, phone: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    const cleaned = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleaned}?text=Hi ${name}, I found you on APA Bazaar!`, "_blank");
  };

  const getDisplayName = (seller: Seller) =>
    seller.business_name || seller.display_name;

  const filteredSellers = sellers.filter((s) =>
    getDisplayName(s).toLowerCase().includes(search.toLowerCase()) ||
    s.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <PageHero
        title="Browse All Sellers"
        subtitle="Discover trusted sellers and verified businesses on APA Bazaar"
        badge="Seller Directory"
        badgeIcon={Store}
        breadcrumbLabel="Sellers"
      />

      <main className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <p className="text-muted-foreground max-w-xl mx-auto">
            Connect with sellers across Kenya. Find trusted businesses and individual sellers.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by seller name or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 max-w-md"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                All Sellers
              </button>
              <button
                onClick={() => setFilter("verified")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "verified"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Verified Only
              </button>
              <button
                onClick={() => setFilter("business")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "business"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Businesses
              </button>
              <button
                onClick={() => setFilter("individual")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "individual"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Individuals
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{sellers.length}</p>
              <p className="text-sm text-muted-foreground">Total Sellers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">
                {sellers.filter((s) => s.is_verified).length}
              </p>
              <p className="text-sm text-muted-foreground">Verified</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">
                {sellers.reduce((sum, s) => sum + (s.listing_count || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Active Listings</p>
            </div>
          </div>

          {/* Sellers Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : filteredSellers.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {search ? "No sellers match your search" : "No sellers found"}
              </h2>
              <p className="text-muted-foreground">
                {search ? "Try a different search term." : "Check back soon as more sellers join."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSellers.map((seller) => {
                const name = getDisplayName(seller);
                const isFollowing = followedSellers.has(seller.user_id);
                const phoneRevealed = revealedPhones.has(seller.user_id);

                return (
                  <div
                    key={seller.user_id}
                    className="bg-card rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all group"
                  >
                    {/* Top accent bar */}
                    <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60" />

                    <div className="p-5">
                      {/* Header: Avatar + Name + Follow */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative shrink-0">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold ring-2 ring-primary/20 overflow-hidden">
                            {seller.avatar_url ? (
                              <img src={seller.avatar_url} alt={name} className="w-full h-full object-cover" />
                            ) : (
                              name.charAt(0).toUpperCase()
                            )}
                          </div>
                          {seller.is_verified && (
                            <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5">
                              <Shield className="h-3.5 w-3.5 text-primary-foreground" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-semibold text-foreground truncate">{name}</h3>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-1 mt-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-3.5 w-3.5 ${
                                  s <= Math.round(seller.rating || 0)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({seller.total_reviews || 0})
                            </span>
                          </div>

                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {seller.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {seller.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" /> {seller.listing_count || 0} ads
                            </span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant={isFollowing ? "secondary" : "outline"}
                          className="shrink-0 h-8 text-xs"
                          onClick={(e) => handleFollow(e, seller.user_id)}
                        >
                          {isFollowing ? (
                            <><UserCheck className="h-3.5 w-3.5 mr-1" /> Following</>
                          ) : (
                            <><UserPlus className="h-3.5 w-3.5 mr-1" /> Follow</>
                          )}
                        </Button>
                      </div>

                      {/* Bio */}
                      {seller.bio && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{seller.bio}</p>
                      )}

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {seller.is_verified && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                            <Shield className="h-3 w-3 mr-1" /> Verified
                          </Badge>
                        )}
                        {seller.business_name && (
                          <Badge variant="outline" className="text-xs">
                            <Building2 className="h-3 w-3 mr-1" /> Business
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          Joined {new Date(seller.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </Badge>
                      </div>

                      {/* Contact Row */}
                      <div className="flex items-center gap-2 mb-4">
                        {seller.phone ? (
                          phoneRevealed ? (
                            <a
                              href={`tel:${seller.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-muted text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
                            >
                              <Phone className="h-3.5 w-3.5" /> {seller.phone}
                            </a>
                          ) : (
                            <button
                              onClick={(e) => handleRevealPhone(e, seller.user_id)}
                              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-muted text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
                            >
                              <EyeOff className="h-3.5 w-3.5" /> Show Number
                            </button>
                          )
                        ) : (
                          <span className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-muted text-xs text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" /> No phone listed
                          </span>
                        )}

                        {seller.whatsapp_number && (
                          <button
                            onClick={(e) => handleWhatsApp(e, seller.whatsapp_number!, name)}
                            className="h-9 px-3 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 flex items-center gap-1.5 text-sm font-medium transition-colors"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.114 1.519 5.845L.054 23.681l5.958-1.435A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-1.97 0-3.837-.53-5.445-1.453l-.39-.232-3.535.852.89-3.444-.254-.403A9.7 9.7 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z" />
                            </svg>
                            WhatsApp
                          </button>
                        )}
                      </div>

                      {/* View Details */}
                      <Link
                        to={`/seller/${seller.user_id}`}
                        className="flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        View Profile <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <Footer />
    </div>
  );
};

export default Sellers;
