import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdminCounts = () => {
  return useQuery({
    queryKey: ["admin-sidebar-counts"],
    queryFn: async () => {
      const [
        { count: pendingListings },
        { count: pendingVerifications },
        { count: pendingSupport },
        { count: pendingReports },
        { count: pendingCustomValues },
        { count: pendingApplications },
        { count: pendingReviews },
      ] = await Promise.all([
        supabase.from("base_listings").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("seller_verifications").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("contact_submissions").select("*", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("custom_field_values").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("career_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      return {
        listings: pendingListings || 0,
        verifications: pendingVerifications || 0,
        support: pendingSupport || 0,
        reports: pendingReports || 0,
        customValues: pendingCustomValues || 0,
        careers: pendingApplications || 0,
        reviews: pendingReviews || 0,
      };
    },
    refetchInterval: 30000,
  });
};
