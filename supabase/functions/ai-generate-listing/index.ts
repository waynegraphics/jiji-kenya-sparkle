import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, category, title, description, price, location, categoryFields } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: settings } = await supabase.from("ai_settings").select("*").limit(1).single();
    if (settings && !settings.enable_seller_assistant) {
      return new Response(JSON.stringify({ error: "Seller assistant is disabled" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user } } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const model = settings?.model || "google/gemini-3-flash-preview";
    const temperature = settings?.temperature || 0.2;

    const systemPrompt = `You are a listing optimization AI for a Kenyan classified ads marketplace (like OLX/Jiji).
You help sellers write better ad titles and descriptions so buyers can find and trust their listings.
Currency: KES (Kenyan Shillings).
You NEVER discuss topics outside of classified ads.
You ONLY return structured JSON output.

Available categories: Vehicles, Property, Jobs, Electronics, Phones & Tablets, Fashion, Furniture & Appliances, Animals & Pets, Babies & Kids, Beauty & Health, Sports & Leisure, Construction, Agriculture, Equipment, Services

IMPORTANT CONTEXT - This is a CLASSIFIED ADS platform:
- Sellers are posting ads to sell items or offer services. They are NOT building websites.
- Seller contact details (phone, WhatsApp, location) are ALREADY in their profile - never suggest adding contact info in the ad.
- NEVER mention WordPress, Shopify, React, hosting, domains, portfolios, or any web development tools.
- NEVER suggest sharing samples via WhatsApp or adding links to portfolios - the platform handles messaging.
- Tips must ONLY be about making the ad listing itself better: better photos, accurate descriptions, fair pricing, honest condition reporting.

CATEGORY DETECTION from title:
- If title mentions iPhone, Samsung, Pixel, phone brands → category is likely "Phones & Tablets"
- If title mentions laptop, monitor, TV, computer → category is likely "Electronics"  
- If title mentions car, Toyota, BMW, motorcycle → category is likely "Vehicles"
- If title mentions apartment, house, plot, land → category is likely "Property"
- If title mentions sofa, table, fridge, cooker → category is likely "Furniture & Appliances"
- Use this intelligence to provide category-appropriate suggestions even if the user hasn't selected a category yet.

Rules:
- Titles should be 60-80 chars, keyword-rich, specific (include brand, model, condition, key spec)
- Descriptions should be detailed, honest, highlight key features, include condition/specs
- Prices must be realistic for Kenya market in KES
- SEO keywords should be search terms buyers would use on a classifieds site
- Never invent unrealistic features
- Grammar must be perfect
- Tips should be practical classified-ad tips like: use clear photos, mention the exact condition, state if price is negotiable, include the specific model/year`;

    let userPrompt = "";
    
    if (action === "generate_title") {
      userPrompt = `Generate an optimized classified ad title for a ${category} listing.
Current title: "${title || "none"}"
Description: "${description || "none"}"
Location: ${location || "Kenya"}
Category details: ${JSON.stringify(categoryFields || {})}

Make the title specific with brand/model/condition when possible.`;
    } else if (action === "generate_description") {
      userPrompt = `Generate an optimized, buyer-friendly classified ad description for a ${category} listing.
Title: "${title || "none"}"
Current description: "${description || "none"}"
Price: KES ${price || "not set"}
Location: ${location || "Kenya"}
Category details: ${JSON.stringify(categoryFields || {})}

Focus on specs, condition, and what makes this item worth buying. Do NOT include seller contact info - that's already in their profile.`;
    } else if (action === "suggest_price") {
      userPrompt = `Suggest a competitive price range for this ${category} listing in Kenya.
Title: "${title || "none"}"
Description: "${description || "none"}"
Location: ${location || "Kenya"}
Category details: ${JSON.stringify(categoryFields || {})}`;
    } else if (action === "full_optimize") {
      userPrompt = `Fully optimize this classified ad listing. Provide improved title, description, suggested price, and SEO keywords.
Current title: "${title || "none"}"
Current description: "${description || "none"}"
Current price: KES ${price || "not set"}
Location: ${location || "Kenya"}
Category: ${category}
Category details: ${JSON.stringify(categoryFields || {})}

Remember: this is a classified ad, not a website. Tips should be about writing a better ad (clear photos, accurate specs, honest condition, competitive pricing). Never mention web development, hosting, portfolios, or contact sharing.`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const toolSchema: Record<string, unknown> = {
      type: "object",
      properties: {
        title: { type: "string", description: "Optimized listing title" },
        description: { type: "string", description: "Optimized listing description" },
        suggested_price: { type: "number", description: "Suggested price in KES" },
        price_min: { type: "number", description: "Minimum suggested price in KES" },
        price_max: { type: "number", description: "Maximum suggested price in KES" },
        seo_keywords: { type: "array", items: { type: "string" }, description: "Search terms buyers would use" },
        tips: { type: "array", items: { type: "string" }, description: "Practical tips to improve the classified ad listing (about photos, description quality, pricing - NOT about web development or contact info)" },
      },
      required: ["title"],
      additionalProperties: false,
    };

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
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "optimize_listing",
            description: "Return optimized listing data",
            parameters: toolSchema,
          },
        }],
        tool_choice: { type: "function", function: { name: "optimize_listing" } },
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
      throw new Error("No AI response");
    }

    let parsed;
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch {
      throw new Error("Invalid AI response format");
    }

    // Log usage
    await supabase.from("ai_usage_logs").insert({
      user_id: user.id,
      action_type: action,
      prompt_summary: `${action}: ${title || category}`.substring(0, 200),
      provider: "gemini",
      model,
      success: true,
    });

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-generate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "AI error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
