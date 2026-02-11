import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface County {
  id: string;
  name: string;
  slug: string;
  display_order: number;
}

export interface Town {
  id: string;
  county_id: string;
  name: string;
  slug: string;
}

export const useCounties = () => {
  return useQuery({
    queryKey: ["kenya-counties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kenya_counties")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as County[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
};

export const useTowns = (countyId: string | undefined) => {
  return useQuery({
    queryKey: ["kenya-towns", countyId],
    queryFn: async () => {
      if (!countyId) return [];
      const { data, error } = await supabase
        .from("kenya_towns")
        .select("*")
        .eq("county_id", countyId)
        .order("name");
      if (error) throw error;
      return data as Town[];
    },
    enabled: !!countyId,
    staleTime: 1000 * 60 * 60,
  });
};
