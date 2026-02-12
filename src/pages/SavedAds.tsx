import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Bookmark, ArrowLeft, Loader2, Filter, Home, ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
  is_featured: boolean;
  is_urgent: boolean;
  created_at: string;
  category: string;
}

const SavedAds = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price-high" | "price-low">("newest");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const fetchSavedAds = async () => {
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
    let query = supabase
      .from("listings")
      .select("id, title, price, location, images, is_featured, is_urgent, created_at, category")
      .in("id", ids);

    if (filterCategory !== "all") {
      query = query.eq("category", filterCategory as any);
    }

    // Apply sorting
    if (sortBy === "newest") {
      query = query.order("created_at", { ascending: false });
    } else if (sortBy === "oldest") {
      query = query.order("created_at", { ascending: true });
    } else if (sortBy === "price-high") {
      query = query.order("price", { ascending: false });
    } else if (sortBy === "price-low") {
      query = query.order("price", { ascending: true });
    }

    const { data: listingsData } = await query;

    if (listingsData) {
      setListings(listingsData as Listing[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchSavedAds();
    } else if (!authLoading) {
      navigate("/");
    }
  }, [user, authLoading, sortBy, filterCategory]);

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
      
      {/* Modern Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 border-b overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>Saved Ads</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <Bookmark className="h-5 w-5" />
              Your Saved Items
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Saved Ads
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              View and manage all your saved listings in one place
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto py-6 px-4">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bookmark className="h-6 w-6 text-primary fill-primary" />
            <h1 className="text-2xl font-bold text-foreground">Saved Ads</h1>
            {listings.length > 0 && (
              <span className="text-sm text-muted-foreground">({listings.length})</span>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Sort by:</span>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                onFavoriteChange={fetchSavedAds}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Bookmark className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No saved ads yet</h2>
            <p className="text-muted-foreground mb-6">
              Start saving listings you're interested in by clicking the bookmark icon
            </p>
            <Button onClick={() => navigate("/search")}>Browse Listings</Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SavedAds;
