import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCategoryCounts = () => {
  return useQuery({
    queryKey: ["category-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("base_listings")
        .select("main_category_id")
        .eq("status", "active");

      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach((item) => {
        counts[item.main_category_id] = (counts[item.main_category_id] || 0) + 1;
      });
      return counts;
    },
    staleTime: 1000 * 60 * 5,
  });
};
