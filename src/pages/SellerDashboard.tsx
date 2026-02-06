import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SellerSidebar from "@/components/seller/SellerSidebar";
import SellerOverview from "@/components/seller/SellerOverview";
import SellerSubscriptionDashboard from "@/components/seller/SellerSubscriptionDashboard";
import SellerListings from "@/components/seller/SellerListings";
import SellerAddonsPage from "@/components/seller/SellerAddonsPage";
import SellerAnalytics from "@/components/seller/SellerAnalytics";
import SellerBilling from "@/components/seller/SellerBilling";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Settings } from "lucide-react";

const SellerSettings = () => {
  const { profile } = useAuth();
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Account Settings</h2>
        <p className="text-muted-foreground">Manage your seller profile settings</p>
      </div>
      
      <div className="bg-card rounded-xl p-6 border">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {profile?.display_name?.charAt(0) || 'S'}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{profile?.display_name || 'Seller'}</h3>
            <p className="text-muted-foreground">{profile?.location || 'No location set'}</p>
          </div>
        </div>
        
        <Link to="/profile">
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Edit Profile Settings
          </Button>
        </Link>
      </div>
    </div>
  );
};

const SellerDashboard = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { data: limits } = useSubscriptionLimits();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Determine page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/subscription')) return 'Subscription';
    if (path.includes('/listings')) return 'My Listings';
    if (path.includes('/addons')) return 'Add-ons';
    if (path.includes('/analytics')) return 'Analytics';
    if (path.includes('/billing')) return 'Billing';
    if (path.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SellerSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="h-14 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <nav className="flex items-center gap-2 text-sm">
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Home className="h-4 w-4" />
                </Link>
                <span className="text-muted-foreground">/</span>
                <span className="font-medium">{getPageTitle()}</span>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/messages">
                <Button variant="ghost" size="sm">Messages</Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Site
                </Button>
              </Link>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-6xl mx-auto">
              <Routes>
                <Route index element={<SellerOverview />} />
                <Route path="subscription" element={<SellerSubscriptionDashboard />} />
                <Route path="listings" element={<SellerListings />} />
                <Route path="addons" element={<SellerAddonsPage />} />
                <Route path="analytics" element={
                  limits?.analyticsAccess ? (
                    <SellerAnalytics />
                  ) : (
                    <div className="text-center py-12">
                      <h2 className="text-2xl font-bold mb-4">Analytics Locked</h2>
                      <p className="text-muted-foreground mb-6">
                        Upgrade your subscription to access detailed analytics.
                      </p>
                      <Link to="/pricing">
                        <Button>View Plans</Button>
                      </Link>
                    </div>
                  )
                } />
                <Route path="billing" element={<SellerBilling />} />
                <Route path="settings" element={<SellerSettings />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SellerDashboard;
