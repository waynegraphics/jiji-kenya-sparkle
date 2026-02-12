import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import PageHero from "@/components/PageHero";

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
  listing_count?: number;
}

const Sellers = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "individual" | "business">("all");

  useEffect(() => {
    const fetchSellers = async () => {
      let query = supabase
        .from("profiles")
        .select("user_id, display_name, business_name, avatar_url, location, bio, rating, total_reviews, created_at, account_type, is_verified")
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSellers.map((seller) => (
                <Link
                  key={seller.user_id}
                  to={`/seller/${seller.user_id}`}
                  className="group"
                >
                  <div className="bg-card rounded-xl p-6 shadow-card hover:shadow-lg transition-all border border-transparent hover:border-primary/20">
                    <div className="flex flex-col items-center text-center mb-4">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold mb-3 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                        {seller.avatar_url ? (
                          <img
                            src={seller.avatar_url}
                            alt={getDisplayName(seller)}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          getDisplayName(seller).charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {getDisplayName(seller)}
                        </h3>
                        {seller.is_verified && (
                          <Shield className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      {seller.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span>{seller.rating.toFixed(1)}</span>
                          <span>({seller.total_reviews})</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      {seller.location && (
                        <div className="flex items-center gap-2 justify-center">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate">{seller.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 justify-center">
                        <Package className="h-3.5 w-3.5" />
                        <span>{seller.listing_count || 0} active listing{(seller.listing_count || 0) !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          Joined {new Date(seller.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>

                    {seller.bio && (
                      <p className="text-xs text-muted-foreground mt-3 text-center line-clamp-2">
                        {seller.bio}
                      </p>
                    )}

                    <div className="mt-4 flex justify-center gap-2">
                      {seller.is_verified && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {seller.business_name && (
                        <Badge variant="outline" className="text-xs">
                          <Building2 className="h-3 w-3 mr-1" />
                          Business
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Sellers;
