import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { CheckCircle, XCircle, Search, ListChecks, Clock } from "lucide-react";

const AdminCustomValues = () => {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: values, isLoading } = useQuery({
    queryKey: ["admin-custom-values", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("custom_field_values")
        .select("*")
        .order("created_at", { ascending: false });
      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles-cv"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, display_name");
      return data || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("custom_field_values")
        .update({ status, reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-custom-values"] });
      toast.success("Value updated");
    },
    onError: () => toast.error("Failed to update"),
  });

  const bulkApprove = useMutation({
    mutationFn: async () => {
      const pending = values?.filter(v => v.status === "pending") || [];
      for (const v of pending) {
        await supabase
          .from("custom_field_values")
          .update({ status: "approved", reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
          .eq("id", v.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-custom-values"] });
      toast.success("All pending values approved");
    },
  });

  const getSubmitterName = (userId: string) =>
    profiles?.find(p => p.user_id === userId)?.display_name || "Unknown";

  const filtered = values?.filter(v =>
    v.field_value.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.field_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category_slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = values?.filter(v => v.status === "pending").length || 0;

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-[300px]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Custom Field Values</h2>
        <p className="text-muted-foreground">
          Review user-submitted custom values and approve them for system-wide use.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending", count: pendingCount, filter: "pending", icon: Clock, color: "text-yellow-600" },
          { label: "Approved", count: values?.filter(v => v.status === "approved").length || 0, filter: "approved", icon: CheckCircle, color: "text-green-600" },
          { label: "Rejected", count: values?.filter(v => v.status === "rejected").length || 0, filter: "rejected", icon: XCircle, color: "text-red-600" },
        ].map(s => (
          <Card key={s.label} className="cursor-pointer hover:border-primary/50" onClick={() => setStatusFilter(s.filter)}>
            <CardContent className="p-3 text-center">
              <s.icon className={`h-5 w-5 mx-auto mb-1 ${s.color}`} />
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
              <Input placeholder="Search values..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            {pendingCount > 0 && (
              <Button onClick={() => bulkApprove.mutate()} variant="outline" className="text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" /> Approve All Pending ({pendingCount})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Field</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <ListChecks className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No custom values found
                  </TableCell>
                </TableRow>
              )}
              {filtered?.map((value) => (
                <TableRow key={value.id}>
                  <TableCell>
                    <Badge variant="outline">{value.category_slug}</Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {value.field_name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                  </TableCell>
                  <TableCell className="font-medium">{value.field_value}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {getSubmitterName(value.submitted_by)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(value.created_at), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    {value.status === "pending" && <Badge className="bg-yellow-500/20 text-yellow-700">Pending</Badge>}
                    {value.status === "approved" && <Badge className="bg-green-500/20 text-green-700">Approved</Badge>}
                    {value.status === "rejected" && <Badge className="bg-red-500/20 text-red-700">Rejected</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    {value.status === "pending" && (
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" className="text-green-600 h-8"
                          onClick={() => updateStatus.mutate({ id: value.id, status: "approved" })}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 h-8"
                          onClick={() => updateStatus.mutate({ id: value.id, status: "rejected" })}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {value.status !== "pending" && (
                      <Button size="sm" variant="ghost" className="text-yellow-600 h-8"
                        onClick={() => updateStatus.mutate({ id: value.id, status: "pending" })}>
                        Reset
                      </Button>
                    )}
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

export default AdminCustomValues;