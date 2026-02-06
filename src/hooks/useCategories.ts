import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MainCategory, SubCategory, VehicleMake, VehicleModel, BaseListing } from "@/types/categories";

// Fetch all active main categories
export const useMainCategories = () => {
  return useQuery({
    queryKey: ["main-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("main_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data as MainCategory[];
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });
};

// Fetch sub-categories for a main category
export const useSubCategories = (mainCategoryId?: string) => {
  return useQuery({
    queryKey: ["sub-categories", mainCategoryId],
    queryFn: async () => {
      if (!mainCategoryId) return [];
      
      const { data, error } = await supabase
        .from("sub_categories")
        .select("*")
        .eq("main_category_id", mainCategoryId)
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data as SubCategory[];
    },
    enabled: !!mainCategoryId,
    staleTime: 1000 * 60 * 30,
  });
};

// Fetch all sub-categories
export const useAllSubCategories = () => {
  return useQuery({
    queryKey: ["all-sub-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sub_categories")
        .select("*, main_category:main_categories(*)")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 30,
  });
};

// Fetch category by slug
export const useCategoryBySlug = (slug?: string) => {
  return useQuery({
    queryKey: ["category-by-slug", slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from("main_categories")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data as MainCategory | null;
    },
    enabled: !!slug,
  });
};

// Fetch sub-category by slug
export const useSubCategoryBySlug = (mainSlug?: string, subSlug?: string) => {
  return useQuery({
    queryKey: ["sub-category-by-slug", mainSlug, subSlug],
    queryFn: async () => {
      if (!mainSlug || !subSlug) return null;
      
      // First get the main category
      const { data: mainCat, error: mainError } = await supabase
        .from("main_categories")
        .select("id")
        .eq("slug", mainSlug)
        .single();
      
      if (mainError || !mainCat) return null;
      
      // Then get the sub-category
      const { data, error } = await supabase
        .from("sub_categories")
        .select("*, main_category:main_categories(*)")
        .eq("main_category_id", mainCat.id)
        .eq("slug", subSlug)
        .eq("is_active", true)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!mainSlug && !!subSlug,
  });
};

// Fetch vehicle makes
export const useVehicleMakes = () => {
  return useQuery({
    queryKey: ["vehicle-makes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_makes")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data as VehicleMake[];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};

// Fetch vehicle models for a make
export const useVehicleModels = (makeId?: string) => {
  return useQuery({
    queryKey: ["vehicle-models", makeId],
    queryFn: async () => {
      if (!makeId) return [];
      
      const { data, error } = await supabase
        .from("vehicle_models")
        .select("*")
        .eq("make_id", makeId)
        .eq("is_active", true)
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data as VehicleModel[];
    },
    enabled: !!makeId,
    staleTime: 1000 * 60 * 60,
  });
};

// Fetch listings by category
export const useListingsByCategory = (
  categorySlug?: string, 
  subCategorySlug?: string,
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    condition?: string;
    sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc';
    page?: number;
    limit?: number;
  }
) => {
  return useQuery({
    queryKey: ["listings-by-category", categorySlug, subCategorySlug, filters],
    queryFn: async () => {
      let query = supabase
        .from("base_listings")
        .select(`
          *,
          main_category:main_categories(*),
          sub_category:sub_categories(*)
        `, { count: 'exact' })
        .eq("status", "active");

      // Filter by main category
      if (categorySlug) {
        const { data: mainCat } = await supabase
          .from("main_categories")
          .select("id")
          .eq("slug", categorySlug)
          .single();
        
        if (mainCat) {
          query = query.eq("main_category_id", mainCat.id);
        }
      }

      // Filter by sub-category
      if (subCategorySlug && categorySlug) {
        const { data: subCat } = await supabase
          .from("sub_categories")
          .select("id")
          .eq("slug", subCategorySlug)
          .single();
        
        if (subCat) {
          query = query.eq("sub_category_id", subCat.id);
        }
      }

      // Apply filters
      if (filters?.minPrice) {
        query = query.gte("price", filters.minPrice);
      }
      if (filters?.maxPrice) {
        query = query.lte("price", filters.maxPrice);
      }
      if (filters?.location) {
        query = query.eq("location", filters.location);
      }

      // Sorting
      switch (filters?.sortBy) {
        case 'oldest':
          query = query.order("created_at", { ascending: true });
          break;
        case 'price_asc':
          query = query.order("price", { ascending: true });
          break;
        case 'price_desc':
          query = query.order("price", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      // Pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        listings: data as BaseListing[],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      };
    },
    enabled: true,
  });
};

// Fetch single listing with category-specific data
export const useFullListing = (listingId?: string) => {
  return useQuery({
    queryKey: ["full-listing", listingId],
    queryFn: async () => {
      if (!listingId) return null;
      
      // Get base listing
      const { data: baseListing, error: baseError } = await supabase
        .from("base_listings")
        .select(`
          *,
          main_category:main_categories(*),
          sub_category:sub_categories(*)
        `)
        .eq("id", listingId)
        .single();
      
      if (baseError) throw baseError;
      if (!baseListing) return null;

      // Get the main category slug to determine which extra table to query
      const categorySlug = baseListing.main_category?.slug;
      
      let categoryData = null;
      
      switch (categorySlug) {
        case 'vehicles': {
          const { data } = await supabase
            .from("vehicle_listings")
            .select("*, make:vehicle_makes(*), model:vehicle_models(*)")
            .eq("id", listingId)
            .single();
          categoryData = { vehicle_listing: data };
          break;
        }
        case 'property': {
          const { data } = await supabase
            .from("property_listings")
            .select("*")
            .eq("id", listingId)
            .single();
          categoryData = { property_listing: data };
          break;
        }
        case 'jobs': {
          const { data } = await supabase
            .from("job_listings")
            .select("*")
            .eq("id", listingId)
            .single();
          categoryData = { job_listing: data };
          break;
        }
        case 'electronics': {
          const { data } = await supabase
            .from("electronics_listings")
            .select("*")
            .eq("id", listingId)
            .single();
          categoryData = { electronics_listing: data };
          break;
        }
        case 'phones-tablets': {
          const { data } = await supabase
            .from("phone_listings")
            .select("*")
            .eq("id", listingId)
            .single();
          categoryData = { phone_listing: data };
          break;
        }
        case 'fashion': {
          const { data } = await supabase
            .from("fashion_listings")
            .select("*")
            .eq("id", listingId)
            .single();
          categoryData = { fashion_listing: data };
          break;
        }
        case 'furniture-appliances': {
          const { data } = await supabase
            .from("furniture_listings")
            .select("*")
            .eq("id", listingId)
            .single();
          categoryData = { furniture_listing: data };
          break;
        }
        case 'animals-pets': {
          const { data } = await supabase
            .from("pet_listings")
            .select("*")
            .eq("id", listingId)
            .single();
          categoryData = { pet_listing: data };
          break;
        }
        case 'babies-kids': {
          const { data } = await supabase
            .from("kids_listings")
            .select("*")
            .eq("id", listingId)
            .single();
          categoryData = { kids_listing: data };
          break;
        }
        case 'services': {
          const { data } = await supabase
            .from("service_listings")
            .select("*")
            .eq("id", listingId)
            .single();
          categoryData = { service_listing: data };
          break;
        }
      }

      return {
        ...baseListing,
        ...categoryData
      };
    },
    enabled: !!listingId,
  });
};

// Featured listings for homepage
export const useFeaturedListings = (limit = 8) => {
  return useQuery({
    queryKey: ["featured-listings", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("base_listings")
        .select(`
          *,
          main_category:main_categories(name, slug, icon),
          sub_category:sub_categories(name, slug)
        `)
        .eq("status", "active")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as BaseListing[];
    },
  });
};

// Recent listings
export const useRecentListings = (limit = 12) => {
  return useQuery({
    queryKey: ["recent-listings", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("base_listings")
        .select(`
          *,
          main_category:main_categories(name, slug, icon),
          sub_category:sub_categories(name, slug)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as BaseListing[];
    },
  });
};
