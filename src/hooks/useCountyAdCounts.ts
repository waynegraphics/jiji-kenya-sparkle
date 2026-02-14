import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCountyAdCounts = () => {
  return useQuery({
    queryKey: ["county-ad-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("base_listings")
        .select("location")
        .eq("status", "active");

      if (error) throw error;

      const counts: Record<string, number> = {};
      const townCounts: Record<string, Record<string, number>> = {};
      let total = 0;
      data?.forEach((item) => {
        // location is stored as "County" or "County, Town"
        const parts = item.location?.split(",").map((s: string) => s.trim());
        const county = parts?.[0];
        const town = parts?.[1];
        if (county) {
          counts[county] = (counts[county] || 0) + 1;
          total++;
          if (town) {
            if (!townCounts[county]) townCounts[county] = {};
            townCounts[county][town] = (townCounts[county][town] || 0) + 1;
          }
        }
      });
      return { counts, townCounts, total };
    },
    staleTime: 1000 * 60 * 5,
  });
};
