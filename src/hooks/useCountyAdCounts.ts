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
      let total = 0;
      data?.forEach((item) => {
        // location is stored as "County" or "County, Town"
        const county = item.location?.split(",")[0]?.trim();
        if (county) {
          counts[county] = (counts[county] || 0) + 1;
          total++;
        }
      });
      return { counts, total };
    },
    staleTime: 1000 * 60 * 5,
  });
};
