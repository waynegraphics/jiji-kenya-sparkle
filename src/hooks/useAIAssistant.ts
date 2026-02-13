import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIListingResult {
  title?: string;
  description?: string;
  suggested_price?: number;
  price_min?: number;
  price_max?: number;
  seo_keywords?: string[];
  tips?: string[];
  reasoning?: string;
  market_position?: string;
}

export const useAIAssistant = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIListingResult | null>(null);

  const generateListing = async (params: {
    action: "generate_title" | "generate_description" | "suggest_price" | "full_optimize";
    category: string;
    title?: string;
    description?: string;
    price?: string;
    location?: string;
    categoryFields?: Record<string, unknown>;
  }) => {
    setIsLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate-listing", {
        body: params,
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return null;
      }

      setResult(data);
      return data as AIListingResult;
    } catch (e) {
      console.error("AI assist error:", e);
      toast.error("AI assistant unavailable. Please try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const suggestPrice = async (params: {
    category: string;
    title?: string;
    location?: string;
    categoryFields?: Record<string, unknown>;
  }) => {
    setIsLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-price-suggestion", {
        body: params,
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return null;
      }

      setResult(data);
      return data as AIListingResult;
    } catch (e) {
      console.error("AI price error:", e);
      toast.error("Price suggestion unavailable. Please try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { generateListing, suggestPrice, isLoading, result, setResult };
};
