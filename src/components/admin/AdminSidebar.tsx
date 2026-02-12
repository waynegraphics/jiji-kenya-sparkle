import { useLocation, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, Users, FileText, FolderTree, Package, 
  MessageSquare, LifeBuoy, Flag, Settings, Shield, ShieldCheck,
  UsersRound, Link2, Activity, ListChecks, Crown, Zap, TrendingUp
} from "lucide-react";
import { useIsSuperAdmin } from "@/hooks/useTeamMember";

const AdminSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const { isSuperAdmin, teamMember } = useIsSuperAdmin();

  // Determine base path (supports both /admin and /apa/dashboard)
  const basePath = currentPath.startsWith("/apa/dashboard") ? "/apa/dashboard" : "/admin";

  const hasPermission = (permission: string): boolean => {
    if (isSuperAdmin) return true;
    if (!teamMember) return true; // fallback for admin role users without team_member record
    return !!(teamMember.permissions as any)?.[permission];
  };

  const menuItems = [
    { title: "Overview", url: basePath, icon: LayoutDashboard, permission: null },
    { title: "User Management", url: `${basePath}/users`, icon: Users, permission: "view_users" },
    { title: "Listings", url: `${basePath}/listings`, icon: FileText, permission: "view_listings" },
    { title: "Categories", url: `${basePath}/categories`, icon: FolderTree, permission: null },
    { title: "Packages", url: `${basePath}/packages`, icon: Package, permission: null },
    { title: "Ad Tiers", url: `${basePath}/tiers`, icon: Crown, permission: null },
    { title: "Bump Packages", url: `${basePath}/bump-packages`, icon: Zap, permission: null },
    { title: "Promotions", url: `${basePath}/promotions`, icon: TrendingUp, permission: null },
    { title: "Support", url: `${basePath}/support`, icon: LifeBuoy, permission: "view_support" },
    { title: "Reports", url: `${basePath}/reports`, icon: Flag, permission: "view_reports" },
    { title: "Messaging", url: `${basePath}/messaging`, icon: MessageSquare, permission: null },
    { title: "Verifications", url: `${basePath}/verifications`, icon: ShieldCheck, permission: null },
    { title: "Affiliates", url: `${basePath}/affiliates`, icon: Link2, permission: "view_affiliates" },
    { title: "Team", url: `${basePath}/team`, icon: UsersRound, permission: "manage_team", superAdminOnly: true },
    { title: "Diagnostics", url: `${basePath}/diagnostics`, icon: Activity, permission: "manage_settings" },
    { title: "Custom Values", url: `${basePath}/custom-values`, icon: ListChecks, permission: "manage_settings" },
    { title: "Settings", url: `${basePath}/settings`, icon: Settings, permission: "manage_settings" },
  ];

  const isActive = (path: string) => {
    if (path === basePath) return currentPath === path;
    return currentPath.startsWith(path);
  };

  const visibleItems = menuItems.filter((item) => {
    if (item.superAdminOnly && !isSuperAdmin) return false;
    if (item.permission && !hasPermission(item.permission)) return false;
    return true;
  });

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        {/* Admin Header */}
        <div className={`p-3 border-b ${collapsed ? "px-2" : ""}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-sm">APA Admin</h2>
                <p className="text-xs text-muted-foreground">
                  {isSuperAdmin ? "Super Admin" : teamMember?.designation ? teamMember.designation.charAt(0).toUpperCase() + teamMember.designation.slice(1) : "Admin"}
                </p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} tooltip={collapsed ? item.title : undefined}>
                      <Link to={item.url} className={`flex items-center gap-3 ${active ? "bg-primary/10 text-primary" : ""}`}>
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
