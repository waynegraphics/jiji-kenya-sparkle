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

    const systemPrompt = `You are an AI search parser for a classified ads marketplace in Kenya.
You ONLY extract structured search parameters from natural language queries.
You NEVER answer questions outside of marketplace search.
If the query is not about buying/selling/searching for items, return {"error": "unrelated"}.

Available categories (use exact slug): vehicles, property, jobs, electronics, phones-tablets, fashion, furniture-appliances, animals-pets, babies-kids, beauty-health, sports-leisure, construction, agriculture, equipment, services
Available locations (Kenya counties): Nairobi, Mombasa, Kisumu, Nakuru, Uasin Gishu, Kiambu, Machakos, Kajiado, Kilifi, Kwale, Meru, Nyeri, Murang'a, Kirinyaga, Embu, Tharaka Nithi, Laikipia, Nyandarua, Baringo, Nandi, Kericho, Bomet, Narok, Trans Nzoia, Elgeyo Marakwet, West Pokot, Turkana, Samburu, Marsabit, Isiolo, Garissa, Wajir, Mandera, Tana River, Lamu, Taita Taveta, Kitui, Makueni, Siaya, Homa Bay, Migori, Kisii, Nyamira, Bungoma, Busia, Kakamega, Vihiga
Currency: KES (Kenyan Shillings). When users say "500k" they mean 500000, "1M" means 1000000.

Vehicle subcategories: Cars, Motorcycles & Scooters, Trucks & Trailers, Buses & Minibuses, Heavy Equipment, Boats & Watercraft, Vehicle Parts & Accessories
Property subcategories: Houses & Apartments for Sale, Houses & Apartments for Rent, Land & Plots, Commercial Property, Short Stay
Electronics subcategories: Computers & Laptops, TVs & Monitors, Cameras & Photography, Audio & Music Equipment, Gaming & Consoles, Computer Accessories

Return ONLY valid JSON with these possible fields:
{
  "category": "slug",
  "subcategory": "name",
  "keyword": "search terms",
  "price_min": number,
  "price_max": number,
  "location": "county name",
  "condition": "new|used",
  "make": "for vehicles",
  "model": "for vehicles",
  "year_min": number,
  "year_max": number,
  "bedrooms": number,
  "property_type": "apartment|house|land|commercial",
  "listing_type": "for_sale|for_rent",
  "brand": "for electronics/phones",
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
