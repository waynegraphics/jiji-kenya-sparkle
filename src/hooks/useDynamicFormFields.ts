import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DynamicFormField {
  id: string;
  category_slug: string;
  field_name: string;
  field_label: string;
  field_type: string;
  options: string[];
  is_required: boolean;
  is_searchable: boolean;
  display_order: number;
  placeholder: string | null;
  help_text: string | null;
  is_active: boolean;
}

export const useDynamicFormFields = (categorySlug: string | undefined) => {
  return useQuery({
    queryKey: ["dynamic-form-fields", categorySlug],
    queryFn: async () => {
      if (!categorySlug) return [];
      const { data, error } = await supabase
        .from("category_form_fields")
        .select("*")
        .eq("category_slug", categorySlug)
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data as DynamicFormField[];
    },
    enabled: !!categorySlug,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSearchableFields = (categorySlug: string | undefined) => {
  return useQuery({
    queryKey: ["searchable-fields", categorySlug],
    queryFn: async () => {
      if (!categorySlug) return [];
      const { data, error } = await supabase
        .from("category_form_fields")
        .select("*")
        .eq("category_slug", categorySlug)
        .eq("is_active", true)
        .eq("is_searchable", true)
        .order("display_order");
      if (error) throw error;
      return data as DynamicFormField[];
    },
    enabled: !!categorySlug,
    staleTime: 1000 * 60 * 5,
  });
};

export const useListingDynamicValues = (listingId: string | undefined) => {
  return useQuery({
    queryKey: ["listing-dynamic-values", listingId],
    queryFn: async () => {
      if (!listingId) return {};
      const { data, error } = await supabase
        .from("listing_dynamic_fields")
        .select("field_id, field_value, category_form_fields(field_name, field_label)")
        .eq("listing_id", listingId);
      if (error) throw error;
      const values: Record<string, string> = {};
      data?.forEach((d: any) => {
        if (d.category_form_fields?.field_name) {
          values[d.category_form_fields.field_name] = d.field_value || "";
        }
      });
      return values;
    },
    enabled: !!listingId,
  });
};

export const saveDynamicFieldValues = async (
  listingId: string,
  fields: DynamicFormField[],
  values: Record<string, string>
) => {
  const upserts = fields
    .filter(f => values[f.field_name] !== undefined && values[f.field_name] !== "")
    .map(f => ({
      listing_id: listingId,
      field_id: f.id,
      field_value: values[f.field_name],
    }));

  if (upserts.length === 0) return;

  const { error } = await supabase
    .from("listing_dynamic_fields")
    .upsert(upserts, { onConflict: "listing_id,field_id" });
  if (error) throw error;
};
