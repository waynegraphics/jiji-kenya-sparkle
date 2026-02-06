import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Package, Puzzle, BarChart3, Users, Settings } from "lucide-react";
import AdminPackages from "@/components/admin/AdminPackages";
import AdminAddons from "@/components/admin/AdminAddons";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("packages");

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-12 text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this page.
          </p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto py-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage subscriptions, add-ons, and platform settings</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="packages" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Packages</span>
            </TabsTrigger>
            <TabsTrigger value="addons" className="gap-2">
              <Puzzle className="h-4 w-4" />
              <span className="hidden sm:inline">Add-ons</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="packages" className="mt-6">
            <AdminPackages />
          </TabsContent>

          <TabsContent value="addons" className="mt-6">
            <AdminAddons />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="bg-card rounded-xl p-6 shadow-card">
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              <p className="text-muted-foreground">Coming soon - manage users and their subscriptions</p>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="bg-card rounded-xl p-6 shadow-card">
              <h2 className="text-xl font-semibold mb-4">Analytics</h2>
              <p className="text-muted-foreground">Coming soon - subscription and revenue analytics</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
