import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string" || query.trim().length < 3) {
      return new Response(JSON.stringify({ error: "Query too short" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI not configured");

    // Fetch AI settings
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: settings } = await supabase.from("ai_settings").select("*").limit(1).single();
    
    if (settings && !settings.enable_smart_search) {
      return new Response(JSON.stringify({ error: "Smart search is disabled" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const model = settings?.model || "google/gemini-3-flash-preview";
    const temperature = settings?.temperature || 0.2;

    // Get auth user for logging
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
      const { data: { user } } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = user?.id || null;
    }

    const systemPrompt = `You are an AI search parser for a FULL classified ads marketplace in Kenya (like OLX/Jiji).
You parse ANY type of listing query — not just vehicles. You handle property, jobs, electronics, phones, fashion, furniture, kids items, pets, beauty, services, agriculture, construction, equipment, sports/leisure, and more.

CRITICAL RULES:
- The "keyword" field is THE MOST IMPORTANT field. It should contain the broadest useful search terms that will match listings in the database.
- For product searches like "iPhone 15 Plus", set keyword to "iPhone" or "iPhone 15" (broad enough to catch similar items like "iPhone 14 Plus", "iPhone 15 Pro Max" etc.)
- DO NOT make keyword too specific. If someone searches "Toyota Fielder 2012", set keyword to "Toyota Fielder" not the full string with year.
- Extract make/model/brand as SECONDARY info for display purposes, but keyword should be the broad search term.
- ALWAYS extract location if mentioned (e.g. "in Nakuru" → location:"Nakuru")
- ALWAYS extract price ranges (e.g. "under 1M" → price_max:1000000, "above 50k" → price_min:50000)
- Infer the category from context: "1 bedroom" → property, "iPhone" → phones-tablets, "Toyota" → vehicles, "sofa" → furniture-appliances, "puppy" → animals-pets, "baby clothes" → babies-kids, "makeup" → beauty-health, "tractor" → equipment
- "500k" = 500000, "1M" = 1000000, "50k" = 50000 in KES

Available categories (use exact slug): vehicles, property, jobs, electronics, phones-tablets, fashion, furniture-appliances, animals-pets, babies-kids, beauty-health, sports-leisure, construction, agriculture, equipment, services
Available locations (Kenya counties): Nairobi, Mombasa, Kisumu, Nakuru, Uasin Gishu, Kiambu, Machakos, Kajiado, Kilifi, Kwale, Meru, Nyeri, Murang'a, Kirinyaga, Embu, Tharaka Nithi, Laikipia, Nyandarua, Baringo, Nandi, Kericho, Bomet, Narok, Trans Nzoia, Elgeyo Marakwet, West Pokot, Turkana, Samburu, Marsabit, Isiolo, Garissa, Wajir, Mandera, Tana River, Lamu, Taita Taveta, Kitui, Makueni, Siaya, Homa Bay, Migori, Kisii, Nyamira, Bungoma, Busia, Kakamega, Vihiga

EXAMPLES:
- "iphone 15 plus" → {category:"phones-tablets", keyword:"iPhone", brand:"Apple", model:"iPhone 15 Plus", confidence:0.95}
- "1 bedroom in Nakuru" → {category:"property", keyword:"1 bedroom", bedrooms:1, location:"Nakuru", listing_type:"for_rent", confidence:0.9}
- "Toyota Fielder under 1M" → {category:"vehicles", keyword:"Toyota Fielder", make:"Toyota", model:"Fielder", price_max:1000000, confidence:0.95}
- "Samsung TV 55 inch" → {category:"electronics", keyword:"Samsung TV", brand:"Samsung", model:"TV 55 inch", confidence:0.9}
- "cheap sofas in Mombasa" → {category:"furniture-appliances", keyword:"sofa", location:"Mombasa", confidence:0.85}
- "German shepherd puppy" → {category:"animals-pets", keyword:"German shepherd", confidence:0.9}
- "graphic design jobs Nairobi" → {category:"jobs", keyword:"graphic design", location:"Nairobi", confidence:0.9}

Return ONLY valid JSON with these possible fields:
{
  "category": "slug",
  "subcategory": "name",
  "keyword": "broad search terms (CRITICAL: keep this broad for better results)",
  "price_min": number,
  "price_max": number,
  "location": "county name",
  "condition": "new|used",
  "make": "for vehicles (display only)",
  "model": "specific model (display only)",
  "year_min": number,
  "year_max": number,
  "bedrooms": number,
  "property_type": "apartment|house|land|commercial",
  "listing_type": "for_sale|for_rent",
  "brand": "brand name (display only)",
  "confidence": 0.0-1.0
}

Only include fields you can confidently extract. Set confidence based on how well you understood the query.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
        tools: [{
          type: "function",
          function: {
            name: "parse_search",
            description: "Parse natural language into structured search parameters",
            parameters: {
              type: "object",
              properties: {
                category: { type: "string" },
                subcategory: { type: "string" },
                keyword: { type: "string" },
                price_min: { type: "number" },
                price_max: { type: "number" },
                location: { type: "string" },
                condition: { type: "string", enum: ["new", "used"] },
                make: { type: "string" },
                model: { type: "string" },
                year_min: { type: "number" },
                year_max: { type: "number" },
                bedrooms: { type: "number" },
                property_type: { type: "string" },
                listing_type: { type: "string" },
                brand: { type: "string" },
                confidence: { type: "number" },
                error: { type: "string" },
              },
              required: ["confidence"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "parse_search" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      return new Response(JSON.stringify({ fallback: true, keyword: query }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch {
      return new Response(JSON.stringify({ fallback: true, keyword: query }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log usage
    if (userId) {
      await supabase.from("ai_usage_logs").insert({
        user_id: userId,
        action_type: "search",
        prompt_summary: query.substring(0, 200),
        provider: "gemini",
        model,
        success: true,
      });
    }

    // If confidence too low, fallback
    if (parsed.confidence < 0.3 || parsed.error) {
      return new Response(JSON.stringify({ fallback: true, keyword: query }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-search error:", e);
    return new Response(JSON.stringify({ fallback: true, keyword: "" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
