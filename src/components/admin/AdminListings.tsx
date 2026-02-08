import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Star,
  ExternalLink
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface BaseListing {
  id: string;
  title: string;
  price: number;
  currency: string;
  location: string;
  status: string;
  is_featured: boolean;
  views: number;
  created_at: string;
  user_id: string;
  images: string[];
  main_categories?: { name: string; slug: string };
}

const AdminListings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch listings
  const { data: listings, isLoading } = useQuery({
    queryKey: ["admin-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("base_listings")
        .select(`
          id, title, price, currency, location, status, is_featured, views, created_at, user_id, images,
          main_categories (name, slug)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BaseListing[];
    }
  });

  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ["main-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("main_categories")
        .select("id, name, slug")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    }
  });

  // Fetch user profiles
  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name");
      if (error) throw error;
      return data;
    }
  });

  // Update listing status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("base_listings")
        .update({ status })
        .eq("id", id);
      if (error) throw error;

      // Log moderation action
      await supabase.from("moderation_logs").insert({
        admin_id: user?.id,
        action_type: status === 'active' ? 'approve_listing' : 'reject_listing',
        target_listing_id: id,
        reason: `Listing ${status === 'active' ? 'approved' : 'rejected'}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success("Listing status updated");
    },
    onError: () => {
      toast.error("Failed to update listing status");
    }
  });

  // Toggle featured
  const toggleFeatured = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
      const { error } = await supabase
        .from("base_listings")
        .update({ is_featured: !isFeatured })
        .eq("id", id);
      if (error) throw error;

      if (!isFeatured) {
        await supabase.from("moderation_logs").insert({
          admin_id: user?.id,
          action_type: 'feature_listing',
          target_listing_id: id,
          reason: 'Listing featured by admin'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success("Featured status updated");
    },
    onError: () => {
      toast.error("Failed to update featured status");
    }
  });

  // Delete listing
  const deleteListing = useMutation({
    mutationFn: async (id: string) => {
      // Log before delete
      await supabase.from("moderation_logs").insert({
        admin_id: user?.id,
        action_type: 'delete_listing',
        target_listing_id: id,
        reason: 'Listing deleted by admin'
      });

      const { error } = await supabase
        .from("base_listings")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success("Listing deleted");
    },
    onError: () => {
      toast.error("Failed to delete listing");
    }
  });

  // Get seller name
  const getSellerName = (userId: string) => {
    return profiles?.find(p => p.user_id === userId)?.display_name || "Unknown";
  };

  // Filter listings
  const filteredListings = listings?.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || listing.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || listing.main_categories?.slug === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-700">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-700">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-700">Rejected</Badge>;
      case 'expired':
        return <Badge className="bg-gray-500/20 text-gray-700">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Listings Management</h2>
        <p className="text-muted-foreground">
          Manage all platform listings ({listings?.length || 0} total)
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map(cat => (
                  <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Listings Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Listing</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredListings?.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
                        {listing.images?.[0] ? (
                          <img 
                            src={listing.images[0]} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="max-w-[200px]">
                        <div className="font-medium truncate flex items-center gap-2">
                          {listing.title}
                          {listing.is_featured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {listing.location}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{listing.main_categories?.name || "—"}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {getSellerName(listing.user_id)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {listing.currency} {listing.price.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      {listing.views || 0}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(listing.status || 'active')}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(listing.created_at), "MMM dd")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to={`/listing/${listing.id}`} target="_blank">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Listing
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Listing
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {listing.status !== 'active' && (
                          <DropdownMenuItem 
                            onClick={() => updateStatus.mutate({ id: listing.id, status: 'active' })}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        {listing.status !== 'rejected' && (
                          <DropdownMenuItem 
                            onClick={() => updateStatus.mutate({ id: listing.id, status: 'rejected' })}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => toggleFeatured.mutate({ 
                            id: listing.id, 
                            isFeatured: listing.is_featured || false 
                          })}
                        >
                          <Star className="h-4 w-4 mr-2" />
                          {listing.is_featured ? "Remove Featured" : "Make Featured"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this listing?")) {
                              deleteListing.mutate(listing.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Listing
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminListings;