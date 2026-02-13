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
  LayoutDashboard, 
  Package, 
  FileText, 
  BarChart3, 
  Zap, 
  Settings,
  CreditCard,
  Plus,
  Users,
  LifeBuoy,
  Bell,
  Link2,
  MessageCircle,
  Heart
} from "lucide-react";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useNotifications } from "@/hooks/useNotifications";

const menuItems = [
  { title: "Overview", url: "/seller-dashboard", icon: LayoutDashboard, description: "Dashboard overview" },
  { title: "Subscription", url: "/seller-dashboard/subscription", icon: Package, description: "Manage your plan" },
  { title: "My Listings", url: "/seller-dashboard/listings", icon: FileText, description: "View and manage ads" },
  { title: "Messages", url: "/seller-dashboard/messages", icon: MessageCircle, description: "Your messages", showBadge: "messages" },
  
  { title: "Analytics", url: "/seller-dashboard/analytics", icon: BarChart3, description: "View performance", requiresAnalytics: true },
  { title: "Favorites", url: "/seller-dashboard/favorites", icon: Heart, description: "Saved listings" },
  { title: "Followers", url: "/seller-dashboard/followers", icon: Users, description: "Your followers" },
  { title: "Notifications", url: "/seller-dashboard/notifications", icon: Bell, description: "View updates", showBadge: "notifications" },
  { title: "Support", url: "/seller-dashboard/support", icon: LifeBuoy, description: "Get help" },
  { title: "Billing", url: "/seller-dashboard/billing", icon: CreditCard, description: "Payment history" },
  { title: "Settings", url: "/seller-dashboard/settings", icon: Settings, description: "Account settings" },
];

export function SellerSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { data: limits } = useSubscriptionLimits();
  const { user } = useAuth();
  const collapsed = state === "collapsed";
  const unreadMessages = useUnreadMessages();
  const { unreadCount: unreadNotifications } = useNotifications();

  const { data: affiliate } = useQuery({
    queryKey: ["my-affiliate-status", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("affiliates").select("id, status").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const isActive = (path: string) => {
    if (path === "/seller-dashboard") return currentPath === path;
    return currentPath.startsWith(path);
  };

  const getBadgeCount = (badgeType?: string) => {
    // Don't show badge when user is already on that page (they're viewing it)
    if (badgeType === "messages") {
      return currentPath.startsWith("/seller-dashboard/messages") ? 0 : unreadMessages;
    }
    if (badgeType === "notifications") {
      return currentPath.startsWith("/seller-dashboard/notifications") ? 0 : unreadNotifications;
    }
    return 0;
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        {/* Logo */}
        <div className={`p-3 border-b ${collapsed ? "px-2" : ""}`}>
          <Link to="/" className="flex items-center gap-2">
            {collapsed ? (
              <img src={logo} alt="Apa Bazaar" className="h-8 w-8 object-contain" />
            ) : (
              <img src={logo} alt="Apa Bazaar" className="h-10 w-auto object-contain" />
            )}
          </Link>
        </div>
        
        {/* Quick Action */}
        <div className={`p-3 ${collapsed ? "px-2" : ""}`}>
          <Link to="/seller-dashboard/post-ad">
            <button className={`w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2.5 px-4 hover:bg-primary/90 transition-colors ${collapsed ? "px-2" : ""}`}>
              <Plus className="h-4 w-4" />
              {!collapsed && <span className="font-medium">Post New Ad</span>}
            </button>
          </Link>
        </div>

        {/* Subscription Status */}
        {!collapsed && limits?.hasActiveSubscription && (
          <div className="px-3 pb-3">
            <div className="bg-muted/50 rounded-lg p-3 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{limits.subscriptionName}</span>
                <Badge variant="secondary" className="text-[10px]">Active</Badge>
              </div>
              <div className="text-muted-foreground">
                {limits.isAdminBypass 
                  ? "Unlimited posting" 
                  : `${limits.adsRemaining} of ${limits.maxAds} ads remaining`
                }
              </div>
            </div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                if (item.requiresAnalytics && !limits?.analyticsAccess) return null;
                const active = isActive(item.url);
                const badgeCount = getBadgeCount((item as any).showBadge);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} tooltip={collapsed ? item.title : undefined}>
                      <Link to={item.url} className={`flex items-center gap-3 ${active ? "bg-primary/10 text-primary" : ""}`}>
                        <div className="relative flex-shrink-0">
                          <item.icon className="h-4 w-4" />
                          {badgeCount > 0 && collapsed && (
                            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[8px] rounded-full w-3.5 h-3.5 flex items-center justify-center">
                              {badgeCount > 9 ? "9+" : badgeCount}
                            </span>
                          )}
                        </div>
                        {!collapsed && (
                          <span className="flex-1 flex items-center justify-between">
                            {item.title}
                            {badgeCount > 0 && (
                              <Badge variant="destructive" className="text-[10px] h-5 min-w-[20px] flex items-center justify-center">
                                {badgeCount}
                              </Badge>
                            )}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Affiliate Section - always visible */}
        <SidebarGroup>
          <SidebarGroupLabel>Affiliate</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {!affiliate && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={collapsed ? "Become Affiliate" : undefined}>
                    <Link to="/affiliate/apply" className="flex items-center gap-3">
                      <Link2 className="h-4 w-4" />
                      {!collapsed && <span>Become an Affiliate</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {affiliate?.status === "pending" && (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled tooltip={collapsed ? "Application Pending" : undefined}>
                    <Link2 className="h-4 w-4" />
                    {!collapsed && <span className="text-muted-foreground">Application Pending</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {affiliate?.status === "approved" && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={currentPath.startsWith("/affiliate")} tooltip={collapsed ? "Affiliate Dashboard" : undefined}>
                    <Link to="/affiliate/dashboard" className="flex items-center gap-3">
                      <Link2 className="h-4 w-4" />
                      {!collapsed && <span>Affiliate Dashboard</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default SellerSidebar;
