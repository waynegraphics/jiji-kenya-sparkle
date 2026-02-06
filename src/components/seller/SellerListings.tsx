import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSellerAddons } from "@/hooks/useSubscriptions";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Loader2, 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  MapPin, 
  Clock,
  MoreVertical,
  Zap,
  Star,
  TrendingUp,
  Package
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Listing = Tables<"listings">;

const SellerListings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: sellerAddons, refetch: refetchAddons } = useSellerAddons(user?.id);
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);
  const [applyAddonDialog, setApplyAddonDialog] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [applyingAddon, setApplyingAddon] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchListings();
  }, [user]);

  const fetchListings = async () => {
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
      toast.error("Failed to load listings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!listingToDelete) return;
    
    setDeletingId(listingToDelete.id);
    try {
      // Delete images from storage
      if (listingToDelete.images && listingToDelete.images.length > 0) {
        const imagePaths = listingToDelete.images.map((url) => {
          const parts = url.split("/listings/");
          return parts[1] || "";
        }).filter(Boolean);

        if (imagePaths.length > 0) {
          await supabase.storage.from("listings").remove(imagePaths);
        }
      }

      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", listingToDelete.id);

      if (error) throw error;

      setListings((prev) => prev.filter((l) => l.id !== listingToDelete.id));
      toast.success("Ad deleted successfully");
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error("Failed to delete ad");
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
      setListingToDelete(null);
    }
  };

  // Get available add-ons by type
  const getAvailableAddons = (type: 'bumping' | 'featured' | 'promotion') => {
    if (!sellerAddons) return [];
    return sellerAddons.filter(sa => 
      sa.addon?.type === type && 
      sa.status === 'active' &&
      sa.quantity_purchased > sa.quantity_used
    );
  };

  const applyAddon = async (addonPurchaseId: string, type: 'bumping' | 'featured' | 'promotion') => {
    if (!selectedListing || !user) return;

    setApplyingAddon(true);
    try {
      // Get the addon purchase
      const addonPurchase = sellerAddons?.find(sa => sa.id === addonPurchaseId);
      if (!addonPurchase) throw new Error("Add-on not found");

      // Update listing based on type
      const updateData: Partial<Listing> = {};
      
      if (type === 'featured') {
        updateData.is_featured = true;
      } else if (type === 'bumping') {
        // Bump = update the created_at to now to move to top
        updateData.updated_at = new Date().toISOString();
      }
      // promotion could be handled differently

      // Update the listing
      const { error: listingError } = await supabase
        .from("listings")
        .update(updateData)
        .eq("id", selectedListing.id);

      if (listingError) throw listingError;

      // Increment usage count for the addon
      const { error: addonError } = await supabase
        .from("seller_addons")
        .update({ quantity_used: addonPurchase.quantity_used + 1 })
        .eq("id", addonPurchaseId);

      if (addonError) throw addonError;

      toast.success(`${type === 'featured' ? 'Featured' : type === 'bumping' ? 'Bumped' : 'Promoted'} your listing!`);
      
      // Refresh data
      fetchListings();
      refetchAddons();
      queryClient.invalidateQueries({ queryKey: ["seller-addons"] });
      
      setApplyAddonDialog(false);
      setSelectedListing(null);
    } catch (error) {
      console.error("Error applying addon:", error);
      toast.error("Failed to apply add-on");
    } finally {
      setApplyingAddon(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const bumpingAddons = getAvailableAddons('bumping');
  const featuredAddons = getAvailableAddons('featured');
  const promotionAddons = getAvailableAddons('promotion');
  const hasAddons = bumpingAddons.length > 0 || featuredAddons.length > 0 || promotionAddons.length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Listings</h2>
          <p className="text-muted-foreground">Manage and boost your ads</p>
        </div>
        <Button onClick={() => navigate("/post-ad")}>
          <Plus className="h-4 w-4 mr-2" />
          Post New Ad
        </Button>
      </div>

      {/* Add-ons Summary */}
      {hasAddons && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Available Add-ons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {bumpingAddons.length > 0 && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  <Zap className="h-3 w-3 mr-1" />
                  {bumpingAddons.reduce((sum, a) => sum + (a.quantity_purchased - a.quantity_used), 0)} Bumps
                </Badge>
              )}
              {featuredAddons.length > 0 && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  <Star className="h-3 w-3 mr-1" />
                  {featuredAddons.reduce((sum, a) => sum + (a.quantity_purchased - a.quantity_used), 0)} Featured
                </Badge>
              )}
              {promotionAddons.length > 0 && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {promotionAddons.reduce((sum, a) => sum + (a.quantity_purchased - a.quantity_used), 0)} Promotions
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Listings */}
      {listings.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
          <p className="text-muted-foreground mb-6">
            Start selling by posting your first ad!
          </p>
          <Button onClick={() => navigate("/post-ad")} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Post Your First Ad
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-md transition-shadow">
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
                        className="text-lg font-semibold hover:text-primary line-clamp-1"
                      >
                        {listing.title}
                      </Link>
                      <div className="flex gap-1 flex-shrink-0">
                        {listing.is_urgent && (
                          <Badge variant="destructive" className="text-xs">Urgent</Badge>
                        )}
                        {listing.is_featured && (
                          <Badge className="bg-yellow-500 text-black text-xs">Featured</Badge>
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

                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
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
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 mt-3 border-t">
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
                    
                    {/* Boost/Add-on dropdown */}
                    {hasAddons && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary/10">
                            <Zap className="h-4 w-4 mr-1" />
                            Boost
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Apply Add-on</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          {bumpingAddons.length > 0 && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedListing(listing);
                                applyAddon(bumpingAddons[0].id, 'bumping');
                              }}
                            >
                              <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                              Bump to Top
                              <Badge variant="secondary" className="ml-auto text-xs">
                                {bumpingAddons.reduce((sum, a) => sum + (a.quantity_purchased - a.quantity_used), 0)}
                              </Badge>
                            </DropdownMenuItem>
                          )}
                          
                          {featuredAddons.length > 0 && !listing.is_featured && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedListing(listing);
                                applyAddon(featuredAddons[0].id, 'featured');
                              }}
                            >
                              <Star className="h-4 w-4 mr-2 text-purple-500" />
                              Make Featured
                              <Badge variant="secondary" className="ml-auto text-xs">
                                {featuredAddons.reduce((sum, a) => sum + (a.quantity_purchased - a.quantity_used), 0)}
                              </Badge>
                            </DropdownMenuItem>
                          )}
                          
                          {promotionAddons.length > 0 && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedListing(listing);
                                applyAddon(promotionAddons[0].id, 'promotion');
                              }}
                            >
                              <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                              Promote
                              <Badge variant="secondary" className="ml-auto text-xs">
                                {promotionAddons.reduce((sum, a) => sum + (a.quantity_purchased - a.quantity_used), 0)}
                              </Badge>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setListingToDelete(listing);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      {deletingId === listing.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this ad?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              ad "{listingToDelete?.title}" and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SellerListings;
