import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ShieldCheck,
  ShieldX,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  FileImage,
  Loader2,
  User,
} from "lucide-react";

interface Verification {
  id: string;
  user_id: string;
  status: string;
  id_front_url: string | null;
  id_back_url: string | null;
  passport_photo_url: string | null;
  admin_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

interface Profile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  phone: string | null;
  location: string | null;
}

const AdminVerifications = () => {
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const queryClient = useQueryClient();

  // Fetch verifications
  const { data: verifications, isLoading } = useQuery({
    queryKey: ["admin-verifications", activeTab],
    queryFn: async () => {
      let query = supabase
        .from("seller_verifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (activeTab !== "all") {
        query = query.eq("status", activeTab);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Verification[];
    },
  });

  // Fetch profiles for the verifications
  const userIds = verifications?.map((v) => v.user_id) || [];
  const { data: profiles } = useQuery({
    queryKey: ["admin-verification-profiles", userIds],
    queryFn: async () => {
      if (userIds.length === 0) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, phone, location")
        .in("user_id", userIds);
      if (error) throw error;
      return data as Profile[];
    },
    enabled: userIds.length > 0,
  });

  const getProfile = (userId: string) => profiles?.find((p) => p.user_id === userId);

  // Approve / Reject mutations
  const updateVerification = useMutation({
    mutationFn: async ({ id, userId, status, notes }: { id: string; userId: string; status: string; notes: string }) => {
      // Update verification
      const { error: verError } = await supabase
        .from("seller_verifications")
        .update({
          status,
          admin_notes: notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (verError) throw verError;

      // If approved, mark profile as verified
      if (status === "approved") {
        const { error: profError } = await supabase
          .from("profiles")
          .update({ is_verified: true })
          .eq("user_id", userId);
        if (profError) throw profError;
      } else if (status === "rejected") {
        const { error: profError } = await supabase
          .from("profiles")
          .update({ is_verified: false })
          .eq("user_id", userId);
        if (profError) throw profError;
      }

      // Notify the user
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "verification_update",
        title: status === "approved" ? "Verification Approved ✅" : "Verification Rejected",
        message:
          status === "approved"
            ? "Your seller verification has been approved! You can now post listings."
            : `Your verification was rejected. ${notes ? "Reason: " + notes : "Please resubmit with valid documents."}`,
        related_id: id,
        related_type: "verification",
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-verifications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-verification-profiles"] });
      toast.success(
        variables.status === "approved" ? "Seller verified successfully" : "Verification rejected"
      );
      setSelectedVerification(null);
      setAdminNotes("");
    },
    onError: (error) => {
      toast.error("Failed to update verification: " + error.message);
    },
  });

  // Get signed URLs for private bucket images
  const getSignedUrl = async (path: string) => {
    const { data } = await supabase.storage
      .from("verifications")
      .createSignedUrl(path, 300); // 5 min expiry
    return data?.signedUrl || "";
  };

  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  const loadImages = async (v: Verification) => {
    const urls: Record<string, string> = {};
    if (v.id_front_url) urls.front = await getSignedUrl(v.id_front_url);
    if (v.id_back_url) urls.back = await getSignedUrl(v.id_back_url);
    if (v.passport_photo_url) urls.passport = await getSignedUrl(v.passport_photo_url);
    setImageUrls(urls);
  };

  const openVerification = (v: Verification) => {
    setSelectedVerification(v);
    setAdminNotes(v.admin_notes || "");
    loadImages(v);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500/20 text-green-700 gap-1"><CheckCircle className="h-3 w-3" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = verifications?.filter((v) => v.status === "pending").length || 0;

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
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Seller Verifications
          {pendingCount > 0 && (
            <Badge variant="destructive">{pendingCount} pending</Badge>
          )}
        </h2>
        <p className="text-muted-foreground">
          Review and approve seller identity verification requests
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-1">
            <Clock className="h-3.5 w-3.5" /> Pending
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-1">
            <CheckCircle className="h-3.5 w-3.5" /> Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-1">
            <XCircle className="h-3.5 w-3.5" /> Rejected
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {verifications?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ShieldCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No {activeTab} verifications</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Seller</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {verifications?.map((v) => {
                      const profile = getProfile(v.user_id);
                      return (
                        <TableRow key={v.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={profile?.avatar_url || ""} />
                                <AvatarFallback>
                                  {profile?.display_name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{profile?.display_name || "Unknown"}</p>
                                <p className="text-xs text-muted-foreground">{profile?.phone || "No phone"}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {v.id_front_url && <FileImage className="h-4 w-4 text-primary" />}
                              {v.id_back_url && <FileImage className="h-4 w-4 text-primary" />}
                              {v.passport_photo_url && <User className="h-4 w-4 text-secondary" />}
                              {!v.id_front_url && !v.id_back_url && !v.passport_photo_url && (
                                <span className="text-xs text-muted-foreground">No docs</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{statusBadge(v.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(v.created_at), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openVerification(v)}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!selectedVerification} onOpenChange={() => setSelectedVerification(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Verification</DialogTitle>
            <DialogDescription>
              Verify the seller's identity documents
            </DialogDescription>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-6">
              {/* Seller Info */}
              {(() => {
                const profile = getProfile(selectedVerification.user_id);
                return (
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback>{profile?.display_name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{profile?.display_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.phone || "No phone"} · {profile?.location || "No location"}
                      </p>
                    </div>
                    <div className="ml-auto">{statusBadge(selectedVerification.status)}</div>
                  </div>
                );
              })()}

              {/* Documents */}
              <div>
                <h4 className="font-semibold mb-3">Identity Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">ID Front</Label>
                    {imageUrls.front ? (
                      <img
                        src={imageUrls.front}
                        alt="ID Front"
                        className="w-full h-48 object-cover rounded-lg border cursor-pointer"
                        onClick={() => window.open(imageUrls.front, "_blank")}
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Not uploaded</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">ID Back</Label>
                    {imageUrls.back ? (
                      <img
                        src={imageUrls.back}
                        alt="ID Back"
                        className="w-full h-48 object-cover rounded-lg border cursor-pointer"
                        onClick={() => window.open(imageUrls.back, "_blank")}
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Not uploaded</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Passport Photo</Label>
                    {imageUrls.passport ? (
                      <img
                        src={imageUrls.passport}
                        alt="Passport Photo"
                        className="w-full h-48 object-cover rounded-lg border cursor-pointer"
                        onClick={() => window.open(imageUrls.passport, "_blank")}
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Not uploaded</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  placeholder="Add notes about this verification (visible only to admin)..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedVerification(null)}
                >
                  Cancel
                </Button>
                {selectedVerification.status !== "rejected" && (
                  <Button
                    variant="destructive"
                    disabled={updateVerification.isPending}
                    onClick={() =>
                      updateVerification.mutate({
                        id: selectedVerification.id,
                        userId: selectedVerification.user_id,
                        status: "rejected",
                        notes: adminNotes,
                      })
                    }
                  >
                    {updateVerification.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ShieldX className="h-4 w-4 mr-2" />
                    )}
                    Reject
                  </Button>
                )}
                {selectedVerification.status !== "approved" && (
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    disabled={updateVerification.isPending}
                    onClick={() =>
                      updateVerification.mutate({
                        id: selectedVerification.id,
                        userId: selectedVerification.user_id,
                        status: "approved",
                        notes: adminNotes,
                      })
                    }
                  >
                    {updateVerification.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 mr-2" />
                    )}
                    Approve
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

export default AdminVerifications;
