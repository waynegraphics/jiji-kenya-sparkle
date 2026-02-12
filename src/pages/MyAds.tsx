import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  Loader2, 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  MapPin, 
  Clock,
  Package
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Listing = Tables<"listings">;

const MyAds = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    fetchMyListings();
  }, [user, navigate]);

  const fetchMyListings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast.error("Failed to load your ads");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      // First, delete images from storage
      const listing = listings.find((l) => l.id === id);
      if (listing?.images && listing.images.length > 0) {
        const imagePaths = listing.images.map((url) => {
          const parts = url.split("/listings/");
          return parts[1] || "";
        }).filter(Boolean);

        if (imagePaths.length > 0) {
          await supabase.storage.from("listings").remove(imagePaths);
        }
      }

      // Delete the listing
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setListings((prev) => prev.filter((l) => l.id !== id));
      toast.success("Ad deleted successfully");
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error("Failed to delete ad");
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      vehicles: "Vehicles",
      property: "Property",
      phones: "Phones & Tablets",
      fashion: "Fashion",
      services: "Services",
      jobs: "Jobs",
      furniture: "Furniture",
      pets: "Animals & Pets",
      kids: "Babies & Kids",
      sports: "Sports & Outdoors",
      electronics: "Electronics",
      health: "Health & Beauty",
    };
    return labels[category] || category;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            My Ads
          </h1>
          <Button onClick={() => navigate("/post-ad")} className="bg-primary">
            <Plus className="h-4 w-4 mr-2" />
            Post New Ad
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-card rounded-xl p-12 text-center shadow-card">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No ads yet
            </h2>
            <p className="text-muted-foreground mb-6">
              You haven't posted any ads yet. Start selling by posting your first ad!
            </p>
            <Button onClick={() => navigate("/post-ad")} size="lg" className="bg-primary">
              <Plus className="h-4 w-4 mr-2" />
              Post Your First Ad
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-card rounded-xl shadow-card overflow-hidden hover:shadow-card-hover transition-shadow"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <Link
                    to={`/listing/${listing.id}`}
                    className="sm:w-48 h-40 sm:h-auto flex-shrink-0"
                  >
                    <img
                      src={listing.images?.[0] || "/placeholder.svg"}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Content */}
                  <div className="flex-1 p-4 flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Link
                          to={`/listing/${listing.id}`}
                          className="text-lg font-semibold text-foreground hover:text-primary line-clamp-1"
                        >
                          {listing.title}
                        </Link>
                        <div className="flex gap-1 flex-shrink-0">
                          {listing.is_urgent && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                          {listing.is_featured && (
                            <Badge className="bg-apa-yellow text-foreground text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-xl font-bold text-primary mb-2">
                        {formatPrice(listing.price)}
                        {listing.is_negotiable && (
                          <span className="text-sm font-normal text-muted-foreground ml-2">
                            Negotiable
                          </span>
                        )}
                      </p>

                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {listing.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(listing.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {listing.views || 0} views
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(listing.category)}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/listing/${listing.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/edit-ad/${listing.id}`)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            {deletingId === listing.id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-1" />
                            )}
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this ad?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your
                              ad "{listing.title}" and remove it from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(listing.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyAds;
