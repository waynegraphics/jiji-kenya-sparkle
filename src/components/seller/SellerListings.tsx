import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSellerAddons } from "@/hooks/useSubscriptions";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Loader2, Plus, Pencil, Trash2, Eye, MapPin, Clock,
  MoreVertical, Zap, Star, TrendingUp, Package,
  LayoutGrid, List, Search, Filter, AlertTriangle,
  CheckCircle, XCircle, FileText, Crown, Wallet
} from "lucide-react";
import Pagination from "@/components/Pagination";
import { CountdownTimer } from "@/components/CountdownTimer";

interface BaseListing {
  id: string;
  title: string;
  price: number;
  currency: string;
  location: string;
  status: string;
  is_featured: boolean;
  is_urgent: boolean;
  is_negotiable: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  images: string[];
  rejection_note: string | null;
  tier_id: string | null;
  tier_priority: number;
  tier_expires_at: string | null;
  promotion_type_id: string | null;
  promotion_expires_at: string | null;
  bumped_at: string | null;
  main_categories?: { name: string; slug: string } | null;
  listing_tiers?: { name: string; badge_label: string | null; badge_color: string } | null;
}

const SellerListings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: sellerAddons, refetch: refetchAddons } = useSellerAddons(user?.id);
  
  const [listings, setListings] = useState<BaseListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<BaseListing | null>(null);
  const [rejectionNoteDialog, setRejectionNoteDialog] = useState<string | null>(null);
  
  // View & filter state
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const adsPerPage = 20;

  useEffect(() => {
    if (!user) return;
    fetchListings();
  }, [user]);

  const fetchListings = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("base_listings")
        .select(`*, main_categories(name, slug), listing_tiers(name, badge_label, badge_color)`)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setListings((data || []) as unknown as BaseListing[]);
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast.error("Failed to load listings");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch bump wallet balance
  const { data: profile } = useQuery({
    queryKey: ["profile-bump-balance", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("bump_wallet_balance").eq("user_id", user.id).single();
      return data;
    },
    enabled: !!user,
  });

  const handleBump = async (listingId: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.rpc("bump_listing", { p_user_id: user.id, p_listing_id: listingId });
      if (error) throw error;
      if (data === false) {
        toast.error("No bump credits remaining. Purchase more bumps!");
        return;
      }
      toast.success("Ad bumped to the top!");
      queryClient.invalidateQueries({ queryKey: ["profile-bump-balance"] });
      fetchListings();
    } catch (error) {
      toast.error("Failed to bump ad");
    }
  };

  const handleDelete = async () => {
    if (!listingToDelete) return;
    setDeletingId(listingToDelete.id);
    try {
      if (listingToDelete.images && listingToDelete.images.length > 0) {
        const imagePaths = listingToDelete.images.map((url) => {
          const parts = url.split("/listings/");
          return parts[1] || "";
        }).filter(Boolean);
        if (imagePaths.length > 0) {
          await supabase.storage.from("listings").remove(imagePaths);
        }
      }
      const { error } = await supabase.from("base_listings").delete().eq("id", listingToDelete.id);
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
  };

  // Statistics
  const stats = {
    total: listings.length,
    active: listings.filter(l => l.status === "active").length,
    pending: listings.filter(l => l.status === "pending").length,
    rejected: listings.filter(l => l.status === "rejected").length,
  };

  // Filtered listings
  const filtered = listings.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / adsPerPage);
  const paginatedListings = filtered.slice((currentPage - 1) * adsPerPage, currentPage * adsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-500/20 text-green-700 border-green-300">Live</Badge>;
      case 'pending': return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-300">Pending Review</Badge>;
      case 'rejected': return <Badge className="bg-red-500/20 text-red-700 border-red-300">Rejected</Badge>;
      case 'expired': return <Badge className="bg-gray-500/20 text-gray-700 border-gray-300">Expired</Badge>;
      case 'draft': return <Badge variant="secondary">Draft</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

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
        <div className="flex items-center gap-3">
          {/* Bump Wallet */}
          <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{profile?.bump_wallet_balance || 0} bumps</span>
          </div>
          <Button onClick={() => navigate("/seller-dashboard/post-ad")}>
            <Plus className="h-4 w-4 mr-2" /> Post New Ad
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setStatusFilter("all")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Ads</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-green-500/50" onClick={() => setStatusFilter("active")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <CheckCircle className="h-3 w-3" /> Live
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-yellow-500/50" onClick={() => setStatusFilter("pending")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" /> Pending
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-red-500/50" onClick={() => setStatusFilter("rejected")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <XCircle className="h-3 w-3" /> Rejected
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your ads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Live</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-1 border rounded-md p-1">
          <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("grid")}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Listings */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {listings.length === 0 ? "No listings yet" : "No matching listings"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {listings.length === 0 ? "Start selling by posting your first ad!" : "Try adjusting your filters."}
          </p>
          {listings.length === 0 && (
            <Button onClick={() => navigate("/seller-dashboard/post-ad")} size="lg">
              <Plus className="h-4 w-4 mr-2" /> Post Your First Ad
            </Button>
          )}
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginatedListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <Link to={`/listing/${listing.id}`} className="block">
                <div className="aspect-square relative">
                  <img src={listing.images?.[0] || "/placeholder.svg"} alt={listing.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2">{getStatusBadge(listing.status)}</div>
                  {listing.is_featured && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500 text-black text-[10px]">
                      <Star className="h-3 w-3 mr-0.5" /> Featured
                    </Badge>
                  )}
                </div>
              </Link>
              <CardContent className="p-3">
                <h3 className="font-medium text-sm line-clamp-1">{listing.title}</h3>
                <p className="text-primary font-bold text-sm mt-1">{formatPrice(listing.price)}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Eye className="h-3 w-3" /> {listing.views || 0} views
                </div>
                {(listing.tier_expires_at || listing.promotion_expires_at) && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {listing.tier_expires_at && (
                      <CountdownTimer expiresAt={listing.tier_expires_at} variant="badge" showIcon={false} className="text-[10px] px-1.5 py-0.5" />
                    )}
                    {listing.promotion_expires_at && (
                      <CountdownTimer expiresAt={listing.promotion_expires_at} variant="badge" showIcon={false} className="text-[10px] px-1.5 py-0.5" />
                    )}
                  </div>
                )}
                {listing.status === "rejected" && listing.rejection_note && (
                  <button onClick={() => setRejectionNoteDialog(listing.rejection_note)}
                    className="text-xs text-red-600 underline mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> View rejection reason
                  </button>
                )}
                <div className="flex gap-1 mt-2">
                  {listing.status === "active" && (
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={(e) => { e.stopPropagation(); handleBump(listing.id); }}>
                      <Zap className="h-3 w-3" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-7" onClick={() => navigate(`/seller-dashboard/edit-ad/${listing.id}`)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-7 text-destructive" onClick={() => { setListingToDelete(listing); setDeleteDialogOpen(true); }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row">
                <Link to={`/listing/${listing.id}`} className="sm:w-48 h-40 sm:h-auto flex-shrink-0">
                  <img src={listing.images?.[0] || "/placeholder.svg"} alt={listing.title} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 p-4 flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Link to={`/listing/${listing.id}`} className="text-lg font-semibold hover:text-primary line-clamp-1">
                        {listing.title}
                      </Link>
                      <div className="flex gap-1 flex-shrink-0">
                        {getStatusBadge(listing.status)}
                        {listing.is_featured && <Badge className="bg-yellow-500 text-black text-xs">Featured</Badge>}
                      </div>
                    </div>
                    <p className="text-xl font-bold text-primary mb-2">
                      {formatPrice(listing.price)}
                      {listing.is_negotiable && <span className="text-sm font-normal text-muted-foreground ml-2">Negotiable</span>}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{listing.location}</span>
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{formatDate(listing.created_at)}</span>
                      <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{listing.views || 0} views</span>
                      {listing.main_categories && (
                        <Badge variant="outline" className="text-xs">{listing.main_categories.name}</Badge>
                      )}
                    </div>
                    {(listing.tier_expires_at || listing.promotion_expires_at) && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {listing.tier_expires_at && (
                          <div className="flex items-center gap-1 text-xs">
                            <Crown className="h-3 w-3 text-yellow-600" />
                            <span className="text-muted-foreground">Tier:</span>
                            <CountdownTimer expiresAt={listing.tier_expires_at} variant="badge" showIcon={false} />
                          </div>
                        )}
                        {listing.promotion_expires_at && (
                          <div className="flex items-center gap-1 text-xs">
                            <TrendingUp className="h-3 w-3 text-orange-600" />
                            <span className="text-muted-foreground">Promo:</span>
                            <CountdownTimer expiresAt={listing.promotion_expires_at} variant="badge" showIcon={false} />
                          </div>
                        )}
                      </div>
                    )}
                    {listing.status === "rejected" && listing.rejection_note && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium">Rejection reason: </span>
                          {listing.rejection_note}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-3 mt-3 border-t">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/listing/${listing.id}`)}>
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/seller-dashboard/edit-ad/${listing.id}`)}>
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    {listing.status === "active" && (
                      <Button variant="outline" size="sm" onClick={() => handleBump(listing.id)}>
                        <Zap className="h-4 w-4 mr-1" /> Bump
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => { setListingToDelete(listing); setDeleteDialogOpen(true); }}>
                      {deletingId === listing.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this ad?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your ad "{listingToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rejection Note Dialog */}
      <Dialog open={!!rejectionNoteDialog} onOpenChange={() => setRejectionNoteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" /> Ad Rejected
            </DialogTitle>
            <DialogDescription>Your ad was rejected for the following reason:</DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {rejectionNoteDialog}
          </div>
          <p className="text-sm text-muted-foreground">
            You can edit your ad and resubmit it for review.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerListings;
