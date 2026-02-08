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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
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
  Bell
} from "lucide-react";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { 
    title: "Overview", 
    url: "/seller-dashboard", 
    icon: LayoutDashboard,
    description: "Dashboard overview"
  },
  { 
    title: "Subscription", 
    url: "/seller-dashboard/subscription", 
    icon: Package,
    description: "Manage your plan"
  },
  { 
    title: "My Listings", 
    url: "/seller-dashboard/listings", 
    icon: FileText,
    description: "View and manage ads"
  },
  { 
    title: "Add-ons", 
    url: "/seller-dashboard/addons", 
    icon: Zap,
    description: "Boost your listings"
  },
  { 
    title: "Analytics", 
    url: "/seller-dashboard/analytics", 
    icon: BarChart3,
    description: "View performance",
    requiresAnalytics: true
  },
  { 
    title: "Followers", 
    url: "/seller-dashboard/followers", 
    icon: Users,
    description: "Your followers"
  },
  { 
    title: "Support", 
    url: "/seller-dashboard/support", 
    icon: LifeBuoy,
    description: "Get help"
  },
  { 
    title: "Notifications", 
    url: "/seller-dashboard/notifications", 
    icon: Bell,
    description: "View updates"
  },
  { 
    title: "Billing", 
    url: "/seller-dashboard/billing", 
    icon: CreditCard,
    description: "Payment history"
  },
  { 
    title: "Settings", 
    url: "/seller-dashboard/settings", 
    icon: Settings,
    description: "Account settings"
  },
];

export function SellerSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { data: limits } = useSubscriptionLimits();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/seller-dashboard") {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        {/* Quick Action */}
        <div className={`p-3 ${collapsed ? "px-2" : ""}`}>
          <Link to="/post-ad">
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
                {limits.adsRemaining} of {limits.maxAds} ads remaining
              </div>
            </div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                // Skip analytics if not included in plan
                if (item.requiresAnalytics && !limits?.analyticsAccess) {
                  return null;
                }

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

        {/* Upgrade CTA */}
        {!collapsed && !limits?.analyticsAccess && (
          <div className="p-3 mt-auto">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Unlock Analytics</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Upgrade to access detailed performance insights.
              </p>
              <Link to="/pricing">
                <button className="w-full text-xs bg-primary text-primary-foreground rounded py-1.5 hover:bg-primary/90">
                  Upgrade Plan
                </button>
              </Link>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

export default SellerSidebar;
