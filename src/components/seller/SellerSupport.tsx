import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  LifeBuoy
} from "lucide-react";

type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
type TicketCategory = 'account' | 'listing' | 'payment' | 'technical' | 'report' | 'other';

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: string;
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

const SellerSupport = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responseText, setResponseText] = useState("");
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    category: "other" as TicketCategory,
    priority: "medium" as TicketPriority
  });

  // Fetch user's tickets
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["seller-tickets", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SupportTicket[];
    },
    enabled: !!user?.id
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

  // Create ticket
  const createTicket = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user?.id,
          subject: data.subject,
          description: data.description,
          category: data.category,
          priority: data.priority
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-tickets"] });
      setIsCreateOpen(false);
      setFormData({ subject: "", description: "", category: "other", priority: "medium" });
      toast.success("Ticket created successfully");
    },
    onError: () => {
      toast.error("Failed to create ticket");
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
          is_admin_response: false,
          content
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-responses"] });
      setResponseText("");
      toast.success("Response sent");
    }
  });

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

  // Stats
  const openCount = tickets?.filter(t => t.status === 'open' || t.status === 'in_progress').length || 0;
  const resolvedCount = tickets?.filter(t => t.status === 'resolved' || t.status === 'closed').length || 0;

  if (isLoading) {
    return <Skeleton className="h-[400px]" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Support Tickets</h2>
          <p className="text-muted-foreground">Get help from our support team</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{openCount}</p>
                <p className="text-sm text-muted-foreground">Open Tickets</p>
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
              <LifeBuoy className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{tickets?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Tickets</CardTitle>
          <CardDescription>View and manage your support requests</CardDescription>
        </CardHeader>
        <CardContent>
          {tickets?.length === 0 ? (
            <div className="text-center py-12">
              <LifeBuoy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No tickets yet</h3>
              <p className="text-muted-foreground mb-4">
                Need help? Create a support ticket and we'll get back to you.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets?.map(ticket => (
                <div 
                  key={ticket.id}
                  className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{ticket.subject}</h4>
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created {format(new Date(ticket.created_at), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Ticket Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Input 
                value={formData.subject}
                onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))}
                placeholder="Brief description of your issue"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={formData.category}
                  onValueChange={(v: TicketCategory) => setFormData(p => ({ ...p, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="listing">Listing</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="report">Report Issue</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select 
                  value={formData.priority}
                  onValueChange={(v: TicketPriority) => setFormData(p => ({ ...p, priority: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="Describe your issue in detail..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => createTicket.mutate(formData)}
              disabled={!formData.subject || !formData.description}
            >
              Create Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
                    <Badge variant="outline">{selectedTicket.category}</Badge>
                    {getPriorityBadge(selectedTicket.priority)}
                    <span>{format(new Date(selectedTicket.created_at), "MMM dd, yyyy HH:mm")}</span>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>
              </div>

              {/* Responses */}
              <div className="space-y-4">
                <h4 className="font-medium">Conversation</h4>
                {responses?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Waiting for support response...</p>
                ) : (
                  <div className="space-y-3">
                    {responses?.map(response => (
                      <div 
                        key={response.id}
                        className={`p-4 rounded-lg ${response.is_admin_response ? 'bg-primary/10 ml-8' : 'bg-muted mr-8'}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium">
                            {response.is_admin_response ? 'Support Team' : 'You'}
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
              {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                <div className="space-y-2 pt-4 border-t">
                  <Textarea 
                    placeholder="Write your reply..."
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
                    Send Reply
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

export default SellerSupport;