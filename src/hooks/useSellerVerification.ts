import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SellerVerification {
  id: string;
  user_id: string;
  id_front_url: string | null;
  id_back_url: string | null;
  passport_photo_url: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

export const useSellerVerification = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["seller-verification", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("seller_verifications")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as SellerVerification | null;
    },
    enabled: !!user,
  });
};

export const useSubmitVerification = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id_front_url: string;
      id_back_url: string;
      passport_photo_url: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("seller_verifications")
        .upsert({
          user_id: user.id,
          ...data,
          status: "pending",
        }, { onConflict: "user_id" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-verification"] });
    },
  });
};
