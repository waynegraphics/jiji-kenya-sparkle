import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, MessageSquare, Phone, Edit, Eye, Search } from "lucide-react";

const categoryColors: Record<string, string> = {
  auth: "bg-blue-100 text-blue-800",
  messaging: "bg-green-100 text-green-800",
  listings: "bg-orange-100 text-orange-800",
  verification: "bg-purple-100 text-purple-800",
  billing: "bg-yellow-100 text-yellow-800",
  support: "bg-red-100 text-red-800",
  moderation: "bg-gray-100 text-gray-800",
  system: "bg-slate-100 text-slate-800",
};

const AdminCommunications = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: channels = [] } = useQuery({
    queryKey: ["communication-channels"],
    queryFn: async () => {
      const { data, error } = await supabase.from("communication_channels").select("*").order("channel_type");
      if (error) throw error;
      return data;
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async (template: any) => {
      const { error } = await supabase
        .from("email_templates")
        .update({
          subject: template.subject,
          body_html: template.body_html,
          is_active: template.is_active,
        })
        .eq("id", template.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Template updated");
      setEditingTemplate(null);
    },
    onError: () => toast.error("Failed to update template"),
  });

  const toggleChannel = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase.from("communication_channels").update({ is_enabled: enabled }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communication-channels"] });
      toast.success("Channel updated");
    },
  });

  const filtered = templates.filter(
    (t: any) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  const channelIcons: Record<string, React.ElementType> = {
    email: Mail,
    sms: Phone,
    whatsapp: MessageSquare,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Communications</h2>
        <p className="text-muted-foreground">Manage email templates and communication channels</p>
      </div>

      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">Loading templates...</p>
          ) : (
            <div className="grid gap-3">
              {filtered.map((t: any) => (
                <Card key={t.id} className={`${!t.is_active ? "opacity-60" : ""}`}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm">{t.name}</h3>
                        <Badge variant="secondary" className={`text-[10px] ${categoryColors[t.category] || ""}`}>
                          {t.category}
                        </Badge>
                        {!t.is_active && <Badge variant="outline" className="text-[10px]">Disabled</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Variables: {(t.variables || []).map((v: string) => `{{${v}}}`).join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => setPreviewTemplate(t)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingTemplate({ ...t })}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {channels.map((ch: any) => {
              const Icon = channelIcons[ch.channel_type] || Mail;
              const config = ch.config || {};
              return (
                <Card key={ch.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base capitalize">{ch.channel_type}</CardTitle>
                          <CardDescription className="text-xs">
                            {ch.is_enabled ? "Active" : "Not configured"}
                          </CardDescription>
                        </div>
                      </div>
                      <Switch
                        checked={ch.is_enabled}
                        onCheckedChange={(checked) => toggleChannel.mutate({ id: ch.id, enabled: checked })}
                        disabled={ch.channel_type !== "email"}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {ch.channel_type === "email" ? (
                      <div className="text-xs space-y-1 text-muted-foreground">
                        <p>From: {config.from_name} &lt;{config.from_email}&gt;</p>
                        <p>Provider: {config.provider}</p>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        <p>{config.note}</p>
                        <Badge variant="outline" className="mt-2 text-[10px]">Coming Soon</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Template: {editingTemplate?.name}</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label>Active</Label>
                <Switch
                  checked={editingTemplate.is_active}
                  onCheckedChange={(v) => setEditingTemplate({ ...editingTemplate, is_active: v })}
                />
              </div>
              <div>
                <Label>Subject</Label>
                <Input
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                />
              </div>
              <div>
                <Label>Body (HTML)</Label>
                <Textarea
                  value={editingTemplate.body_html}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, body_html: e.target.value })}
                  rows={10}
                  className="font-mono text-xs"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Available variables: {(editingTemplate.variables || []).map((v: string) => `{{${v}}}`).join(", ")}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>Cancel</Button>
            <Button onClick={() => updateTemplate.mutate(editingTemplate)} disabled={updateTemplate.isPending}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-3">
              <div className="text-sm">
                <span className="font-medium">Subject: </span>{previewTemplate.subject}
              </div>
              <div className="border rounded-lg p-4 bg-muted/30">
                <div dangerouslySetInnerHTML={{ __html: previewTemplate.body_html }} className="prose prose-sm max-w-none" />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCommunications;
