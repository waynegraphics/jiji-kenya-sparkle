import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Search, SlidersHorizontal, X } from "lucide-react";

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

const categories = [
  { value: "all", label: "All Categories" },
  { value: "vehicles", label: "Vehicles" },
  { value: "property", label: "Property" },
  { value: "phones", label: "Phones & Tablets" },
  { value: "fashion", label: "Fashion" },
  { value: "services", label: "Services" },
  { value: "jobs", label: "Jobs" },
  { value: "furniture", label: "Furniture" },
  { value: "pets", label: "Animals & Pets" },
  { value: "kids", label: "Babies & Kids" },
  { value: "sports", label: "Sports & Outdoors" },
  { value: "electronics", label: "Electronics" },
  { value: "health", label: "Health & Beauty" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
];

const ITEMS_PER_PAGE = 20;

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "newest";
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const [listings, setListings] = useState<Listing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const fetchListings = async () => {
    setLoading(true);

    // First get the total count
    let countQuery = supabase
      .from("listings")
      .select("*", { count: "exact", head: true });

    if (query) {
      countQuery = countQuery.ilike("title", `%${query}%`);
    }

    if (category && category !== "all") {
      countQuery = countQuery.eq("category", category as "electronics" | "fashion" | "furniture" | "health" | "jobs" | "kids" | "pets" | "phones" | "property" | "services" | "sports" | "vehicles");
    }

    const { count } = await countQuery;
    setTotalCount(count || 0);

    // Then fetch the paginated data
    let queryBuilder = supabase
      .from("listings")
      .select("id, title, price, location, images, is_featured, is_urgent, created_at, category");

    if (query) {
      queryBuilder = queryBuilder.ilike("title", `%${query}%`);
    }

    if (category && category !== "all") {
      queryBuilder = queryBuilder.eq("category", category as "electronics" | "fashion" | "furniture" | "health" | "jobs" | "kids" | "pets" | "phones" | "property" | "services" | "sports" | "vehicles");
    }

    switch (sort) {
      case "oldest":
        queryBuilder = queryBuilder.order("created_at", { ascending: true });
        break;
      case "price_low":
        queryBuilder = queryBuilder.order("price", { ascending: true });
        break;
      case "price_high":
        queryBuilder = queryBuilder.order("price", { ascending: false });
        break;
      default:
        queryBuilder = queryBuilder.order("created_at", { ascending: false });
    }

    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    queryBuilder = queryBuilder.range(from, to);

    const { data, error } = await queryBuilder;

    if (!error && data) {
      setListings(data as Listing[]);
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
  }, [query, category, sort, currentPage]);

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams);
    if (newQuery) {
      params.set("q", newQuery);
    } else {
      params.delete("q");
    }
    params.delete("page");
    setSearchParams(params);
  };

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    params.delete("page");
    setSearchParams(params);
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    params.delete("page");
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    navigate("/search");
  };

  const formatPrice = (price: number) => {
    return `KSh ${price.toLocaleString()}`;
  };

  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: false });
  };

  const hasActiveFilters = query || (category && category !== "all");

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} />

      <main className="container mx-auto py-6">
        {/* Search Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-bold text-foreground">
              {query ? `Results for "${query}"` : "All Listings"}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {loading ? "Searching..." : `${totalCount} ads found`}
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-card rounded-xl p-4 shadow-card mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              className="md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>

            {/* Filter Controls */}
            <div
              className={`flex flex-col md:flex-row md:items-center gap-4 flex-1 ${
                showFilters ? "block" : "hidden md:flex"
              }`}
            >
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  Category:
                </span>
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  Sort by:
                </span>
                <Select value={sort} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Newest First" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                  {query && (
                    <Badge variant="secondary" className="gap-1">
                      Search: {query}
                      <button
                        onClick={() => handleSearch("")}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {category && category !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      {categories.find((c) => c.value === category)?.label}
                      <button
                        onClick={() => handleCategoryChange("all")}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-primary"
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
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
        ) : listings.length > 0 ? (
          <>
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
                  isFavorited={favorites.has(listing.id)}
                  onFavoriteChange={fetchFavorites}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No results found</h2>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filters to find what you're looking for
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;