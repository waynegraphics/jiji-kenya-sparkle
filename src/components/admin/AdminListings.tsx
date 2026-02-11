import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Search, Eye, Edit, Trash2, CheckCircle, XCircle, Star, ExternalLink,
  MoreVertical, AlertTriangle, FileText
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";

interface BaseListing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  location: string;
  status: string;
  is_featured: boolean;
  views: number;
  created_at: string;
  user_id: string;
  images: string[];
  rejection_note: string | null;
  previous_data: Record<string, unknown> | null;
  edited_fields: string[] | null;
  main_categories?: { name: string; slug: string };
}

const AdminListings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [rejectDialog, setRejectDialog] = useState<BaseListing | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [previewDialog, setPreviewDialog] = useState<BaseListing | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: listings, isLoading } = useQuery({
    queryKey: ["admin-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("base_listings")
        .select(`id, title, description, price, currency, location, status, is_featured, views, created_at, user_id, images, rejection_note, previous_data, edited_fields, main_categories(name, slug)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as BaseListing[];
    }
  });

  const { data: categories } = useQuery({
    queryKey: ["main-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("main_categories").select("id, name, slug").eq("is_active", true);
      if (error) throw error;
      return data;
    }
  });

  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("user_id, display_name");
      if (error) throw error;
      return data;
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      const updateData: Record<string, unknown> = { status };
      if (note) updateData.rejection_note = note;
      if (status === 'active') {
        updateData.rejection_note = null;
        updateData.previous_data = null;
        updateData.edited_fields = null;
      }
      const { error } = await supabase.from("base_listings").update(updateData).eq("id", id);
      if (error) throw error;
      await supabase.from("moderation_logs").insert({
        admin_id: user?.id,
        action_type: status === 'active' ? 'approve_listing' : 'reject_listing',
        target_listing_id: id,
        reason: note || `Listing ${status === 'active' ? 'approved' : 'rejected'}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success("Listing status updated");
      setRejectDialog(null);
      setRejectionNote("");
    },
    onError: () => toast.error("Failed to update listing status"),
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
      const { error } = await supabase.from("base_listings").update({ is_featured: !isFeatured }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success("Featured status updated");
    },
  });

  const deleteListing = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("moderation_logs").insert({
        admin_id: user?.id, action_type: 'delete_listing', target_listing_id: id, reason: 'Listing deleted by admin'
      });
      const { error } = await supabase.from("base_listings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success("Listing deleted");
    },
  });

  const getSellerName = (userId: string) => profiles?.find(p => p.user_id === userId)?.display_name || "Unknown";

  const pendingCount = listings?.filter(l => l.status === 'pending').length || 0;
  const rejectedCount = listings?.filter(l => l.status === 'rejected').length || 0;

  const filteredListings = listings?.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || listing.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || listing.main_categories?.slug === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-500/20 text-green-700">Active</Badge>;
      case 'pending': return <Badge className="bg-yellow-500/20 text-yellow-700">Pending</Badge>;
      case 'rejected': return <Badge className="bg-red-500/20 text-red-700">Rejected</Badge>;
      case 'expired': return <Badge className="bg-gray-500/20 text-gray-700">Expired</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-[400px]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Listings Management</h2>
          <p className="text-muted-foreground">
            {listings?.length || 0} total · {pendingCount > 0 && <span className="text-yellow-600 font-medium">{pendingCount} pending review</span>}
            {rejectedCount > 0 && <span className="text-red-600 font-medium ml-2">{rejectedCount} rejected</span>}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", count: listings?.length || 0, filter: "all", color: "" },
          { label: "Active", count: listings?.filter(l => l.status === 'active').length || 0, filter: "active", color: "text-green-600" },
          { label: "Pending", count: pendingCount, filter: "pending", color: "text-yellow-600" },
          { label: "Rejected", count: rejectedCount, filter: "rejected", color: "text-red-600" },
        ].map(s => (
          <Card key={s.label} className="cursor-pointer hover:border-primary/50" onClick={() => setStatusFilter(s.filter)}>
            <CardContent className="p-3 text-center">
              <div className={`text-xl font-bold ${s.color}`}>{s.count}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search listings..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map(cat => <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>)}
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
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredListings?.map((listing) => (
                <TableRow key={listing.id} className={listing.status === 'pending' ? 'bg-yellow-50/50' : listing.edited_fields?.length ? 'bg-blue-50/30' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {listing.images?.[0] ? (
                          <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No img</div>
                        )}
                      </div>
                      <div className="max-w-[200px]">
                        <div className="font-medium truncate flex items-center gap-1">
                          {listing.title}
                          {listing.is_featured && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                          {listing.edited_fields?.length ? (
                            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200 ml-1">Edited</Badge>
                          ) : null}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">{listing.location}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{listing.main_categories?.name || "—"}</Badge></TableCell>
                  <TableCell className="text-sm">{getSellerName(listing.user_id)}</TableCell>
                  <TableCell className="font-medium">{listing.currency} {listing.price.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(listing.status || 'active')}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(listing.created_at), "MMM dd")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewDialog(listing)} title="Preview">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setPreviewDialog(listing)}>
                            <Eye className="h-4 w-4 mr-2" /> Preview Ad
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/listing/${listing.id}`} target="_blank">
                              <ExternalLink className="h-4 w-4 mr-2" /> Open in New Tab
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {listing.status !== 'active' && (
                            <DropdownMenuItem onClick={() => updateStatus.mutate({ id: listing.id, status: 'active' })}>
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> Approve
                            </DropdownMenuItem>
                          )}
                          {listing.status !== 'rejected' && (
                            <DropdownMenuItem onClick={() => { setRejectDialog(listing); setRejectionNote(""); }}>
                              <XCircle className="h-4 w-4 mr-2 text-red-600" /> Reject with Note
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => toggleFeatured.mutate({ id: listing.id, isFeatured: listing.is_featured || false })}>
                            <Star className="h-4 w-4 mr-2" /> {listing.is_featured ? "Remove Featured" : "Make Featured"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => {
                            if (confirm("Are you sure you want to delete this listing?")) deleteListing.mutate(listing.id);
                          }}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Rejection Note Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" /> Reject Listing
            </DialogTitle>
            <DialogDescription>
              Rejecting "{rejectDialog?.title}". The seller will see this rejection note.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Rejection Reason *</Label>
            <Textarea value={rejectionNote} onChange={(e) => setRejectionNote(e.target.value)}
              placeholder="Explain why this listing is being rejected..." rows={4} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>Cancel</Button>
            <Button variant="destructive" disabled={!rejectionNote.trim()}
              onClick={() => rejectDialog && updateStatus.mutate({ id: rejectDialog.id, status: 'rejected', note: rejectionNote.trim() })}>
              Reject Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewDialog} onOpenChange={() => setPreviewDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Ad Preview {getStatusBadge(previewDialog?.status || '')}
              {previewDialog?.edited_fields?.length ? (
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Has Edits</Badge>
              ) : null}
            </DialogTitle>
          </DialogHeader>
          {previewDialog && (
            <div className="space-y-4">
              {/* Images */}
              {previewDialog.images?.length > 0 && previewDialog.images[0] !== '' && (
                <div className="grid grid-cols-3 gap-2">
                  {previewDialog.images.filter(Boolean).map((img, i) => (
                    <img key={i} src={img} alt="" className="rounded-lg w-full aspect-video object-cover" />
                  ))}
                </div>
              )}

              {/* Edited fields highlight */}
              {previewDialog.edited_fields?.length ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 text-sm flex items-center gap-1 mb-2">
                    <Edit className="h-4 w-4" /> Edited Sections
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {previewDialog.edited_fields.map(f => (
                      <Badge key={f} variant="outline" className="bg-blue-100 text-blue-700 text-xs">{f}</Badge>
                    ))}
                  </div>
                  {previewDialog.previous_data && (
                    <div className="mt-2 text-xs text-blue-700">
                      <p className="font-medium mb-1">Previous values:</p>
                      {Object.entries(previewDialog.previous_data).map(([key, val]) => (
                        <div key={key} className="flex gap-2">
                          <span className="font-medium">{key}:</span>
                          <span className="line-through text-red-500">{String(val)}</span>
                          <span>→</span>
                          <span className="text-green-600">{String((previewDialog as any)[key] ?? 'N/A')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              <div className={previewDialog.edited_fields?.includes('title') ? 'ring-2 ring-blue-400 rounded p-2' : ''}>
                <h3 className="text-xl font-bold">{previewDialog.title}</h3>
              </div>
              <div className={`text-2xl font-bold text-primary ${previewDialog.edited_fields?.includes('price') ? 'ring-2 ring-blue-400 rounded p-2' : ''}`}>
                {previewDialog.currency} {previewDialog.price.toLocaleString()}
              </div>
              <div className={previewDialog.edited_fields?.includes('description') ? 'ring-2 ring-blue-400 rounded p-2' : ''}>
                <p className="text-muted-foreground whitespace-pre-wrap">{previewDialog.description || 'No description'}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span>📍 {previewDialog.location}</span>
                <span>👁 {previewDialog.views} views</span>
                <span>📅 {format(new Date(previewDialog.created_at), "PPP")}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Seller: </span>
                <span className="font-medium">{getSellerName(previewDialog.user_id)}</span>
              </div>

              {/* Rejection note if exists */}
              {previewDialog.rejection_note && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                  <span className="font-medium">Rejection note: </span>{previewDialog.rejection_note}
                </div>
              )}

              {/* Quick actions */}
              <div className="flex gap-2 pt-2 border-t">
                {previewDialog.status !== 'active' && (
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                    updateStatus.mutate({ id: previewDialog.id, status: 'active' });
                    setPreviewDialog(null);
                  }}>
                    <CheckCircle className="h-4 w-4 mr-2" /> Approve
                  </Button>
                )}
                {previewDialog.status !== 'rejected' && (
                  <Button variant="destructive" onClick={() => {
                    setPreviewDialog(null);
                    setRejectDialog(previewDialog);
                  }}>
                    <XCircle className="h-4 w-4 mr-2" /> Reject
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminListings;
