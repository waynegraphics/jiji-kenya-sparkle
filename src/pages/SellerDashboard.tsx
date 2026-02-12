import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SellerSidebar from "@/components/seller/SellerSidebar";
import SellerOverview from "@/components/seller/SellerOverview";
import SellerSubscriptionDashboard from "@/components/seller/SellerSubscriptionDashboard";
import SellerListings from "@/components/seller/SellerListings";

import SellerAnalytics from "@/components/seller/SellerAnalytics";
import SellerBilling from "@/components/seller/SellerBilling";
import SellerFollowers from "@/components/seller/SellerFollowers";
import SellerSupport from "@/components/seller/SellerSupport";
import SellerNotifications from "@/components/seller/SellerNotifications";
import SellerMessages from "@/components/seller/SellerMessages";
import SellerFavorites from "@/components/seller/SellerFavorites";
import SellerSettingsPage from "@/components/seller/SellerSettingsPage";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Shield, Heart, Bell, MessageCircle } from "lucide-react";
import { useIsSuperAdmin } from "@/hooks/useTeamMember";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useNotifications } from "@/hooks/useNotifications";

const SellerDashboard = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { data: limits } = useSubscriptionLimits();
  const { isSuperAdmin, isTeamMember } = useIsSuperAdmin();
  const unreadMessages = useUnreadMessages();
  const { unreadCount: unreadNotifications } = useNotifications();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/subscription')) return 'Subscription';
    if (path.includes('/listings')) return 'My Listings';
    if (path.includes('/messages')) return 'Messages';
    if (path.includes('/analytics')) return 'Analytics';
    if (path.includes('/billing')) return 'Billing';
    if (path.includes('/followers')) return 'Followers';
    if (path.includes('/favorites')) return 'Favorites';
    if (path.includes('/support')) return 'Support';
    if (path.includes('/notifications')) return 'Notifications';
    if (path.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  const showAdminSwitch = isSuperAdmin || isTeamMember;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SellerSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <nav className="flex items-center gap-2 text-sm">
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors"><Home className="h-4 w-4" /></Link>
                <span className="text-muted-foreground">/</span>
                <span className="font-medium">{getPageTitle()}</span>
              </nav>
            </div>
            <div className="flex items-center gap-1">
              {/* Quick action icons */}
              <Link to="/seller-dashboard/favorites">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/seller-dashboard/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  )}
                </Button>
              </Link>
              <Link to="/seller-dashboard/messages">
                <Button variant="ghost" size="icon" className="relative">
                  <MessageCircle className="h-4 w-4" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                </Button>
              </Link>

              {showAdminSwitch && (
                <Link to="/apa/dashboard">
                  <Button variant="default" size="sm" className="gap-2 ml-2">
                    <Shield className="h-4 w-4" />
                    Back to Admin
                  </Button>
                </Link>
              )}
              <Link to="/"><Button variant="outline" size="sm" className="ml-1"><Home className="h-4 w-4 mr-2" />Site</Button></Link>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-6xl mx-auto">
              <Routes>
                <Route index element={<SellerOverview />} />
                <Route path="subscription" element={<SellerSubscriptionDashboard />} />
                <Route path="listings" element={<SellerListings />} />
                <Route path="messages" element={<SellerMessages />} />
                <Route path="analytics" element={
                  limits?.analyticsAccess ? <SellerAnalytics /> : (
                    <div className="text-center py-12">
                      <h2 className="text-2xl font-bold mb-4">Analytics Locked</h2>
                      <p className="text-muted-foreground mb-6">Upgrade your subscription to access detailed analytics.</p>
                      <Link to="/pricing"><Button>View Plans</Button></Link>
                    </div>
                  )
                } />
                <Route path="favorites" element={<SellerFavorites />} />
                <Route path="billing" element={<SellerBilling />} />
                <Route path="followers" element={<SellerFollowers />} />
                <Route path="support" element={<SellerSupport />} />
                <Route path="notifications" element={<SellerNotifications />} />
                <Route path="settings" element={<SellerSettingsPage />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SellerDashboard;
