import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Flag, 
  User, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Ban,
  Clock
} from "lucide-react";

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  reported_listing_id: string | null;
  report_type: string;
  reason: string;
  description: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  resolved_at: string | null;
}

interface ModerationLog {
  id: string;
  admin_id: string;
  action_type: string;
  target_user_id: string | null;
  target_listing_id: string | null;
  reason: string | null;
  notes: string | null;
  created_at: string;
}

const AdminReports = () => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch reports
  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Report[];
    }
  });

  // Fetch moderation logs
  const { data: moderationLogs } = useQuery({
    queryKey: ["moderation-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moderation_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as ModerationLog[];
    }
  });

  // Fetch profiles
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

  // Update report
  const updateReport = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const updates: Partial<Report> = { 
        status,
        admin_notes: notes || null
      };
      if (status === 'reviewed' || status === 'action_taken' || status === 'dismissed') {
        updates.resolved_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from("reports")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      setSelectedReport(null);
      setAdminNotes("");
      toast.success("Report updated");
    }
  });

  const getUserName = (userId: string | null) => {
    if (!userId) return "Unknown";
    return profiles?.find(p => p.user_id === userId)?.display_name || "Unknown User";
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-700",
      reviewed: "bg-blue-500/20 text-blue-700",
      action_taken: "bg-green-500/20 text-green-700",
      dismissed: "bg-gray-500/20 text-gray-700"
    };
    return <Badge className={styles[status] || "bg-gray-500/20"}>{status.replace('_', ' ')}</Badge>;
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      warning: "bg-yellow-500/20 text-yellow-700",
      suspend: "bg-red-500/20 text-red-700",
      ban: "bg-red-600/20 text-red-800",
      unsuspend: "bg-green-500/20 text-green-700",
      delete_listing: "bg-red-500/20 text-red-700",
      approve_listing: "bg-green-500/20 text-green-700",
      reject_listing: "bg-orange-500/20 text-orange-700",
      feature_listing: "bg-purple-500/20 text-purple-700"
    };
    return <Badge className={colors[action] || "bg-gray-500/20"}>{action.replace('_', ' ')}</Badge>;
  };

  const filteredReports = reports?.filter(r => 
    statusFilter === 'all' || r.status === statusFilter
  );

  // Stats
  const pendingCount = reports?.filter(r => r.status === 'pending').length || 0;
  const resolvedCount = reports?.filter(r => r.status !== 'pending').length || 0;

  if (isLoading) {
    return <Skeleton className="h-[600px]" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Reports & Moderation</h2>
        <p className="text-muted-foreground">Review reported content and moderation logs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{resolvedCount}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{moderationLogs?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Moderation Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">
            <Flag className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="logs">
            <FileText className="h-4 w-4 mr-2" />
            Moderation Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-6">
          {/* Filter */}
          <div className="mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="action_taken">Action Taken</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports?.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {report.report_type === 'user' ? <User className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                          {report.report_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{getUserName(report.reporter_id)}</TableCell>
                      <TableCell>
                        {report.report_type === 'user' 
                          ? getUserName(report.reported_user_id)
                          : `Listing #${report.reported_listing_id?.slice(0, 8)}`
                        }
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{report.reason}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(report.created_at), "MMM dd")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report);
                            setAdminNotes(report.admin_notes || "");
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredReports?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No reports found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moderationLogs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{getActionBadge(log.action_type)}</TableCell>
                      <TableCell>{getUserName(log.admin_id)}</TableCell>
                      <TableCell>
                        {log.target_user_id 
                          ? getUserName(log.target_user_id)
                          : log.target_listing_id 
                            ? `Listing #${log.target_listing_id.slice(0, 8)}`
                            : "—"
                        }
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">{log.reason || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(log.created_at), "MMM dd, HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Review Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Report</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Report Type</p>
                  <Badge variant="outline">{selectedReport.report_type}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  {getStatusBadge(selectedReport.status)}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">Reason</p>
                <p className="mt-1">{selectedReport.reason}</p>
              </div>
              
              {selectedReport.description && (
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedReport.description}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-2">Admin Notes</p>
                <Textarea 
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline"
              onClick={() => updateReport.mutate({ 
                id: selectedReport!.id, 
                status: 'dismissed',
                notes: adminNotes 
              })}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Dismiss
            </Button>
            <Button 
              variant="outline"
              onClick={() => updateReport.mutate({ 
                id: selectedReport!.id, 
                status: 'reviewed',
                notes: adminNotes 
              })}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Reviewed
            </Button>
            <Button 
              variant="destructive"
              onClick={() => updateReport.mutate({ 
                id: selectedReport!.id, 
                status: 'action_taken',
                notes: adminNotes 
              })}
            >
              <Ban className="h-4 w-4 mr-2" />
              Take Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReports;