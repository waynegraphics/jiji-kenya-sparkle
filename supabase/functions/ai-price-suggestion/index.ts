import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { category, title, location, categoryFields } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: settings } = await supabase.from("ai_settings").select("*").limit(1).single();
    if (settings && !settings.enable_price_suggestion) {
      return new Response(JSON.stringify({ error: "Price suggestion is disabled" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authenticate
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

    // Fetch similar listings for benchmarking
    const { data: similarListings } = await supabase
      .from("base_listings")
      .select("price, title, location")
      .eq("status", "active")
      .ilike("title", `%${(title || "").split(" ").slice(0, 3).join("%")}%`)
      .order("created_at", { ascending: false })
      .limit(10);

    const model = settings?.model || "google/gemini-3-flash-preview";
    const temperature = settings?.temperature || 0.2;

    const benchmarkData = similarListings?.map(l => ({
      price: l.price,
      title: l.title,
      location: l.location,
    })) || [];

    const systemPrompt = `You are a price suggestion AI for a Kenyan classified ads marketplace.
You ONLY suggest prices in KES (Kenyan Shillings).
You base suggestions on market data provided and general Kenya market knowledge.
You NEVER discuss topics outside pricing for classified ads.
Return ONLY structured JSON.`;

    const userPrompt = `Suggest a competitive price for this listing:
Category: ${category}
Title: "${title}"
Location: ${location || "Kenya"}
Details: ${JSON.stringify(categoryFields || {})}

Similar listings on our platform:
${JSON.stringify(benchmarkData)}`;

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
            name: "suggest_price",
            description: "Return price suggestion data",
            parameters: {
              type: "object",
              properties: {
                suggested_price: { type: "number", description: "Best suggested price in KES" },
                price_min: { type: "number", description: "Minimum price range in KES" },
                price_max: { type: "number", description: "Maximum price range in KES" },
                reasoning: { type: "string", description: "Brief explanation of the suggestion" },
                market_position: { type: "string", enum: ["below_market", "competitive", "above_market"] },
              },
              required: ["suggested_price", "price_min", "price_max", "reasoning"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "suggest_price" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
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
    if (!toolCall) throw new Error("No AI response");

    let parsed;
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch {
      throw new Error("Invalid AI response");
    }

    await supabase.from("ai_usage_logs").insert({
      user_id: user.id,
      action_type: "price_suggestion",
      prompt_summary: `Price: ${title || category}`.substring(0, 200),
      provider: "gemini",
      model,
      success: true,
    });

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-price error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "AI error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
