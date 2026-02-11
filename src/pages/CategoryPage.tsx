import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import CategoryQuickFilters from "@/components/CategoryQuickFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCategoryBySlug,
  useSubCategoryBySlug,
  useListingsByCategory,
  useSubCategories,
} from "@/hooks/useCategories";
import {
  Car, Home, Briefcase, Smartphone, Monitor, Shirt, Sofa,
  Dog, Baby, Heart, Wrench, Tractor, Gamepad, Hammer, Grid, Filter, X, ChevronRight, Search, RotateCcw
} from "lucide-react";
import VehicleFilters from "@/components/filters/VehicleFilters";
import PropertyFilters from "@/components/filters/PropertyFilters";
import JobFilters from "@/components/filters/JobFilters";
import ElectronicsFilters from "@/components/filters/ElectronicsFilters";

const categoryIcons: Record<string, React.ReactNode> = {
  vehicles: <Car className="h-5 w-5" />,
  property: <Home className="h-5 w-5" />,
  jobs: <Briefcase className="h-5 w-5" />,
  electronics: <Monitor className="h-5 w-5" />,
  "phones-tablets": <Smartphone className="h-5 w-5" />,
  fashion: <Shirt className="h-5 w-5" />,
  "furniture-appliances": <Sofa className="h-5 w-5" />,
  "animals-pets": <Dog className="h-5 w-5" />,
  "babies-kids": <Baby className="h-5 w-5" />,
  "beauty-care": <Heart className="h-5 w-5" />,
  services: <Wrench className="h-5 w-5" />,
  "commercial-equipment": <Tractor className="h-5 w-5" />,
  "food-agriculture": <Tractor className="h-5 w-5" />,
  "leisure-activities": <Gamepad className="h-5 w-5" />,
  "repair-construction": <Hammer className="h-5 w-5" />,
};

const locations = [
  "All Locations", "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret",
  "Thika", "Malindi", "Kitale", "Garissa", "Nyeri",
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const CategoryPage = () => {
  const { categorySlug, subCategorySlug } = useParams();

  // State for filters
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    location: "",
    sortBy: "newest" as "newest" | "oldest" | "price_asc" | "price_desc",
    page: 1,
    searchQuery: "",
  });
  const [categoryFilters, setCategoryFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  // Fetch category data
  const { data: mainCategory, isLoading: categoryLoading } = useCategoryBySlug(categorySlug);
  const { data: subCategory } = useSubCategoryBySlug(categorySlug, subCategorySlug);
  const { data: subCategories } = useSubCategories(mainCategory?.id);

  // Build filter params including category-specific filters
  const filterParams = useMemo(() => ({
    minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
    location: filters.location && filters.location !== "All Locations" ? filters.location : undefined,
    sortBy: filters.sortBy,
    page: filters.page,
    limit: 20,
    searchQuery: filters.searchQuery || undefined,
    ...categoryFilters,
  }), [filters, categoryFilters]);

  // Fetch listings
  const { data: listingsData, isLoading: listingsLoading } = useListingsByCategory(
    categorySlug,
    subCategorySlug,
    filterParams
  );

  const displayCategory = subCategory?.main_category || mainCategory;
  const displaySubCategory = subCategory;
  const icon = categoryIcons[categorySlug || ""] || <Grid className="h-5 w-5" />;

  const handleCategoryFilterChange = (key: string, value: string) => {
    setCategoryFilters(prev => ({ ...prev, [key]: value }));
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      location: "",
      sortBy: "newest",
      page: 1,
      searchQuery: "",
    });
    setCategoryFilters({});
  };

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.location || filters.searchQuery || Object.values(categoryFilters).some(v => v && v !== "Any");

  // Render category-specific filters
  const renderCategoryFilters = () => {
    switch (categorySlug) {
      case "vehicles":
        return <VehicleFilters filters={categoryFilters} onChange={handleCategoryFilterChange} />;
      case "property":
        return <PropertyFilters filters={categoryFilters} onChange={handleCategoryFilterChange} />;
      case "jobs":
        return <JobFilters filters={categoryFilters} onChange={handleCategoryFilterChange} />;
      case "electronics":
        return <ElectronicsFilters filters={categoryFilters} onChange={handleCategoryFilterChange} />;
      default:
        return null;
    }
  };

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!displayCategory) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-6">The category you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-6 md:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          {displaySubCategory ? (
            <>
              <Link to={`/category/${categorySlug}`} className="hover:text-foreground transition-colors">
                {displayCategory.name}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{displaySubCategory.name}</span>
            </>
          ) : (
            <span className="text-foreground font-medium">{displayCategory.name}</span>
          )}
        </nav>

        {/* Category Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              {icon}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {displaySubCategory?.name || displayCategory.name}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {displaySubCategory?.seo_description || displayCategory.seo_description || displayCategory.description}
          </p>
        </div>

        {/* Sub-Category Quick Filters (icon grid like Jiji) */}
        <CategoryQuickFilters categorySlug={categorySlug} currentSubSlug={subCategorySlug} />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-card rounded-xl p-4 shadow-card sticky top-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              {/* Search within category */}
              <div className="space-y-2">
                <Label className="text-sm">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search listings..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value, page: 1 }))}
                    className="pl-8 h-9"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <Label className="text-sm">Price Range (KES)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    className="h-9"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value, page: 1 }))}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    className="h-9"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value, page: 1 }))}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="text-sm">Location</Label>
                <Select
                  value={filters.location}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, location: value, page: 1 }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <Label className="text-sm">Sort By</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as typeof filters.sortBy, page: 1 }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category-Specific Filters */}
              {renderCategoryFilters()}
            </div>
          </aside>

          {/* Listings Grid */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4 flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex-1"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" size="icon" onClick={clearFilters}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {listingsData?.total || 0} listings found
              </p>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="lg:hidden">
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Listings */}
            {listingsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            ) : listingsData?.listings && listingsData.listings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {listingsData.listings.map((listing) => (
                    <ProductCard
                      key={listing.id}
                      id={listing.id}
                      title={listing.title}
                      price={`KES ${listing.price.toLocaleString()}`}
                      location={listing.location}
                      time={formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
                      image={listing.images?.[0] || "/placeholder.svg"}
                      isFeatured={listing.is_featured || false}
                      isUrgent={listing.is_urgent || false}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {listingsData.totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={filters.page}
                      totalPages={listingsData.totalPages}
                      onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-card rounded-xl">
                <Grid className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Listings Found</h3>
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters 
                    ? "Try adjusting your filters to see more results."
                    : "Be the first to post an ad in this category!"}
                </p>
                <div className="flex gap-3 justify-center">
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                  <Link to="/post-ad">
                    <Button>Post an Ad</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content Section */}
        {displayCategory.description && (
          <section className="mt-12 bg-card rounded-xl p-6 shadow-card">
            <h2 className="text-xl font-semibold mb-3">
              About {displaySubCategory?.name || displayCategory.name}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {displaySubCategory?.description || displayCategory.description}
            </p>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
