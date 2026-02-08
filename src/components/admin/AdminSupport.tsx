import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Search, 
  Filter, 
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send
} from "lucide-react";

type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
type TicketCategory = 'account' | 'listing' | 'payment' | 'technical' | 'report' | 'other';

interface SupportTicket {
  id: string;
  user_id: string;
  assigned_to: string | null;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

interface TicketResponse {
  id: string;
  ticket_id: string;
  user_id: string;
  is_admin_response: boolean;
  content: string;
  created_at: string;
}

const AdminSupport = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responseText, setResponseText] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch tickets
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["admin-support-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SupportTicket[];
    }
  });

  // Fetch profiles for user names
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

  // Fetch ticket responses
  const { data: responses } = useQuery({
    queryKey: ["ticket-responses", selectedTicket?.id],
    queryFn: async () => {
      if (!selectedTicket) return [];
      const { data, error } = await supabase
        .from("ticket_responses")
        .select("*")
        .eq("ticket_id", selectedTicket.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as TicketResponse[];
    },
    enabled: !!selectedTicket
  });

  // Update ticket status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TicketStatus }) => {
      const updates: Partial<SupportTicket> = { status };
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      }
      if (status === 'in_progress' && !selectedTicket?.assigned_to) {
        updates.assigned_to = user?.id;
      }
      const { error } = await supabase
        .from("support_tickets")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
      toast.success("Ticket status updated");
    }
  });

  // Add response
  const addResponse = useMutation({
    mutationFn: async ({ ticketId, content }: { ticketId: string; content: string }) => {
      const { error } = await supabase
        .from("ticket_responses")
        .insert({
          ticket_id: ticketId,
          user_id: user?.id,
          is_admin_response: true,
          content
        });
      if (error) throw error;

      // Update ticket status to in_progress if it was open
      const ticket = tickets?.find(t => t.id === ticketId);
      if (ticket?.status === 'open') {
        await supabase
          .from("support_tickets")
          .update({ status: 'in_progress', assigned_to: user?.id })
          .eq("id", ticketId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-responses"] });
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
      setResponseText("");
      toast.success("Response sent");
    }
  });

  const getUserName = (userId: string) => {
    return profiles?.find(p => p.user_id === userId)?.display_name || "Unknown User";
  };

  const getStatusBadge = (status: TicketStatus) => {
    const styles: Record<TicketStatus, string> = {
      open: "bg-blue-500/20 text-blue-700",
      in_progress: "bg-yellow-500/20 text-yellow-700",
      pending: "bg-orange-500/20 text-orange-700",
      resolved: "bg-green-500/20 text-green-700",
      closed: "bg-gray-500/20 text-gray-700"
    };
    return <Badge className={styles[status]}>{status.replace('_', ' ')}</Badge>;
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    const styles: Record<TicketPriority, string> = {
      low: "bg-gray-500/20 text-gray-700",
      medium: "bg-blue-500/20 text-blue-700",
      high: "bg-orange-500/20 text-orange-700",
      urgent: "bg-red-500/20 text-red-700"
    };
    return <Badge className={styles[priority]}>{priority}</Badge>;
  };

  const filteredTickets = tickets?.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Stats
  const openCount = tickets?.filter(t => t.status === 'open').length || 0;
  const inProgressCount = tickets?.filter(t => t.status === 'in_progress').length || 0;
  const resolvedCount = tickets?.filter(t => t.status === 'resolved').length || 0;

  if (isLoading) {
    return <Skeleton className="h-[600px]" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Support Tickets</h2>
        <p className="text-muted-foreground">Manage customer support requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{openCount}</p>
                <p className="text-sm text-muted-foreground">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{inProgressCount}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
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
              <MessageSquare className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{tickets?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
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
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets?.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium max-w-[300px] truncate">
                    {ticket.subject}
                  </TableCell>
                  <TableCell>{getUserName(ticket.user_id)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ticket.category}</Badge>
                  </TableCell>
                  <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(ticket.created_at), "MMM dd, HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTickets?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No tickets found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Ticket Details Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Ticket Details
              {selectedTicket && getStatusBadge(selectedTicket.status)}
            </DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6">
              {/* Ticket Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>From: {getUserName(selectedTicket.user_id)}</span>
                    <span>•</span>
                    <span>{format(new Date(selectedTicket.created_at), "MMM dd, yyyy HH:mm")}</span>
                    <span>•</span>
                    {getPriorityBadge(selectedTicket.priority)}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex items-center gap-2 pb-4 border-b">
                <span className="text-sm font-medium">Update Status:</span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => updateStatus.mutate({ id: selectedTicket.id, status: 'in_progress' })}
                  disabled={selectedTicket.status === 'in_progress'}
                >
                  In Progress
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => updateStatus.mutate({ id: selectedTicket.id, status: 'pending' })}
                  disabled={selectedTicket.status === 'pending'}
                >
                  Pending
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-green-600"
                  onClick={() => updateStatus.mutate({ id: selectedTicket.id, status: 'resolved' })}
                  disabled={selectedTicket.status === 'resolved'}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Resolved
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => updateStatus.mutate({ id: selectedTicket.id, status: 'closed' })}
                  disabled={selectedTicket.status === 'closed'}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Close
                </Button>
              </div>

              {/* Responses */}
              <div className="space-y-4">
                <h4 className="font-medium">Responses</h4>
                {responses?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No responses yet</p>
                ) : (
                  <div className="space-y-3">
                    {responses?.map(response => (
                      <div 
                        key={response.id}
                        className={`p-4 rounded-lg ${response.is_admin_response ? 'bg-primary/10 ml-8' : 'bg-muted mr-8'}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium">
                            {response.is_admin_response ? 'Admin' : getUserName(response.user_id)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(response.created_at), "MMM dd, HH:mm")}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{response.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply Form */}
              {selectedTicket.status !== 'closed' && (
                <div className="space-y-2 pt-4 border-t">
                  <Textarea 
                    placeholder="Write your response..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    onClick={() => addResponse.mutate({ 
                      ticketId: selectedTicket.id, 
                      content: responseText 
                    })}
                    disabled={!responseText.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Response
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSupport;