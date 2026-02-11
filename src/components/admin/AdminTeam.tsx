import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsSuperAdmin } from "@/hooks/useTeamMember";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Shield, Trash2, Edit } from "lucide-react";

const DESIGNATIONS = [
  { value: "support", label: "Support" },
  { value: "auditor", label: "Auditor" },
  { value: "hr", label: "HR" },
  { value: "admin", label: "Admin" },
];

const ALL_PERMISSIONS = [
  { key: "view_users", label: "View Users" },
  { key: "manage_users", label: "Manage Users" },
  { key: "view_listings", label: "View Listings" },
  { key: "manage_listings", label: "Manage Listings" },
  { key: "view_reports", label: "View Reports" },
  { key: "manage_reports", label: "Manage Reports" },
  { key: "view_support", label: "View Support" },
  { key: "manage_support", label: "Manage Support" },
  { key: "view_analytics", label: "View Analytics" },
  { key: "view_finances", label: "View Finances" },
  { key: "manage_settings", label: "Manage Settings" },
  { key: "view_affiliates", label: "View Affiliates" },
  { key: "manage_affiliates", label: "Manage Affiliates" },
  { key: "view_seller_dashboard", label: "View Seller Dashboard" },
  { key: "view_customer_dashboard", label: "View Customer Dashboard" },
  { key: "manage_team", label: "Manage Team" },
];

const AdminTeam = () => {
  const { user } = useAuth();
  const { isSuperAdmin } = useIsSuperAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newDesignation, setNewDesignation] = useState("support");
  const [newPermissions, setNewPermissions] = useState<Record<string, boolean>>({});

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      
      // Fetch profiles for display names
      const userIds = data.map((m: any) => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);
      
      return data.map((m: any) => ({
        ...m,
        display_name: profiles?.find((p: any) => p.user_id === m.user_id)?.display_name || "Unknown",
      }));
    },
  });

  const addMember = useMutation({
    mutationFn: async () => {
      // Find user by email
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .ilike("display_name", `%${newEmail}%`)
        .limit(1);

      // Try to find by checking auth - we need to look up profiles
      // Since we can't query auth.users directly, find by matching email in profiles
      // We'll use a workaround - the admin provides the user's email
      // and we'll search for them
      
      // Actually, let's query the profiles and try to match
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("user_id, display_name");

      // We need the user_id - admin must provide it or we search by display_name
      // For simplicity, let's just use the email as a lookup
      // We'll need an edge function for email lookup, but for now use display_name match
      
      if (!allProfiles || allProfiles.length === 0) {
        throw new Error("No users found");
      }

      // Find user whose display_name or user_id matches the input
      const matchedProfile = allProfiles.find(
        (p: any) => p.display_name.toLowerCase() === newEmail.toLowerCase() || p.user_id === newEmail
      );

      if (!matchedProfile) {
        throw new Error("User not found. Enter the exact display name or user ID.");
      }

      // Also ensure they have admin role
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", matchedProfile.user_id)
        .eq("role", "admin")
        .maybeSingle();

      if (!existingRole) {
        await supabase.from("user_roles").insert({
          user_id: matchedProfile.user_id,
          role: "admin" as any,
        });
      }

      const { error } = await supabase.from("team_members").insert({
        user_id: matchedProfile.user_id,
        designation: newDesignation,
        permissions: newPermissions,
        added_by: user?.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({ title: "Team member added successfully" });
      setIsAddOpen(false);
      setNewEmail("");
      setNewDesignation("support");
      setNewPermissions({});
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMember = useMutation({
    mutationFn: async ({ id, designation, permissions, is_active }: any) => {
      const { error } = await supabase
        .from("team_members")
        .update({ designation, permissions, is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({ title: "Team member updated" });
      setEditingMember(null);
    },
  });

  const removeMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("team_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({ title: "Team member removed" });
    },
  });

  const togglePermission = (perms: Record<string, boolean>, key: string) => {
    return { ...perms, [key]: !perms[key] };
  };

  const getDesignationColor = (d: string) => {
    switch (d) {
      case "super_admin": return "bg-red-100 text-red-800";
      case "admin": return "bg-purple-100 text-purple-800";
      case "hr": return "bg-blue-100 text-blue-800";
      case "auditor": return "bg-yellow-100 text-yellow-800";
      case "support": return "bg-green-100 text-green-800";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-muted-foreground">Manage team members and their permissions</p>
        </div>
        {(isSuperAdmin) && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button><UserPlus className="h-4 w-4 mr-2" />Add Team Member</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Display Name or User ID</Label>
                  <Input
                    placeholder="Enter exact display name or user UUID"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Designation</Label>
                  <Select value={newDesignation} onValueChange={setNewDesignation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DESIGNATIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {ALL_PERMISSIONS.map((p) => (
                      <label key={p.key} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={!!newPermissions[p.key]}
                          onCheckedChange={() => setNewPermissions(togglePermission(newPermissions, p.key))}
                        />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </div>
                <Button onClick={() => addMember.mutate()} disabled={!newEmail || addMember.isPending}>
                  {addMember.isPending ? "Adding..." : "Add Member"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers?.map((member: any) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.display_name}</TableCell>
                  <TableCell>
                    <Badge className={getDesignationColor(member.designation)}>
                      {member.designation === "super_admin" ? "Super Admin" : member.designation.charAt(0).toUpperCase() + member.designation.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.is_active ? "default" : "secondary"}>
                      {member.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(member.permissions || {})
                        .filter(([, v]) => v)
                        .slice(0, 3)
                        .map(([k]) => (
                          <Badge key={k} variant="outline" className="text-[10px]">
                            {k.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      {Object.values(member.permissions || {}).filter(Boolean).length > 3 && (
                        <Badge variant="outline" className="text-[10px]">
                          +{Object.values(member.permissions || {}).filter(Boolean).length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.designation !== "super_admin" && isSuperAdmin && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingMember(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => removeMember.mutate(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingMember && (
        <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit {editingMember.display_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Designation</Label>
                <Select
                  value={editingMember.designation}
                  onValueChange={(v) => setEditingMember({ ...editingMember, designation: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DESIGNATIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {ALL_PERMISSIONS.map((p) => (
                    <label key={p.key} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={!!editingMember.permissions?.[p.key]}
                        onCheckedChange={() =>
                          setEditingMember({
                            ...editingMember,
                            permissions: togglePermission(editingMember.permissions || {}, p.key),
                          })
                        }
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={editingMember.is_active}
                  onCheckedChange={(c) => setEditingMember({ ...editingMember, is_active: !!c })}
                />
                <Label>Active</Label>
              </div>
              <Button
                onClick={() =>
                  updateMember.mutate({
                    id: editingMember.id,
                    designation: editingMember.designation,
                    permissions: editingMember.permissions,
                    is_active: editingMember.is_active,
                  })
                }
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminTeam;
