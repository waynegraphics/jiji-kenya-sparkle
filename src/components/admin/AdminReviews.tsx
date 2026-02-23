import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface ReviewRow {
  id: string;
  reviewer_id: string;
  seller_id: string;
  rating: number;
  comment: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  reviewer_name?: string;
  seller_name?: string;
}

const AdminReviews = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("pending");
  const [selected, setSelected] = useState<ReviewRow | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-reviews", tab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("status", tab)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for reviewers and sellers
      const userIds = [...new Set((data || []).flatMap((r: any) => [r.reviewer_id, r.seller_id]))];
      let profileMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", userIds);
        if (profiles) {
          profiles.forEach((p: any) => { profileMap[p.user_id] = p.display_name; });
        }
      }

      return (data || []).map((r: any) => ({
        ...r,
        reviewer_name: profileMap[r.reviewer_id] || "Unknown",
        seller_name: profileMap[r.seller_id] || "Unknown",
      }));
    },
  });

  const handleAction = async (reviewId: string, status: "approved" | "rejected" | "pending") => {
    setActionLoading(true);
    const { error } = await supabase
      .from("reviews")
      .update({ status, admin_notes: adminNotes || null })
      .eq("id", reviewId);

    if (error) {
      toast.error("Failed to update review");
    } else {
      toast.success(`Review ${status}`);
      setSelected(null);
      setAdminNotes("");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-sidebar-counts"] });
    }
    setActionLoading(false);
  };

  const Stars = ({ rating }: { rating: number }) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-3.5 w-3.5 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case "approved": return <Badge className="gap-1 bg-primary"><CheckCircle className="h-3 w-3" />Approved</Badge>;
      case "rejected": return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Review Moderation</h1>
        <p className="text-muted-foreground">All user reviews require moderation before being published.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Pending
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" /> Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-1.5">
            <XCircle className="h-3.5 w-3.5" /> Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Reviews ({reviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No {tab} reviews.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reviewer</TableHead>
                        <TableHead>Seller</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Comment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviews.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell className="font-medium text-sm">{review.reviewer_name}</TableCell>
                          <TableCell className="text-sm">{review.seller_name}</TableCell>
                          <TableCell><Stars rating={review.rating} /></TableCell>
                          <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                            {review.comment || "—"}
                          </TableCell>
                          <TableCell>{statusBadge(review.status)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => { setSelected(review); setAdminNotes(review.admin_notes || ""); }}>
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              {tab === "pending" && (
                                <>
                                  <Button size="sm" variant="ghost" className="text-primary" onClick={() => handleAction(review.id, "approved")}>
                                    <CheckCircle className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { setSelected(review); setAdminNotes(""); }}>
                                    <XCircle className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Reviewer</p>
                  <p className="font-medium">{selected.reviewer_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Seller</p>
                  <p className="font-medium">{selected.seller_name}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Rating</p>
                <Stars rating={selected.rating} />
              </div>
              {selected.comment && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Comment</p>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{selected.comment}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-sm mb-1">Admin Notes (optional)</p>
                <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Reason for rejection or notes..." rows={3} />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            {selected?.status === "pending" && (
              <>
                <Button variant="destructive" onClick={() => selected && handleAction(selected.id, "rejected")} disabled={actionLoading}>
                  Reject
                </Button>
                <Button className="bg-primary hover:bg-primary/90" onClick={() => selected && handleAction(selected.id, "approved")} disabled={actionLoading}>
                  Approve
                </Button>
              </>
            )}
            {selected?.status !== "pending" && (
              <>
                <Button variant="outline" onClick={() => selected && handleAction(selected.id, "pending")} disabled={actionLoading}>
                  Move to Pending
                </Button>
                {selected?.status === "rejected" && (
                  <Button className="bg-primary hover:bg-primary/90" onClick={() => selected && handleAction(selected.id, "approved")} disabled={actionLoading}>
                    Approve
                  </Button>
                )}
                {selected?.status === "approved" && (
                  <Button variant="destructive" onClick={() => selected && handleAction(selected.id, "rejected")} disabled={actionLoading}>
                    Reject
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReviews;
