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
import logo from "@/assets/logo.png";
import { 
  LayoutDashboard, Users, FileText, FolderTree, Package, 
  MessageSquare, LifeBuoy, Flag, Settings, Shield, ShieldCheck,
  UsersRound, Link2, Activity, ListChecks, Crown, Zap, TrendingUp,
  BookOpen, Briefcase, Brain, Mail, FormInput, Star
} from "lucide-react";
import { useIsSuperAdmin } from "@/hooks/useTeamMember";
import { useAdminCounts } from "@/hooks/useAdminCounts";
import { Badge } from "@/components/ui/badge";

const AdminSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const { isSuperAdmin, teamMember } = useIsSuperAdmin();
  const { data: counts } = useAdminCounts();

  const basePath = currentPath.startsWith("/apa/dashboard") ? "/apa/dashboard" : "/admin";

  const hasPermission = (permission: string): boolean => {
    if (isSuperAdmin) return true;
    if (!teamMember) return true;
    return !!(teamMember.permissions as any)?.[permission];
  };

  const menuItems = [
    { title: "Overview", url: basePath, icon: LayoutDashboard, permission: null, countKey: null },
    { title: "User Management", url: `${basePath}/users`, icon: Users, permission: "view_users", countKey: null },
    { title: "Listings", url: `${basePath}/listings`, icon: FileText, permission: "view_listings", countKey: "listings" as const },
    { title: "Categories", url: `${basePath}/categories`, icon: FolderTree, permission: null, countKey: null },
    { title: "Form Fields", url: `${basePath}/form-fields`, icon: FormInput, permission: null, countKey: null },
    { title: "Packages", url: `${basePath}/packages`, icon: Package, permission: null, countKey: null },
    { title: "Ad Tiers", url: `${basePath}/tiers`, icon: Crown, permission: null, countKey: null },
    { title: "Bump Packages", url: `${basePath}/bump-packages`, icon: Zap, permission: null, countKey: null },
    { title: "Promotions", url: `${basePath}/promotions`, icon: TrendingUp, permission: null, countKey: null },
    { title: "Support", url: `${basePath}/support`, icon: LifeBuoy, permission: "view_support", countKey: "support" as const },
    { title: "Reports", url: `${basePath}/reports`, icon: Flag, permission: "view_reports", countKey: "reports" as const },
    { title: "Reviews", url: `${basePath}/reviews`, icon: Star, permission: null, countKey: "reviews" as const },
    { title: "Messaging", url: `${basePath}/messaging`, icon: MessageSquare, permission: null, countKey: null },
    { title: "Verifications", url: `${basePath}/verifications`, icon: ShieldCheck, permission: null, countKey: "verifications" as const },
    { title: "Communications", url: `${basePath}/communications`, icon: Mail, permission: null, countKey: null },
    { title: "Affiliates", url: `${basePath}/affiliates`, icon: Link2, permission: "view_affiliates", countKey: null },
    { title: "Team", url: `${basePath}/team`, icon: UsersRound, permission: "manage_team", superAdminOnly: true, countKey: null },
    { title: "Diagnostics", url: `${basePath}/diagnostics`, icon: Activity, permission: "manage_settings", countKey: null },
    { title: "Custom Values", url: `${basePath}/custom-values`, icon: ListChecks, permission: "manage_settings", countKey: "customValues" as const },
    { title: "Blog", url: `${basePath}/blog`, icon: BookOpen, permission: null, countKey: null },
    { title: "Careers", url: `${basePath}/careers`, icon: Briefcase, permission: null, countKey: "careers" as const },
    { title: "AI Engine", url: `${basePath}/ai-settings`, icon: Brain, permission: "manage_settings", countKey: null },
    { title: "Settings", url: `${basePath}/settings`, icon: Settings, permission: "manage_settings", countKey: null },
  ];

  const isActive = (path: string) => {
    if (path === basePath) return currentPath === path;
    return currentPath.startsWith(path);
  };

  const visibleItems = menuItems.filter((item) => {
    if ((item as any).superAdminOnly && !isSuperAdmin) return false;
    if (item.permission && !hasPermission(item.permission)) return false;
    return true;
  });

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <div className={`p-3 border-b ${collapsed ? "px-2" : ""}`}>
          <Link to="/" className="flex-shrink-0">
            {collapsed ? (
              <img src={logo} alt="Apa Bazaar" className="h-8 w-8 object-contain" />
            ) : (
              <img src={logo} alt="Apa Bazaar" className="h-10 w-auto object-contain" />
            )}
          </Link>
          {!collapsed && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
                  <Shield className="h-3 w-3 text-primary-foreground" />
                </div>
                <h2 className="font-semibold text-sm">APA Admin</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 pl-7">
                {isSuperAdmin ? "Super Admin" : teamMember?.designation ? teamMember.designation.charAt(0).toUpperCase() + teamMember.designation.slice(1) : "Admin"}
              </p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const active = isActive(item.url);
                const count = item.countKey && counts ? counts[item.countKey] : 0;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} tooltip={collapsed ? item.title : undefined}>
                      <Link to={item.url} className={`flex items-center gap-3 ${active ? "bg-primary/10 text-primary" : ""}`}>
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            {count > 0 && (
                              <Badge className="h-5 min-w-[20px] px-1.5 text-[10px] bg-destructive text-destructive-foreground rounded-full">
                                {count}
                              </Badge>
                            )}
                          </>
                        )}
                        {collapsed && count > 0 && (
                          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive" />
                        )}
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
