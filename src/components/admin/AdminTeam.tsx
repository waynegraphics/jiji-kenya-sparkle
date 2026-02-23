import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsSuperAdmin } from "@/hooks/useTeamMember";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Trash2, Edit } from "lucide-react";

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

  // Fetch all users who have roles in user_roles
  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      // Get all users with roles
      const { data: roles, error: rolesErr } = await supabase
        .from("user_roles")
        .select("user_id, role");
      if (rolesErr) throw rolesErr;

      if (!roles || roles.length === 0) return [];

      const userIds = [...new Set(roles.map((r: any) => r.user_id))];

      // Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      // Fetch team_members records
      const { data: teamRecords } = await supabase
        .from("team_members")
        .select("*")
        .in("user_id", userIds);

      // Fetch emails
      const { data: emails } = await supabase.rpc("get_user_emails");
      const emailMap: Record<string, string> = {};
      emails?.forEach((e: any) => { emailMap[e.user_id] = e.email; });

      // Build role map (user can have multiple roles)
      const roleMap: Record<string, string[]> = {};
      roles.forEach((r: any) => {
        if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
        roleMap[r.user_id].push(r.role);
      });

      // Merge everything
      return userIds.map((uid) => {
        const profile = profiles?.find((p: any) => p.user_id === uid);
        const teamRecord = teamRecords?.find((t: any) => t.user_id === uid);
        return {
          user_id: uid,
          display_name: profile?.display_name || "Unknown",
          avatar_url: profile?.avatar_url || null,
          email: emailMap[uid] || "",
          roles: roleMap[uid] || [],
          // Team member details (may not exist yet)
          id: teamRecord?.id || null,
          designation: teamRecord?.designation || (roleMap[uid]?.includes("admin") ? "admin" : "support"),
          permissions: teamRecord?.permissions || {},
          is_active: teamRecord?.is_active ?? true,
          has_team_record: !!teamRecord,
        };
      });
    },
  });

  const addMember = useMutation({
    mutationFn: async () => {
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("user_id, display_name");

      if (!allProfiles || allProfiles.length === 0) {
        throw new Error("No users found");
      }

      const matchedProfile = allProfiles.find(
        (p: any) => p.display_name.toLowerCase() === newEmail.toLowerCase() || p.user_id === newEmail
      );

      if (!matchedProfile) {
        throw new Error("User not found. Enter the exact display name or user ID.");
      }

      // Ensure they have admin role
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
    mutationFn: async ({ id, user_id, designation, permissions, is_active }: any) => {
      if (id) {
        // Update existing team_members record
        const { error } = await supabase
          .from("team_members")
          .update({ designation, permissions, is_active })
          .eq("id", id);
        if (error) throw error;
      } else {
        // Create team_members record for user who only had a role
        const { error } = await supabase.from("team_members").insert({
          user_id,
          designation,
          permissions,
          is_active,
          added_by: user?.id,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({ title: "Team member updated" });
      setEditingMember(null);
    },
  });

  const removeMember = useMutation({
    mutationFn: async ({ id, user_id }: { id: string | null; user_id: string }) => {
      if (id) {
        await supabase.from("team_members").delete().eq("id", id);
      }
      // Also remove their roles
      await supabase.from("user_roles").delete().eq("user_id", user_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({ title: "Team member removed" });
    },
  });

  const togglePermission = (perms: Record<string, boolean>, key: string) => {
    return { ...perms, [key]: !perms[key] };
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "moderator": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getDesignationColor = (d: string) => {
    switch (d) {
      case "super_admin": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "admin": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "hr": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "auditor": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "support": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-muted-foreground">
            Manage team members and their permissions ({teamMembers?.length || 0} members)
          </p>
        </div>
        {isSuperAdmin && (
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
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers?.map((member: any) => (
                <TableRow key={member.user_id}>
                  <TableCell className="font-medium">{member.display_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{member.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {(member.roles || []).map((role: string) => (
                        <Badge key={role} className={getRoleColor(role)}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getDesignationColor(member.designation)}>
                      {member.designation === "super_admin"
                        ? "Super Admin"
                        : member.designation.charAt(0).toUpperCase() + member.designation.slice(1)}
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
                        <Button size="sm" variant="ghost" onClick={() => setEditingMember(member)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => removeMember.mutate({ id: member.id, user_id: member.user_id })}
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
                    user_id: editingMember.user_id,
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
