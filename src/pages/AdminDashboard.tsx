import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminPackages from "@/components/admin/AdminPackages";
import AdminAddons from "@/components/admin/AdminAddons";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminListings from "@/components/admin/AdminListings";
import AdminCategories from "@/components/admin/AdminCategories";
import AdminSupport from "@/components/admin/AdminSupport";
import AdminReports from "@/components/admin/AdminReports";
import AdminMessaging from "@/components/admin/AdminMessaging";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminVerifications from "@/components/admin/AdminVerifications";
import AdminTeam from "@/components/admin/AdminTeam";
import AdminAffiliates from "@/components/admin/AdminAffiliates";
import AdminDiagnostics from "@/components/admin/AdminDiagnostics";
import AdminCustomValues from "@/components/admin/AdminCustomValues";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Home, Eye } from "lucide-react";
import { useIsSuperAdmin } from "@/hooks/useTeamMember";

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperAdmin, isTeamMember, teamMember } = useIsSuperAdmin();

  // Check if user is admin
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase.rpc("is_admin", { _user_id: user.id });
      if (error) return false;
      return data;
    },
    enabled: !!user,
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || (!isAdmin && !isTeamMember)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this page.
          </p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  // Determine page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/users')) return 'User Management';
    if (path.includes('/listings')) return 'Listings Management';
    if (path.includes('/categories')) return 'Categories';
    if (path.includes('/packages')) return 'Subscription Packages';
    if (path.includes('/addons')) return 'Add-ons';
    if (path.includes('/support')) return 'Support Tickets';
    if (path.includes('/reports')) return 'Reports & Moderation';
    if (path.includes('/messaging')) return 'Messaging';
    if (path.includes('/settings')) return 'System Settings';
    if (path.includes('/verifications')) return 'Seller Verifications';
    if (path.includes('/team')) return 'Team Management';
    if (path.includes('/affiliates')) return 'Affiliates';
    if (path.includes('/custom-values')) return 'Custom Field Values';
    if (path.includes('/diagnostics')) return 'System Diagnostics';
    return 'Overview';
  };

  // Check permissions for team members
  const hasPermission = (permission: string): boolean => {
    if (isSuperAdmin || isAdmin) return true;
    if (!teamMember) return false;
    return !!(teamMember.permissions as any)?.[permission];
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="h-14 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <nav className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Admin</span>
                <span className="text-muted-foreground">/</span>
                <span className="font-medium">{getPageTitle()}</span>
              </nav>
            </div>
            
            <div className="flex items-center gap-2">
              {(isSuperAdmin || hasPermission("view_seller_dashboard")) && (
                <Link to="/seller-dashboard">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View as Seller
                  </Button>
                </Link>
              )}
              <Link to="/">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  View Site
                </Button>
              </Link>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route index element={<AdminOverview />} />
                {hasPermission("view_users") && <Route path="users" element={<AdminUsers />} />}
                {hasPermission("view_listings") && <Route path="listings" element={<AdminListings />} />}
                <Route path="categories" element={<AdminCategories />} />
                <Route path="packages" element={<AdminPackages />} />
                <Route path="addons" element={<AdminAddons />} />
                {hasPermission("view_support") && <Route path="support/*" element={<AdminSupport />} />}
                {hasPermission("view_reports") && <Route path="reports" element={<AdminReports />} />}
                <Route path="messaging" element={<AdminMessaging />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="verifications" element={<AdminVerifications />} />
                <Route path="team" element={<AdminTeam />} />
                {hasPermission("view_affiliates") && <Route path="affiliates" element={<AdminAffiliates />} />}
                <Route path="diagnostics" element={<AdminDiagnostics />} />
                <Route path="custom-values" element={<AdminCustomValues />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
