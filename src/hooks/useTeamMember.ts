import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TeamPermissions {
  view_users: boolean;
  manage_users: boolean;
  view_listings: boolean;
  manage_listings: boolean;
  view_reports: boolean;
  manage_reports: boolean;
  view_support: boolean;
  manage_support: boolean;
  view_analytics: boolean;
  view_finances: boolean;
  manage_settings: boolean;
  view_affiliates: boolean;
  manage_affiliates: boolean;
  view_seller_dashboard: boolean;
  view_customer_dashboard: boolean;
  manage_team: boolean;
}

export interface TeamMember {
  id: string;
  user_id: string;
  designation: string;
  permissions: TeamPermissions;
  is_active: boolean;
  created_at: string;
}

export const useTeamMember = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["team-member", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as TeamMember | null;
    },
    enabled: !!user,
  });
};

export const useSuperAdminEmail = () => {
  return useQuery({
    queryKey: ["super-admin-email"],
    queryFn: async () => {
      const { data } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "super_admin_email")
        .maybeSingle();
      return data?.value || "";
    },
  });
};

export const useIsSuperAdmin = () => {
  const { user } = useAuth();
  const { data: superAdminEmail } = useSuperAdminEmail();
  const { data: teamMember } = useTeamMember();

  return {
    isSuperAdmin: user?.email === superAdminEmail && teamMember?.designation === "super_admin",
    isTeamMember: !!teamMember,
    teamMember,
  };
};
