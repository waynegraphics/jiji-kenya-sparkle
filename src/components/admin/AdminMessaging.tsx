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
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Send, MessageSquare, Eye, Megaphone, Plus, Trash2,
  Search, Filter, ArrowLeft, User, ChevronRight
} from "lucide-react";

interface Announcement {
  id: string;
  admin_id: string;
  title: string;
  content: string;
  target_audience: string;
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
}

interface ConversationGroup {
  participants: string[];
  participantNames: string[];
  lastMessage: string;
  lastDate: string;
  messageCount: number;
  unreadCount: number;
}

const AdminMessaging = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string[] | null>(null);
  const [userFilter, setUserFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    target_audience: "all"
  });
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch announcements
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Announcement[];
    }
  });

  // Fetch all messages
  const { data: allMessages } = useQuery({
    queryKey: ["admin-all-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, content, created_at, is_read, message_type, file_url")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data;
    }
  });

  // Fetch profiles
  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url");
      if (error) throw error;
      return data;
    }
  });

  // Group messages into conversations
  const conversations: ConversationGroup[] = (() => {
    if (!allMessages) return [];
    const groups = new Map<string, ConversationGroup>();
    
    allMessages.forEach(msg => {
      const key = [msg.sender_id, msg.receiver_id].sort().join("||");
      if (!groups.has(key)) {
        groups.set(key, {
          participants: [msg.sender_id, msg.receiver_id].sort(),
          participantNames: [],
          lastMessage: msg.content,
          lastDate: msg.created_at,
          messageCount: 0,
          unreadCount: 0,
        });
      }
      const g = groups.get(key)!;
      g.messageCount++;
      if (!msg.is_read) g.unreadCount++;
      if (msg.created_at > g.lastDate) {
        g.lastDate = msg.created_at;
        g.lastMessage = msg.content;
      }
    });

    return Array.from(groups.values()).map(g => ({
      ...g,
      participantNames: g.participants.map(id => getUserName(id)),
    })).sort((a, b) => b.lastDate.localeCompare(a.lastDate));
  })();

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
    if (userFilter) {
      const match = c.participantNames.some(n => n.toLowerCase().includes(userFilter.toLowerCase()));
      if (!match) return false;
    }
    if (statusFilter === "unread") return c.unreadCount > 0;
    return true;
  });

  // Get messages for selected conversation
  const conversationMessages = selectedConversation ? 
    allMessages?.filter(m => {
      const key = [m.sender_id, m.receiver_id].sort().join("||");
      return key === selectedConversation.sort().join("||");
    }).sort((a, b) => a.created_at.localeCompare(b.created_at)) : [];

  // Create announcement
  const createAnnouncement = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("announcements")
        .insert({
          admin_id: user?.id,
          title: data.title,
          content: data.content,
          target_audience: data.target_audience
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      setIsCreateOpen(false);
      setFormData({ title: "", content: "", target_audience: "all" });
      toast.success("Announcement created");
    },
    onError: () => toast.error("Failed to create announcement"),
  });

  const toggleAnnouncement = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase.from("announcements").update({ is_active: !isActive }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast.success("Announcement updated");
    }
  });

  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast.success("Announcement deleted");
    }
  });

  const getUserName = (userId: string) => {
    return profiles?.find(p => p.user_id === userId)?.display_name || "Unknown";
  };

  if (isLoading) return <Skeleton className="h-[600px]" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Messaging</h2>
          <p className="text-muted-foreground">Manage announcements and view platform messages</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />New Announcement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{announcements?.filter(a => a.is_active).length || 0}</p>
                <p className="text-sm text-muted-foreground">Active Announcements</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{conversations.length}</p>
                <p className="text-sm text-muted-foreground">Total Conversations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{allMessages?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />System Announcements
          </CardTitle>
          <CardDescription>Broadcast messages to all users</CardDescription>
        </CardHeader>
        <CardContent>
          {announcements?.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No announcements yet</p>
          ) : (
            <div className="space-y-4">
              {announcements?.map(announcement => (
                <div key={announcement.id} className={`p-4 rounded-lg border ${announcement.is_active ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{announcement.title}</h4>
                        <Badge variant={announcement.is_active ? "default" : "secondary"}>
                          {announcement.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">{announcement.target_audience}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{announcement.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created {format(new Date(announcement.created_at), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => toggleAnnouncement.mutate({ id: announcement.id, isActive: announcement.is_active })}>
                        {announcement.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this announcement?")) deleteAnnouncement.mutate(announcement.id); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversations List / Detail View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedConversation && (
                <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {selectedConversation ? `${getUserName(selectedConversation[0])} ↔ ${getUserName(selectedConversation[1])}` : "Platform Conversations"}
                </CardTitle>
                <CardDescription>
                  {selectedConversation ? "View-only conversation thread" : "Click a conversation to view messages"}
                </CardDescription>
              </div>
            </div>
          </div>
          {!selectedConversation && (
            <div className="flex gap-2 mt-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user name..."
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {selectedConversation ? (
            // Conversation detail view
            <ScrollArea className="h-[500px]">
              <div className="p-4 space-y-3">
                {conversationMessages?.map(msg => (
                  <div key={msg.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{getUserName(msg.sender_id)}</span>
                        <span className="text-xs text-muted-foreground">
                          → {getUserName(msg.receiver_id)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {format(new Date(msg.created_at), "MMM dd, HH:mm")}
                        </span>
                      </div>
                      <p className="text-sm bg-muted/50 rounded-lg p-3">{msg.content}</p>
                      {msg.file_url && (
                        <a href={msg.file_url} target="_blank" rel="noopener" className="text-xs text-primary underline mt-1 block">
                          📎 Attachment
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {(!conversationMessages || conversationMessages.length === 0) && (
                  <p className="text-center py-8 text-muted-foreground">No messages in this conversation</p>
                )}
              </div>
            </ScrollArea>
          ) : (
            // Conversations list
            <ScrollArea className="h-[500px]">
              <div className="divide-y">
                {filteredConversations.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No conversations found</p>
                ) : (
                  filteredConversations.map((conv, i) => (
                    <button
                      key={i}
                      className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-center gap-3"
                      onClick={() => setSelectedConversation(conv.participants)}
                    >
                      <div className="flex -space-x-2 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border-2 border-background">
                          <User className="h-3 w-3 text-primary" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-accent/50 flex items-center justify-center border-2 border-background">
                          <User className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {conv.participantNames.join(" ↔ ")}
                          </span>
                          {conv.unreadCount > 0 && (
                            <Badge className="h-5 px-1.5 text-[10px] bg-destructive text-destructive-foreground">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(conv.lastDate), "MMM dd")}
                        </span>
                        <span className="text-xs text-muted-foreground">{conv.messageCount} msgs</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Create Announcement Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Announcement</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="Announcement title" />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea value={formData.content} onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))} placeholder="Write your announcement..." rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select value={formData.target_audience} onValueChange={(v) => setFormData(p => ({ ...p, target_audience: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="sellers">Sellers Only</SelectItem>
                  <SelectItem value="buyers">Buyers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createAnnouncement.mutate(formData)} disabled={!formData.title || !formData.content}>
              <Send className="h-4 w-4 mr-2" />Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMessaging;
