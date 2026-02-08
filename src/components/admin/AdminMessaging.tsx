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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Send, 
  MessageSquare, 
  Eye,
  Megaphone,
  Plus,
  Trash2
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

const AdminMessaging = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
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

  // Fetch all conversations (sample - view only)
  const { data: conversations } = useQuery({
    queryKey: ["admin-conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, content, created_at, is_read")
        .order("created_at", { ascending: false })
        .limit(50);
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
        .select("user_id, display_name");
      if (error) throw error;
      return data;
    }
  });

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
    onError: () => {
      toast.error("Failed to create announcement");
    }
  });

  // Toggle announcement
  const toggleAnnouncement = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("announcements")
        .update({ is_active: !isActive })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast.success("Announcement updated");
    }
  });

  // Delete announcement
  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);
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

  if (isLoading) {
    return <Skeleton className="h-[600px]" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Messaging</h2>
          <p className="text-muted-foreground">Manage announcements and view platform messages</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
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
                <p className="text-2xl font-bold">{conversations?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Recent Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{conversations?.filter(c => c.is_read).length || 0}</p>
                <p className="text-sm text-muted-foreground">Read Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            System Announcements
          </CardTitle>
          <CardDescription>Broadcast messages to all users</CardDescription>
        </CardHeader>
        <CardContent>
          {announcements?.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No announcements yet</p>
          ) : (
            <div className="space-y-4">
              {announcements?.map(announcement => (
                <div 
                  key={announcement.id}
                  className={`p-4 rounded-lg border ${announcement.is_active ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'}`}
                >
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleAnnouncement.mutate({ 
                          id: announcement.id, 
                          isActive: announcement.is_active 
                        })}
                      >
                        {announcement.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          if (confirm("Delete this announcement?")) {
                            deleteAnnouncement.mutate(announcement.id);
                          }
                        }}
                      >
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

      {/* Recent Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Platform Messages
          </CardTitle>
          <CardDescription>View-only access to platform conversations</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversations?.slice(0, 10).map((msg) => (
                <TableRow key={msg.id}>
                  <TableCell>{getUserName(msg.sender_id)}</TableCell>
                  <TableCell>{getUserName(msg.receiver_id)}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{msg.content}</TableCell>
                  <TableCell>
                    <Badge variant={msg.is_read ? "secondary" : "default"}>
                      {msg.is_read ? "Read" : "Unread"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(msg.created_at), "MMM dd, HH:mm")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Announcement Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input 
                value={formData.title}
                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                placeholder="Announcement title"
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea 
                value={formData.content}
                onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))}
                placeholder="Write your announcement..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select 
                value={formData.target_audience}
                onValueChange={(v) => setFormData(p => ({ ...p, target_audience: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
            <Button 
              onClick={() => createAnnouncement.mutate(formData)}
              disabled={!formData.title || !formData.content}
            >
              <Send className="h-4 w-4 mr-2" />
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMessaging;