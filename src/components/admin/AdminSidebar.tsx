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
  LayoutDashboard, 
  Users, 
  FileText, 
  FolderTree, 
  Package, 
  Puzzle,
  MessageSquare,
  LifeBuoy,
  Flag,
  Settings,
  Shield
} from "lucide-react";

const menuItems = [
  { 
    title: "Overview", 
    url: "/admin", 
    icon: LayoutDashboard,
    description: "Platform statistics"
  },
  { 
    title: "User Management", 
    url: "/admin/users", 
    icon: Users,
    description: "Manage all users"
  },
  { 
    title: "Listings", 
    url: "/admin/listings", 
    icon: FileText,
    description: "Manage listings"
  },
  { 
    title: "Categories", 
    url: "/admin/categories", 
    icon: FolderTree,
    description: "Category management"
  },
  { 
    title: "Packages", 
    url: "/admin/packages", 
    icon: Package,
    description: "Subscription plans"
  },
  { 
    title: "Add-ons", 
    url: "/admin/addons", 
    icon: Puzzle,
    description: "Manage add-ons"
  },
  { 
    title: "Support", 
    url: "/admin/support", 
    icon: LifeBuoy,
    description: "Support tickets"
  },
  { 
    title: "Reports", 
    url: "/admin/reports", 
    icon: Flag,
    description: "Moderation & reports"
  },
  { 
    title: "Messaging", 
    url: "/admin/messaging", 
    icon: MessageSquare,
    description: "System messaging"
  },
  { 
    title: "Settings", 
    url: "/admin/settings", 
    icon: Settings,
    description: "System settings"
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

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
                <h2 className="font-semibold text-sm">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Super Admin</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const active = isActive(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={collapsed ? item.title : undefined}
                    >
                      <Link 
                        to={item.url} 
                        className={`flex items-center gap-3 ${active ? "bg-primary/10 text-primary" : ""}`}
                      >
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
}

export default AdminSidebar;