import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BentoGallery from "@/components/BentoGallery";
import ReportAdDialog from "@/components/ReportAdDialog";
import ShareMenu from "@/components/ShareMenu";
import ProductCard from "@/components/ProductCard";
import { PremiumFeatureDisplay } from "@/components/PremiumFeatureDisplay";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Heart, MapPin, Clock, Phone, MessageCircle, Share2, ChevronLeft,
  Shield, Star, Eye, AlertTriangle, Flag, ExternalLink, BarChart3
} from "lucide-react";
import { useCompareStore } from "@/hooks/useCompareStore";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { extractListingId, generateListingUrl } from "@/lib/slugify";

interface BaseListing {
  id: string; title: string; description: string | null; price: number;
  location: string; images: string[]; is_featured: boolean; is_urgent: boolean;
  is_negotiable: boolean; views: number; created_at: string; user_id: string;
  currency: string; status: string; main_category_id: string; sub_category_id: string | null;
}

interface SellerProfile {
  display_name: string; phone: string | null; whatsapp_number: string | null;
  location: string | null; avatar_url: string | null; rating: number;
  total_reviews: number; is_verified: boolean; created_at: string;
  account_type: string; business_name: string | null;
}

const SidebarPromotionSlot = ({ promos, categorySlug }: { promos: any[]; categorySlug?: string }) => {
  const navigate = useNavigate();
  if (promos.length === 0) return null;
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(price);
  return (
    <div className="bg-card rounded-xl p-4 shadow-card border border-primary/20">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded">SPONSORED</span>
        <span className="text-xs text-muted-foreground">Promoted listings</span>
      </div>
      <div className="space-y-3">
        {promos.map((ad) => {
          const promoUrl = categorySlug && ad.title
            ? generateListingUrl(ad.id, categorySlug, ad.title)
            : `/listing/${ad.id}`;
          return (
          <div key={ad.id} className="flex gap-3 cursor-pointer group" onClick={() => navigate(promoUrl)}>
            <img src={ad.images?.[0] || "/placeholder.svg"} alt={ad.title}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0 group-hover:opacity-80 transition-opacity" />
            <div className="min-w-0">
              <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">{ad.title}</p>
              <p className="text-sm font-bold text-primary">{formatPrice(ad.price)}</p>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const params = useParams<{ category?: string; slug?: string; id?: string }>();
  const navigate = useNavigate();
  
  // Extract listing ID from URL (supports both old and new formats)
  // New format: /listing/category/title-slug-id
  // Old format: /listing/id
  // Always try to extract from pathname as it handles both formats
  const listingId = params.id || extractListingId(window.location.pathname);
  const { user } = useAuth();
  const [listing, setListing] = useState<BaseListing | null>(null);
  const [categoryDetails, setCategoryDetails] = useState<Record<string, any>>({});
  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState<string | undefined>(undefined);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [sidebarPromos, setSidebarPromos] = useState<any[]>([]);
  const { addItem, items: compareItems, canAdd } = useCompareStore();

  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) {
        console.error("No listing ID found in URL:", window.location.pathname, params);
        toast.error("Invalid listing URL");
        navigate("/");
        return;
      }
      
      try {
        // Fetch base listing first (critical path)
        const { data: baseData, error: baseError } = await supabase
          .from("base_listings").select("*").eq("id", listingId).single();

        if (baseError || !baseData) {
        const { data: oldData, error: oldError } = await supabase
          .from("listings").select("*").eq("id", listingId).single();
          if (oldError || !oldData) { 
            toast.error("Listing not found"); 
            navigate("/"); 
            return; 
          }
          setListing({
            id: oldData.id, title: oldData.title, description: oldData.description,
            price: oldData.price, location: oldData.location, images: oldData.images || [],
            is_featured: oldData.is_featured || false, is_urgent: oldData.is_urgent || false,
            is_negotiable: oldData.is_negotiable || false, views: oldData.views || 0,
            created_at: oldData.created_at, user_id: oldData.user_id, currency: "KES",
            status: "active", main_category_id: "", sub_category_id: null,
          });
          setCategoryName(oldData.category || "");
          setLoading(false);
          return;
        }

        // Set listing immediately for faster display
        setListing(baseData as BaseListing);
        
        const userId = baseData.user_id;
        const mainCategoryId = baseData.main_category_id;

        // Fetch all non-critical data in parallel for faster loading
        const [
          categoryResult,
          profileResult,
          favoriteResult
        ] = await Promise.allSettled([
          // Category data
          mainCategoryId 
            ? supabase.from("main_categories")
                .select("name, slug").eq("id", mainCategoryId).single()
            : Promise.resolve({ data: null, error: null }),
          // Seller profile
          supabase.from("profiles")
            .select("*").eq("user_id", userId).single(),
          // Favorite status (only if user is logged in)
          user 
            ? supabase.from("favorites")
                .select("id").eq("user_id", user.id).eq("listing_id", listingId).maybeSingle()
            : Promise.resolve({ data: null, error: null })
        ]);

        // Process category data
        if (categoryResult.status === 'fulfilled' && categoryResult.value.data) {
          setCategoryName(categoryResult.value.data.name);
          if (categoryResult.value.data.slug) {
            setCategorySlug(categoryResult.value.data.slug);
            // Fetch category details in background (non-blocking)
            fetchCategoryDetails(baseData.id, categoryResult.value.data.slug).catch(console.error);
          }
        }

        // Process seller profile
        if (profileResult.status === 'fulfilled' && profileResult.value.data) {
          setSeller(profileResult.value.data as SellerProfile);
        }

        // Process favorite status
        if (favoriteResult.status === 'fulfilled' && favoriteResult.value.data) {
          setIsFavorite(true);
        }

        // Fetch sidebar promotions in background (non-blocking)
        supabase
          .from("base_listings")
          .select("id, title, price, images, location, created_at, promotion_type_id")
          .eq("status", "active")
          .not("promotion_type_id", "is", null)
          .neq("id", listingId)
          .limit(3)
          .then(({ data: sidebarData }) => {
            if (sidebarData && sidebarData.length > 0) {
              return supabase
                .from("promotion_types")
                .select("id")
                .eq("placement", "sidebar")
                .then(({ data: promoTypes }) => {
                  if (promoTypes) {
                    const sidebarTypeIds = new Set(promoTypes.map(p => p.id));
                    setSidebarPromos(sidebarData.filter(l => sidebarTypeIds.has(l.promotion_type_id)));
                  }
                });
            }
          })
          .then(undefined, console.error);

        // Increment views in background (fire-and-forget, non-blocking)
        supabase.rpc("increment_listing_views", { p_listing_id: listingId })
          .then(undefined, (err: unknown) => {
            console.error("Error incrementing views:", err);
          });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching listing:", error);
        toast.error("Failed to load listing");
        setLoading(false);
      }
    };
    fetchListing();
  }, [listingId, user, navigate]);

  const fetchCategoryDetails = async (listingId: string, slug: string) => {
    const tableMap: Record<string, string> = {
      vehicles: "vehicle_listings", property: "property_listings", jobs: "job_listings",
      electronics: "electronics_listings", "phones-tablets": "phone_listings",
      fashion: "fashion_listings", "furniture-appliances": "furniture_listings",
      "animals-pets": "pet_listings", "babies-kids": "kids_listings",
      "beauty-care": "beauty_listings", services: "service_listings",
      "commercial-equipment": "equipment_listings", "food-agriculture": "agriculture_listings",
      "leisure-activities": "leisure_listings", "repair-construction": "construction_listings",
    };
    const table = tableMap[slug];
    if (!table) return;
    
    // For vehicles, fetch with make and model joins
    if (slug === 'vehicles') {
      const { data } = await supabase
        .from(table as any)
        .select("*, make:vehicle_makes(name), model:vehicle_models(name)")
        .eq("id", listingId)
        .single();
      if (data) {
        const transformed: Record<string, any> = { ...(data as any) };
        if (transformed.make_id && transformed.make) {
          transformed.make_name = (transformed.make as any).name;
          delete transformed.make_id;
        }
        if (transformed.model_id && transformed.model) {
          transformed.model_name = (transformed.model as any).name;
          delete transformed.model_id;
        }
        delete transformed.make;
        delete transformed.model;
        setCategoryDetails(transformed);
      }
    } else {
      const { data } = await supabase.from(table as any).select("*").eq("id", listingId).single();
      if (data) setCategoryDetails(data);
    }
  };

  const toggleFavorite = async () => {
    if (!user) { setIsAuthModalOpen(true); return; }
    if (!listing) return;
    if (isFavorite) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", listing.id);
      setIsFavorite(false); toast.success("Removed from favorites");
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, listing_id: listing.id });
      setIsFavorite(true); toast.success("Added to favorites");
    }
  };

  // Update URL to SEO-friendly format if needed (redirect old format to new)
  useEffect(() => {
    if (listing && categorySlug && !params.slug && params.id) {
      const newUrl = generateListingUrl(listing.id, categorySlug, listing.title);
      if (window.location.pathname !== newUrl) {
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, [listing, categorySlug, params.slug, params.id]);

  const handleShare = async () => {
    const url = window.location.href;
    try { await navigator.share({ title: listing?.title, url }); }
    catch { navigator.clipboard.writeText(url); toast.success("Link copied to clipboard"); }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(price);

  const getSellerDisplayName = () => {
    if (!seller) return "the seller";
    if (seller.account_type === "business" && seller.business_name) return seller.business_name;
    return seller.display_name;
  };

  const memberSince = seller?.created_at
    ? new Date(seller.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "N/A";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-6 px-4">
          <div className="h-[480px] rounded-xl bg-muted animate-pulse mb-6" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-6 w-1/4 bg-muted animate-pulse rounded" />
              <div className="h-32 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-64 rounded-xl bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const images = listing.images?.length > 0 ? listing.images : ["/placeholder.svg"];


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6 px-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to listings
        </button>

        <BentoGallery images={images} title={listing.title} isFeatured={listing.is_featured} isUrgent={listing.is_urgent} />

        <div className="flex items-center justify-between mt-4 mb-6">
          <div className="flex gap-2">
            {categoryName && <Badge variant="secondary">{categoryName}</Badge>}
            {categoryDetails?.condition && <Badge variant="outline">{categoryDetails.condition}</Badge>}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="ghost" size="sm" onClick={toggleFavorite}>
              <Heart className={`h-4 w-4 mr-1 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
              {isFavorite ? "Saved" : "Save"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (!listing) return;
                const isInCompare = compareItems.some(i => i.id === listing.id);
                if (isInCompare) {
                  navigate("/compare");
                  return;
                }
                const success = addItem({
                  id: listing.id,
                  title: listing.title,
                  price: listing.price,
                  location: listing.location,
                  image: listing.images?.[0] || "/placeholder.svg",
                  categoryId: listing.main_category_id,
                  categorySlug,
                });
                if (success) {
                  toast.success(`Added to compare (${compareItems.length + 1}/3)`);
                } else if (compareItems.length >= 3) {
                  toast.error("Maximum 3 items to compare");
                } else {
                  toast.error("Can only compare items from the same category");
                }
              }}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              {compareItems.some(i => i.id === listing.id) ? "View Compare" : "Compare"}
            </Button>
            <ShareMenu title={listing.title} />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ─── Left: Main Content ─── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-card">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{listing.title}</h1>
              <p className="text-3xl font-bold text-primary mb-1">
                {formatPrice(listing.price)}
                {listing.is_negotiable && <span className="text-sm font-normal text-muted-foreground ml-2">Negotiable</span>}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-4">
                <div className="flex items-center gap-1"><MapPin className="h-4 w-4" />{listing.location}</div>
                <div className="flex items-center gap-1"><Clock className="h-4 w-4" />{formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}</div>
                <div className="flex items-center gap-1"><Eye className="h-4 w-4" />{listing.views} views</div>
              </div>
            </div>

            <PremiumFeatureDisplay 
              categoryDetails={categoryDetails} 
              categorySlug={categorySlug}
            />

            <div className="bg-card rounded-xl p-6 shadow-card">
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {listing.description || "No description provided."}
              </p>
            </div>

            <div className="bg-muted/50 border border-border rounded-xl p-6">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <h3 className="font-semibold text-sm text-foreground">Disclaimer</h3>
              </div>
              <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                <p>
                  This ad is offered by{" "}
                  <Link to={`/seller/${listing.user_id}`} className="text-primary font-medium hover:underline">{getSellerDisplayName()}</Link>
                  , not APA Bazaar Marketplace.
                </p>
                <p>All listings are posted and managed directly by individual users. APA Bazaar acts only as a marketplace.</p>
                <p>Visit our <Link to="/safety-tips" className="text-primary font-medium hover:underline">Safety Tips</Link> page for more details.</p>
              </div>
            </div>
          </div>

          {/* ─── Right: Modern Sidebar ─── */}
          <div className="space-y-4">
            {/* Price Card */}
            <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
              <p className="text-3xl font-extrabold text-foreground">{formatPrice(listing.price)}</p>
              {listing.is_negotiable && <span className="text-sm text-muted-foreground">Negotiable</span>}
            </div>

            {/* Seller Card — includes contact actions */}
            <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-lg font-bold overflow-hidden flex-shrink-0 ring-2 ring-primary/20">
                  {seller?.avatar_url ? (
                    <img src={seller.avatar_url} alt={getSellerDisplayName()} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary text-xl">{getSellerDisplayName().charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground truncate">{getSellerDisplayName()}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    {seller?.is_verified && (
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <Shield className="h-3 w-3" /> Verified
                      </span>
                    )}
                    <span>Member since {memberSince}</span>
                  </div>
                </div>
              </div>

              {seller?.rating !== undefined && seller.rating > 0 && (
                <div className="flex items-center gap-2 mb-4 p-2.5 rounded-lg bg-muted/40 border">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-sm">{seller.rating}/5</span>
                  <span className="text-xs text-muted-foreground">({seller.total_reviews} review{seller.total_reviews !== 1 ? "s" : ""})</span>
                </div>
              )}

              <div className="space-y-2.5">
                {seller?.phone && (
                  <Button
                    className="w-full font-semibold h-11"
                    onClick={() => {
                      if (!user) { setIsAuthModalOpen(true); return; }
                      if (showPhone) { window.location.href = `tel:${seller.phone}`; }
                      else setShowPhone(true);
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {showPhone ? seller.phone : "Show contact"}
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full h-11 font-semibold"
                  onClick={() => {
                    if (!user) { setIsAuthModalOpen(true); return; }
                    if (user.id === listing.user_id) { toast.info("You can't message yourself"); return; }
                    navigate(`/messages?user=${listing.user_id}&listing=${listing.id}`);
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start chat
                </Button>

                {seller?.whatsapp_number && (
                  <Button
                    variant="outline"
                    className="w-full border-green-500/50 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 h-11"
                    onClick={() => {
                      if (!user) { setIsAuthModalOpen(true); return; }
                      window.open(`https://wa.me/${seller.whatsapp_number!.replace(/\D/g, "")}?text=Hi, I'm interested in your listing: ${listing.title}`, "_blank");
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                  </Button>
                )}
              </div>

              <Separator className="my-4" />

              <Button
                variant="ghost"
                className="w-full justify-start text-sm text-muted-foreground hover:text-primary"
                onClick={() => navigate(`/seller/${listing.user_id}`)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View seller profile
              </Button>
            </div>

            {/* Sidebar Promotion Slot */}
            <SidebarPromotionSlot promos={sidebarPromos} categorySlug={categorySlug} />

            {/* Safety Tips */}
            <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Safety tips
              </h4>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li className="flex items-start gap-2"><span className="mt-0.5">•</span>Avoid paying in advance, even for delivery</li>
                <li className="flex items-start gap-2"><span className="mt-0.5">•</span>Meet with the seller at a safe public place</li>
                <li className="flex items-start gap-2"><span className="mt-0.5">•</span>Inspect the item and ensure it's exactly what you want</li>
                <li className="flex items-start gap-2"><span className="mt-0.5">•</span>Make sure that the packed item is the one you've inspected</li>
                <li className="flex items-start gap-2"><span className="mt-0.5">•</span>Only pay if you're satisfied</li>
              </ul>
            </div>

            {/* Post Similar Ad CTA */}
            <Button
              variant="outline"
              className="w-full h-11"
              onClick={() => user ? navigate("/post-ad") : setIsAuthModalOpen(true)}
            >
              Post Ad Like This
            </Button>

            {/* Report Ad — proper button */}
            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => {
                if (!user) { setIsAuthModalOpen(true); return; }
                setReportOpen(true);
              }}
            >
              <Flag className="h-4 w-4 mr-2" />
              Report this ad
            </Button>
            <ReportAdDialog listingId={listing.id} onAuthRequired={() => setIsAuthModalOpen(true)} open={reportOpen} onOpenChange={setReportOpen} />
          </div>
        </div>

        <SimilarAds categoryId={listing.main_category_id} currentId={listing.id} categorySlug={categorySlug} />
      </main>

      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} defaultTab="login" />
    </div>
  );
};

const SimilarAds = ({ categoryId, currentId, categorySlug }: { categoryId: string; currentId: string; categorySlug?: string }) => {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!categoryId) return;
      setLoading(true);
      const { data } = await supabase.from("base_listings")
        .select("*, main_category:main_categories(slug)")
        .eq("main_category_id", categoryId).eq("status", "active")
        .neq("id", currentId).order("created_at", { ascending: false }).limit(6);
      if (data) setAds(data);
      setLoading(false);
    };
    load();
  }, [categoryId, currentId]);

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
            categorySlug={(ad as any).main_category?.slug || categorySlug}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductDetail;
