import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Search, Filter, MoreVertical, Shield, ShieldOff, Eye, Mail,
  Ban, CheckCircle, AlertTriangle, FileText, MessageSquare, Package, UserCog,
  Crown, Zap, Megaphone
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  phone: string | null;
  location: string | null;
  is_verified: boolean;
  created_at: string;
  rating: number;
  total_reviews: number;
  account_type: string;
  business_name: string | null;
}

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [assignPackageUser, setAssignPackageUser] = useState<UserProfile | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [changeRoleUser, setChangeRoleUser] = useState<UserProfile | null>(null);
  const [newAccountType, setNewAccountType] = useState("");
  // New assignment states
  const [assignTierUser, setAssignTierUser] = useState<UserProfile | null>(null);
  const [selectedTierId, setSelectedTierId] = useState("");
  const [assignBumpUser, setAssignBumpUser] = useState<UserProfile | null>(null);
  const [selectedBumpId, setSelectedBumpId] = useState("");
  const [assignPromoUser, setAssignPromoUser] = useState<UserProfile | null>(null);
  const [selectedPromoId, setSelectedPromoId] = useState("");

  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as UserProfile[];
    }
  });

  const { data: userEmails } = useQuery({
    queryKey: ["admin-user-emails"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_user_emails");
      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach((row: any) => { map[row.user_id] = row.email; });
      return map;
    }
  });

  const { data: userRoles } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("user_id, role");
      if (error) throw error;
      return data;
    }
  });

  const { data: userListingsCounts } = useQuery({
    queryKey: ["admin-user-listings-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("base_listings").select("user_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      data?.forEach(listing => { counts[listing.user_id] = (counts[listing.user_id] || 0) + 1; });
      return counts;
    }
  });

  const { data: userSubscriptions } = useQuery({
    queryKey: ["admin-user-subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("seller_subscriptions").select("user_id, status, subscription_packages(name)").eq("status", "active");
      if (error) throw error;
      return data;
    }
  });

  // Fetch available items for assignment
  const { data: packages } = useQuery({
    queryKey: ["admin-available-packages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subscription_packages").select("*").eq("is_active", true).order("display_order");
      if (error) throw error;
      return data;
    }
  });

  const { data: listingTiers } = useQuery({
    queryKey: ["admin-listing-tiers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("listing_tiers").select("*").eq("is_active", true).order("display_order");
      if (error) throw error;
      return data;
    }
  });

  const { data: bumpPackages } = useQuery({
    queryKey: ["admin-bump-packages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bump_packages").select("*").eq("is_active", true).order("display_order");
      if (error) throw error;
      return data;
    }
  });

  const { data: promotionTypes } = useQuery({
    queryKey: ["admin-promotion-types"],
    queryFn: async () => {
      const { data, error } = await supabase.from("promotion_types").select("*").eq("is_active", true).order("display_order");
      if (error) throw error;
      return data;
    }
  });

  // Assign subscription package
  const assignPackage = useMutation({
    mutationFn: async ({ userId, packageId }: { userId: string; packageId: string }) => {
      const pkg = packages?.find(p => p.id === packageId);
      if (!pkg) throw new Error("Package not found");
      await supabase.from("seller_subscriptions").update({ status: "cancelled" as any }).eq("user_id", userId).eq("status", "active");
      const now = new Date();
      const expiresAt = new Date(now.getTime() + pkg.duration_days * 24 * 60 * 60 * 1000);
      const { error } = await supabase.from("seller_subscriptions").insert({
        user_id: userId, package_id: packageId, status: "active" as any, payment_status: "completed" as any,
        starts_at: now.toISOString(), expires_at: expiresAt.toISOString(), ads_used: 0, payment_reference: "admin_assigned",
      });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-user-subscriptions"] }); toast.success("Package assigned successfully"); setAssignPackageUser(null); setSelectedPackageId(""); },
    onError: (err: Error) => toast.error("Failed: " + err.message),
  });

  // Assign bump credits
  const assignBumps = useMutation({
    mutationFn: async ({ userId, bumpId }: { userId: string; bumpId: string }) => {
      const bp = bumpPackages?.find(b => b.id === bumpId);
      if (!bp) throw new Error("Bump package not found");
      const { error } = await supabase.rpc("add_bump_credits", { p_user_id: userId, p_credits: bp.credits, p_package_id: bumpId });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Bump credits assigned"); setAssignBumpUser(null); setSelectedBumpId(""); },
    onError: (err: Error) => toast.error("Failed: " + err.message),
  });

  // Toggle verification
  const toggleVerification = useMutation({
    mutationFn: async ({ userId, isVerified }: { userId: string; isVerified: boolean }) => {
      const { error } = await supabase.from("profiles").update({ is_verified: !isVerified }).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.refetchQueries({ queryKey: ["admin-users"] }); // Force refetch to update UI immediately
      toast.success("Verification status updated"); 
    },
    onError: () => toast.error("Failed to update verification status"),
  });

  // Change account type
  const changeAccountType = useMutation({
    mutationFn: async ({ userId, accountType }: { userId: string; accountType: string }) => {
      const { error } = await supabase.rpc("admin_set_account_type", { target_user_id: userId, new_account_type: accountType });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Account type updated"); setChangeRoleUser(null); setNewAccountType(""); },
    onError: (err: Error) => toast.error("Failed: " + err.message),
  });

  const getUserSubscription = (userId: string) => {
    const sub = userSubscriptions?.find(s => s.user_id === userId);
    return sub?.subscription_packages?.name || null;
  };

  // Get user IDs that have roles (admin/moderator) - they belong in Team section
  const roleUserIds = new Set(userRoles?.map(r => r.user_id) || []);

  const filteredUsers = users?.filter(user => {
    // Exclude users who have admin/moderator roles - they appear in Team
    if (roleUserIds.has(user.user_id)) return false;

    const email = userEmails?.[user.user_id] || "";
    const matchesSearch = 
      user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery);
    if (roleFilter === "all") return matchesSearch;
    return matchesSearch && user.account_type === roleFilter;
  });

  const fmt = (p: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(p);

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
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage all platform users ({users?.length || 0} total)</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, email, location, or phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="seller">Sellers</SelectItem>
                <SelectItem value="business">Businesses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Account Type</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Listings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>{user.display_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {user.display_name}
                          {user.is_verified && <CheckCircle className="h-4 w-4 text-primary" />}
                        </div>
                        <div className="text-sm text-muted-foreground">{user.location || "No location"}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-sm">{userEmails?.[user.user_id] || "—"}</span></TableCell>
                  <TableCell>
                    <Badge variant={user.account_type === "business" ? "default" : user.account_type === "seller" ? "outline" : "secondary"}>
                      {user.account_type === "business" ? "Business" : user.account_type === "seller" ? "Seller" : "Customer"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getUserSubscription(user.user_id) ? (
                      <Badge variant="outline">{getUserSubscription(user.user_id)}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {userListingsCounts?.[user.user_id] || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.is_verified ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Verified</Badge>
                    ) : (
                      <Badge variant="secondary">Unverified</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(user.created_at), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                          <Eye className="h-4 w-4 mr-2" />View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setChangeRoleUser(user); setNewAccountType(user.account_type || "customer"); }}>
                          <UserCog className="h-4 w-4 mr-2" />Change Account Type
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Assign Packages</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setAssignPackageUser(user)}>
                          <Package className="h-4 w-4 mr-2" />Assign Subscription
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setAssignTierUser(user)}>
                          <Crown className="h-4 w-4 mr-2" />Assign Ad Tier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setAssignBumpUser(user)}>
                          <Zap className="h-4 w-4 mr-2" />Assign Bump Credits
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setAssignPromoUser(user)}>
                          <Megaphone className="h-4 w-4 mr-2" />Assign Promotion
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />Send Message
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toggleVerification.mutate({ userId: user.user_id, isVerified: user.is_verified || false })}>
                          {user.is_verified ? (<><ShieldOff className="h-4 w-4 mr-2" />Remove Verification</>) : (<><Shield className="h-4 w-4 mr-2" />Verify User</>)}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-yellow-600">
                          <AlertTriangle className="h-4 w-4 mr-2" />Issue Warning
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Ban className="h-4 w-4 mr-2" />Suspend User
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

      {/* Change Account Type Dialog */}
      <Dialog open={!!changeRoleUser} onOpenChange={() => { setChangeRoleUser(null); setNewAccountType(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Account Type</DialogTitle>
            <DialogDescription>
              Change the account type for <strong>{changeRoleUser?.display_name}</strong>
              {userEmails?.[changeRoleUser?.user_id || ""] && (<> ({userEmails[changeRoleUser!.user_id]})</>)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Current Type</Label>
              <Badge variant="outline" className="text-sm">
                {changeRoleUser?.account_type === "business" ? "Business" : changeRoleUser?.account_type === "seller" ? "Seller" : "Customer"}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label>New Account Type</Label>
              <Select value={newAccountType} onValueChange={setNewAccountType}>
                <SelectTrigger><SelectValue placeholder="Select account type..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setChangeRoleUser(null); setNewAccountType(""); }}>Cancel</Button>
              <Button disabled={!newAccountType || newAccountType === changeRoleUser?.account_type || changeAccountType.isPending} onClick={() => changeRoleUser && changeAccountType.mutate({ userId: changeRoleUser.user_id, accountType: newAccountType })}>
                {changeAccountType.isPending ? "Updating..." : "Update Account Type"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Subscription Package Dialog */}
      <Dialog open={!!assignPackageUser} onOpenChange={() => { setAssignPackageUser(null); setSelectedPackageId(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Assign Subscription</DialogTitle>
            <DialogDescription>Manually assign a subscription package to {assignPackageUser?.display_name}. This replaces any active subscription.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Package</Label>
              <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                <SelectTrigger><SelectValue placeholder="Choose a package..." /></SelectTrigger>
                <SelectContent>
                  {packages?.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>{pkg.name} — {fmt(pkg.price)} / {pkg.duration_days} days ({pkg.max_ads} ads)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setAssignPackageUser(null); setSelectedPackageId(""); }}>Cancel</Button>
              <Button disabled={!selectedPackageId || assignPackage.isPending} onClick={() => assignPackageUser && assignPackage.mutate({ userId: assignPackageUser.user_id, packageId: selectedPackageId })}>
                {assignPackage.isPending ? "Assigning..." : "Assign Package"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Ad Tier Dialog */}
      <Dialog open={!!assignTierUser} onOpenChange={() => { setAssignTierUser(null); setSelectedTierId(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Crown className="h-5 w-5 text-yellow-600" />Assign Ad Tier</DialogTitle>
            <DialogDescription>
              Assign an ad tier to {assignTierUser?.display_name}. Note: Ad tiers are typically applied per-listing. This will create a tier purchase record the user can apply to any of their active listings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Tier</Label>
              <Select value={selectedTierId} onValueChange={setSelectedTierId}>
                <SelectTrigger><SelectValue placeholder="Choose a tier..." /></SelectTrigger>
                <SelectContent>
                  {listingTiers?.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id}>
                      {tier.name} — {fmt(tier.price)} per ad (Priority: {tier.priority_weight})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setAssignTierUser(null); setSelectedTierId(""); }}>Cancel</Button>
              <Button disabled={!selectedTierId} onClick={async () => {
                if (!assignTierUser || !selectedTierId) return;
                try {
                  const tier = listingTiers?.find(t => t.id === selectedTierId);
                  
                  // Get user's first active listing to use for the tier purchase
                  // If they don't have any listings, we'll need to handle that
                  const { data: userListings } = await supabase
                    .from("base_listings")
                    .select("id")
                    .eq("user_id", assignTierUser.user_id)
                    .eq("status", "active")
                    .limit(1)
                    .single();

                  if (!userListings) {
                    toast.error("User must have at least one active listing to assign a tier. Please create a listing first.");
                    return;
                  }

                  const { error } = await supabase.from("listing_tier_purchases").insert({
                    user_id: assignTierUser.user_id,
                    tier_id: selectedTierId,
                    listing_id: userListings.id,
                    status: "active",
                    payment_status: "completed",
                    payment_reference: "admin_assigned",
                    expires_at: tier?.included_featured_days ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
                  });
                  if (error) throw error;
                  
                  // Also update the listing to use this tier
                  await supabase
                    .from("base_listings")
                    .update({ tier_id: selectedTierId, tier_priority: tier?.priority_weight || 0 })
                    .eq("id", userListings.id);
                  
                  toast.success(`${tier?.name} tier assigned to ${assignTierUser.display_name}'s listing`);
                  queryClient.invalidateQueries({ queryKey: ["admin-users"] });
                  setAssignTierUser(null);
                  setSelectedTierId("");
                } catch (err: any) {
                  toast.error("Failed: " + err.message);
                }
              }}>
                Assign Tier
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Bump Credits Dialog */}
      <Dialog open={!!assignBumpUser} onOpenChange={() => { setAssignBumpUser(null); setSelectedBumpId(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-blue-600" />Assign Bump Credits</DialogTitle>
            <DialogDescription>Add bump credits to {assignBumpUser?.display_name}'s wallet. Credits can be used to push ads to the top.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Bump Package</Label>
              <Select value={selectedBumpId} onValueChange={setSelectedBumpId}>
                <SelectTrigger><SelectValue placeholder="Choose a bump package..." /></SelectTrigger>
                <SelectContent>
                  {bumpPackages?.map((bp) => (
                    <SelectItem key={bp.id} value={bp.id}>{bp.name} — {bp.credits} credits ({fmt(bp.price)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setAssignBumpUser(null); setSelectedBumpId(""); }}>Cancel</Button>
              <Button disabled={!selectedBumpId || assignBumps.isPending} onClick={() => assignBumpUser && assignBumps.mutate({ userId: assignBumpUser.user_id, bumpId: selectedBumpId })}>
                {assignBumps.isPending ? "Assigning..." : "Assign Credits"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Promotion Dialog */}
      <Dialog open={!!assignPromoUser} onOpenChange={() => { setAssignPromoUser(null); setSelectedPromoId(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-orange-600" />Assign Promotion</DialogTitle>
            <DialogDescription>
              Assign a promotion slot to {assignPromoUser?.display_name}. The user's ads will appear in the selected placement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Promotion Type</Label>
              <Select value={selectedPromoId} onValueChange={setSelectedPromoId}>
                <SelectTrigger><SelectValue placeholder="Choose a promotion..." /></SelectTrigger>
                <SelectContent>
                  {promotionTypes?.map((promo) => (
                    <SelectItem key={promo.id} value={promo.id}>{promo.name} — {promo.placement} • {promo.duration_days} days ({fmt(promo.price)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setAssignPromoUser(null); setSelectedPromoId(""); }}>Cancel</Button>
              <Button disabled={!selectedPromoId} onClick={async () => {
                if (!assignPromoUser || !selectedPromoId) return;
                try {
                  const promo = promotionTypes?.find(p => p.id === selectedPromoId);
                  if (!promo) throw new Error("Promotion not found");
                  
                  // Get user's first active listing to use for the promotion
                  const { data: userListings } = await supabase
                    .from("base_listings")
                    .select("id")
                    .eq("user_id", assignPromoUser.user_id)
                    .eq("status", "active")
                    .limit(1)
                    .single();

                  if (!userListings) {
                    toast.error("User must have at least one active listing to assign a promotion. Please create a listing first.");
                    return;
                  }

                  const expiresAt = new Date(Date.now() + promo.duration_days * 24 * 60 * 60 * 1000);
                  const { error } = await supabase.from("listing_promotions").insert({
                    user_id: assignPromoUser.user_id,
                    promotion_type_id: selectedPromoId,
                    listing_id: userListings.id,
                    status: "active",
                    payment_status: "completed",
                    payment_reference: "admin_assigned",
                    expires_at: expiresAt.toISOString(),
                  });
                  if (error) throw error;
                  
                  // Also update the listing to use this promotion
                  await supabase
                    .from("base_listings")
                    .update({ 
                      promotion_type_id: selectedPromoId,
                      promotion_expires_at: expiresAt.toISOString()
                    })
                    .eq("id", userListings.id);
                  
                  toast.success(`${promo.name} promotion assigned to ${assignPromoUser.display_name}'s listing`);
                  queryClient.invalidateQueries({ queryKey: ["admin-users"] });
                  setAssignPromoUser(null);
                  setSelectedPromoId("");
                } catch (err: any) {
                  toast.error("Failed: " + err.message);
                }
              }}>
                Assign Promotion
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View and manage user information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar_url || undefined} />
                  <AvatarFallback className="text-xl">{selectedUser.display_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    {selectedUser.display_name}
                    {selectedUser.is_verified && <Badge className="bg-green-100 text-green-700">Verified</Badge>}
                  </h3>
                  <p className="text-sm text-muted-foreground">{userEmails?.[selectedUser.user_id] || "No email"}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.location}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium">{userEmails?.[selectedUser.user_id] || "Not available"}</div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium">{selectedUser.phone || "Not provided"}</div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground">Account Type</div>
                  <div className="font-medium capitalize">{selectedUser.account_type || "Customer"}</div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground">Rating</div>
                  <div className="font-medium">{selectedUser.rating || 0} ({selectedUser.total_reviews || 0} reviews)</div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground">Total Listings</div>
                  <div className="font-medium">{userListingsCounts?.[selectedUser.user_id] || 0}</div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground">Member Since</div>
                  <div className="font-medium">{format(new Date(selectedUser.created_at), "MMMM dd, yyyy")}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => { setSelectedUser(null); setChangeRoleUser(selectedUser); setNewAccountType(selectedUser.account_type || "customer"); }}>
                  <UserCog className="h-4 w-4 mr-2" />Change Role
                </Button>
                <Button variant="outline" onClick={() => { setSelectedUser(null); setAssignPackageUser(selectedUser); }}>
                  <Package className="h-4 w-4 mr-2" />Assign Subscription
                </Button>
                <Button variant="outline" onClick={() => { setSelectedUser(null); setAssignTierUser(selectedUser); }}>
                  <Crown className="h-4 w-4 mr-2" />Assign Ad Tier
                </Button>
                <Button variant="outline" onClick={() => { setSelectedUser(null); setAssignBumpUser(selectedUser); }}>
                  <Zap className="h-4 w-4 mr-2" />Assign Bumps
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;