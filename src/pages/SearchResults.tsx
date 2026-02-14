import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import LocationSelector from "@/components/LocationSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useMainCategories } from "@/hooks/useCategories";
import { formatDistanceToNow } from "date-fns";
import { Search, SlidersHorizontal, X, Grid, List, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { generateListingUrl } from "@/lib/slugify";

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
  is_featured: boolean;
  is_urgent: boolean;
  created_at: string;
  main_category_id: string;
  main_category?: { slug: string };
}

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
  const { data: categories } = useMainCategories();

  const query = searchParams.get("q") || "";
  const categorySlug = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "newest";
  const location = searchParams.get("location") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const make = searchParams.get("make") || "";
  const model = searchParams.get("model") || "";
  const brand = searchParams.get("brand") || "";
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const [listings, setListings] = useState<Listing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [broadenedMessage, setBroadenedMessage] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const fetchListings = async () => {
    setLoading(true);
    setBroadenedMessage(null);

    // Resolve category slug to ID
    let categoryId: string | null = null;
    if (categorySlug && categorySlug !== "all" && categories) {
      const cat = categories.find(c => c.slug === categorySlug);
      if (cat) categoryId = cat.id;
    }

    // Build a single combined search string from all terms for fuzzy OR matching
    const searchTerms = [query, make, model, brand].filter(Boolean);
    const uniqueWords = [...new Set(
      searchTerms.join(" ").toLowerCase().split(/\s+/).filter(w => w.length >= 2)
    )];

    const buildQuery = (words: string[], catId: string | null) => {
      const applyFilters = (q: any) => {
        if (words.length > 0) {
          const orConditions = words
            .map(word => `title.ilike.%${word}%,description.ilike.%${word}%`)
            .join(",");
          q = q.or(orConditions);
        }
        if (catId) q = q.eq("main_category_id", catId);
        if (location) q = q.ilike("location", `%${location}%`);
        if (minPrice) q = q.gte("price", parseInt(minPrice));
        if (maxPrice) q = q.lte("price", parseInt(maxPrice));
        return q;
      };
      return applyFilters;
    };

    const applyFilters = buildQuery(uniqueWords, categoryId);

    // Count query
    let countQuery = supabase
      .from("base_listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");
    countQuery = applyFilters(countQuery);

    const { count } = await countQuery;
    const resultCount = count || 0;

    // If 0 results found, try broadening the search
    if (resultCount === 0 && uniqueWords.length > 1) {
      // Strategy: try with fewer words (most significant ones first - longest words tend to be most specific)
      const sortedWords = [...uniqueWords].sort((a, b) => b.length - a.length);
      
      for (let i = 1; i <= Math.min(sortedWords.length - 1, 3); i++) {
        const broaderWords = sortedWords.slice(0, Math.max(1, sortedWords.length - i));
        const broaderApply = buildQuery(broaderWords, categoryId);
        
        let broaderCount = supabase
          .from("base_listings")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");
        broaderCount = broaderApply(broaderCount);
        
        const { count: bCount } = await broaderCount;
        
        if (bCount && bCount > 0) {
          // Found results with broader search
          const originalSearch = searchTerms.join(" ");
          const broaderTerm = broaderWords.join(" ");
          setBroadenedMessage(`No exact results for "${originalSearch}", showing ${bCount} similar results for "${broaderTerm}"`);
          setTotalCount(bCount);

          let dataQuery = supabase
            .from("base_listings")
            .select("id, title, price, location, images, is_featured, is_urgent, created_at, main_category_id, main_category:main_categories(slug, name)")
            .eq("status", "active");
          dataQuery = broaderApply(dataQuery);
          dataQuery = dataQuery.order("created_at", { ascending: false });
          const from = (currentPage - 1) * ITEMS_PER_PAGE;
          dataQuery = dataQuery.range(from, from + ITEMS_PER_PAGE - 1);

          const { data } = await dataQuery;
          if (data) setListings(data as Listing[]);
          setLoading(false);
          return;
        }
      }

      // Still nothing? Try category-only search
      if (categoryId) {
        let catQuery = supabase
          .from("base_listings")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
          .eq("main_category_id", categoryId);
        const { count: catCount } = await catQuery;

        if (catCount && catCount > 0) {
          const catName = categories?.find(c => c.id === categoryId)?.name || "this category";
          setBroadenedMessage(`No results for "${searchTerms.join(" ")}", but found ${catCount} other listings in ${catName}`);
          setTotalCount(catCount);

          let dataQuery = supabase
            .from("base_listings")
            .select("id, title, price, location, images, is_featured, is_urgent, created_at, main_category_id, main_category:main_categories(slug, name)")
            .eq("status", "active")
            .eq("main_category_id", categoryId)
            .order("created_at", { ascending: false });
          const from = (currentPage - 1) * ITEMS_PER_PAGE;
          dataQuery = dataQuery.range(from, from + ITEMS_PER_PAGE - 1);

          const { data } = await dataQuery;
          if (data) setListings(data as Listing[]);
          setLoading(false);
          return;
        }
      }
    }

    setTotalCount(resultCount);

    // Data query
    let queryBuilder = supabase
      .from("base_listings")
      .select("id, title, price, location, images, is_featured, is_urgent, created_at, main_category_id, main_category:main_categories(slug, name)")
      .eq("status", "active");
    queryBuilder = applyFilters(queryBuilder);

    switch (sort) {
      case "oldest": queryBuilder = queryBuilder.order("created_at", { ascending: true }); break;
      case "price_low": queryBuilder = queryBuilder.order("price", { ascending: true }); break;
      case "price_high": queryBuilder = queryBuilder.order("price", { ascending: false }); break;
      default: queryBuilder = queryBuilder.order("created_at", { ascending: false });
    }

    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    queryBuilder = queryBuilder.range(from, to);

    const { data, error } = await queryBuilder;
    if (!error && data) setListings(data as Listing[]);
    setLoading(false);
  };

  const fetchFavorites = async () => {
    if (!user) return;
    const { data } = await supabase.from("favorites").select("listing_id").eq("user_id", user.id);
    if (data) setFavorites(new Set(data.map((f) => f.listing_id)));
  };

  useEffect(() => { fetchListings(); }, [query, categorySlug, sort, location, minPrice, maxPrice, make, model, brand, currentPage, categories]);
  useEffect(() => { fetchFavorites(); }, [user]);

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams);
    if (newQuery) params.set("q", newQuery); else params.delete("q");
    params.delete("page");
    setSearchParams(params);
  };

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") params.set("category", value); else params.delete("category");
    params.delete("page");
    setSearchParams(params);
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    params.delete("page");
    setSearchParams(params);
  };

  const handleLocationChange = (county: string, town?: string) => {
    const params = new URLSearchParams(searchParams);
    const loc = town ? `${county}, ${town}` : county;
    params.set("location", loc);
    params.delete("page");
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page === 1) params.delete("page"); else params.set("page", page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => navigate("/search");

  const formatPrice = (price: number) => `KSh ${price.toLocaleString()}`;
  const formatTime = (date: string) => formatDistanceToNow(new Date(date), { addSuffix: false });

  const hasActiveFilters = query || (categorySlug && categorySlug !== "all") || location || minPrice || maxPrice || make || model || brand;
  const selectedCategoryName = categories?.find(c => c.slug === categorySlug)?.name;

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} />

      <main className="container mx-auto py-6">
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
          {broadenedMessage && (
            <div className="mt-2 bg-secondary/10 border border-secondary/30 rounded-lg px-4 py-2.5 text-sm text-secondary font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 flex-shrink-0" />
              {broadenedMessage}
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl p-4 shadow-card mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Button variant="outline" className="md:hidden" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
            </Button>

            <div className={`flex flex-col md:flex-row md:items-center gap-4 flex-1 ${showFilters ? "block" : "hidden md:flex"}`}>
              {/* Category */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Category:</span>
                <Select value={categorySlug} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Location:</span>
                <div className="w-full md:w-[250px]">
                  <LocationSelector onLocationChange={handleLocationChange} showLabel={false} compact />
                </div>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Sort:</span>
                <Select value={sort} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full md:w-[160px]">
                    <SelectValue placeholder="Newest First" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-1 ml-auto">
                <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setViewMode("grid")}>
                  <Grid className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setViewMode("list")}>
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-border">
              {query && (
                <Badge variant="secondary" className="gap-1">
                  Search: {query}
                  <button onClick={() => handleSearch("")} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {categorySlug && categorySlug !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {selectedCategoryName}
                  <button onClick={() => handleCategoryChange("all")} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {location && (
                <Badge variant="secondary" className="gap-1">
                  📍 {location}
                  <button onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete("location");
                    setSearchParams(params);
                  }} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {(minPrice || maxPrice) && (
                <Badge variant="secondary" className="gap-1">
                  💰 {minPrice ? `KSh ${parseInt(minPrice).toLocaleString()}` : "Any"} - {maxPrice ? `KSh ${parseInt(maxPrice).toLocaleString()}` : "Any"}
                  <button onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete("minPrice");
                    params.delete("maxPrice");
                    setSearchParams(params);
                  }} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {make && (
                <Badge variant="secondary" className="gap-1">
                  Make: {make}
                  <button onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete("make");
                    setSearchParams(params);
                  }} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {model && (
                <Badge variant="secondary" className="gap-1">
                  Model: {model}
                  <button onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete("model");
                    setSearchParams(params);
                  }} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {brand && (
                <Badge variant="secondary" className="gap-1">
                  Brand: {brand}
                  <button onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete("brand");
                    setSearchParams(params);
                  }} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-primary">Clear all</Button>
            </div>
          )}
        </div>

        {/* Results */}
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
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {listings.map((listing) => (
                  <ProductCard
                    key={listing.id}
                    id={listing.id}
                    title={listing.title}
                    price={formatPrice(listing.price)}
                    location={listing.location}
                    time={formatTime(listing.created_at)}
                    image={listing.images?.[0] || "/placeholder.svg"}
                    isFeatured={listing.is_featured}
                    isUrgent={listing.is_urgent}
                    isFavorited={favorites.has(listing.id)}
                    onFavoriteChange={fetchFavorites}
                    categorySlug={listing.main_category?.slug}
                    categoryName={(listing as any).main_category?.name}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map((listing) => (
                  <Link 
                    key={listing.id} 
                    to={listing.main_category?.slug 
                      ? generateListingUrl(listing.id, listing.main_category.slug, listing.title)
                      : `/listing/${listing.id}`} 
                    className="block"
                  >
                    <div className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all flex">
                      <div className="w-40 h-28 flex-shrink-0">
                        <img src={listing.images?.[0] || "/placeholder.svg"} alt={listing.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 p-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {listing.is_featured && <Badge className="bg-primary text-primary-foreground text-[10px]">FEATURED</Badge>}
                            {listing.is_urgent && <Badge variant="destructive" className="text-[10px]">URGENT</Badge>}
                          </div>
                          <h3 className="font-semibold text-foreground line-clamp-1">{listing.title}</h3>
                          <p className="text-lg font-bold text-primary">KSh {listing.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{listing.location}</span>
                          <span>{formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-8">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No results found</h2>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;