import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  SubscriptionPackage, 
  Addon, 
  AddonTier, 
  SellerSubscription,
  SellerAddon,
  PackageFormData,
  AddonFormData,
  TierFormData
} from "@/types/subscriptions";
import { toast } from "sonner";

// Fetch all subscription packages
export const useSubscriptionPackages = (activeOnly = false) => {
  return useQuery({
    queryKey: ["subscription-packages", activeOnly],
    queryFn: async () => {
      let query = supabase
        .from("subscription_packages")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (activeOnly) {
        query = query.eq("is_active", true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SubscriptionPackage[];
    },
  });
};

// Fetch all addons
export const useAddons = (activeOnly = false) => {
  return useQuery({
    queryKey: ["addons", activeOnly],
    queryFn: async () => {
      let query = supabase
        .from("addons")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (activeOnly) {
        query = query.eq("is_active", true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Addon[];
    },
  });
};

// Fetch addon tiers
export const useAddonTiers = (addonId?: string, activeOnly = false) => {
  return useQuery({
    queryKey: ["addon-tiers", addonId, activeOnly],
    queryFn: async () => {
      let query = supabase
        .from("addon_tiers")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (addonId) {
        query = query.eq("addon_id", addonId);
      }
      
      if (activeOnly) {
        query = query.eq("is_active", true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as AddonTier[];
    },
  });
};

// Fetch seller's current subscription
export const useSellerSubscription = (userId?: string) => {
  return useQuery({
    queryKey: ["seller-subscription", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("seller_subscriptions")
        .select("*, package:subscription_packages(*)")
        .eq("user_id", userId)
        .eq("status", "active")
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data as SellerSubscription | null;
    },
    enabled: !!userId,
  });
};

// Fetch seller's purchased addons
export const useSellerAddons = (userId?: string) => {
  return useQuery({
    queryKey: ["seller-addons", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("seller_addons")
        .select("*, addon:addons(*), tier:addon_tiers(*)")
        .eq("user_id", userId)
        .eq("status", "active");
      
      if (error) throw error;
      return data as SellerAddon[];
    },
    enabled: !!userId,
  });
};

// Package mutations
export const useCreatePackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: PackageFormData) => {
      const { data: result, error } = await supabase
        .from("subscription_packages")
        .insert({
          ...data,
          allowed_categories: data.allowed_categories.length > 0 ? data.allowed_categories : null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-packages"] });
      toast.success("Package created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create package: " + error.message);
    },
  });
};

export const useUpdatePackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PackageFormData> }) => {
      const updateData: Record<string, unknown> = { ...data };
      if (data.allowed_categories !== undefined) {
        updateData.allowed_categories = data.allowed_categories.length > 0 ? data.allowed_categories : null;
      }
      
      const { data: result, error } = await supabase
        .from("subscription_packages")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-packages"] });
      toast.success("Package updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update package: " + error.message);
    },
  });
};

export const useDeletePackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("subscription_packages")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-packages"] });
      toast.success("Package deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete package: " + error.message);
    },
  });
};

// Addon mutations
export const useCreateAddon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: AddonFormData) => {
      const { data: result, error } = await supabase
        .from("addons")
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addons"] });
      toast.success("Add-on created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create add-on: " + error.message);
    },
  });
};

export const useUpdateAddon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AddonFormData> }) => {
      const { data: result, error } = await supabase
        .from("addons")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addons"] });
      toast.success("Add-on updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update add-on: " + error.message);
    },
  });
};

export const useDeleteAddon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("addons")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addons"] });
      toast.success("Add-on deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete add-on: " + error.message);
    },
  });
};

// Tier mutations
export const useCreateTier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: TierFormData) => {
      const { data: result, error } = await supabase
        .from("addon_tiers")
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addon-tiers"] });
      toast.success("Tier created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create tier: " + error.message);
    },
  });
};

export const useUpdateTier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TierFormData> }) => {
      const { data: result, error } = await supabase
        .from("addon_tiers")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addon-tiers"] });
      toast.success("Tier updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update tier: " + error.message);
    },
  });
};

export const useDeleteTier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("addon_tiers")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addon-tiers"] });
      toast.success("Tier deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete tier: " + error.message);
    },
  });
};
