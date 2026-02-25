import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Tables in dependency order (parents first)
    const tables = [
      "main_categories", "sub_categories", "kenya_counties", "kenya_towns",
      "vehicle_makes", "vehicle_models", "subscription_packages", "listing_tiers",
      "promotion_types", "featured_durations", "featured_settings", "bump_packages",
      "addons", "addon_tiers", "platform_settings", "communication_channels",
      "email_templates", "ai_settings", "mpesa_settings", "career_openings",
      "category_form_fields", "blog_posts", "announcements",
      // User tables
      "profiles", "user_roles", "team_members",
      // Listings
      "base_listings", "vehicle_listings", "property_listings", "electronics_listings",
      "phone_listings", "job_listings", "fashion_listings", "furniture_listings",
      "construction_listings", "agriculture_listings", "beauty_listings",
      "equipment_listings", "kids_listings", "leisure_listings", "pet_listings",
      "service_listings", "listing_dynamic_fields",
      // Transactions & relations
      "seller_subscriptions", "seller_addons", "seller_verifications",
      "listing_promotions", "listing_tier_purchases",
      "favorites", "follows", "messages", "notifications", "reviews",
      "reports", "contact_submissions", "payment_transactions", "bump_transactions",
      "affiliates", "affiliate_clicks", "affiliate_referrals", "affiliate_payouts",
      "moderation_logs", "ai_usage_logs", "custom_field_values", "rate_limit_tracker",
      "support_tickets", "ticket_responses", "user_suspensions", "user_warnings",
      "career_applications", "listings",
    ];

    let sql = `-- JIJI KENYA Full Data Export - Generated ${new Date().toISOString()}
-- Run: docker exec -i supabase-db psql -U postgres -d postgres < full_export.sql

BEGIN;

-- Disable triggers and RLS for import
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE TRIGGER ALL;';
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY;';
  END LOOP;
END $$;

`;

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select("*").limit(10000);
      
      if (error) {
        sql += `-- ERROR fetching ${table}: ${error.message}\n\n`;
        continue;
      }

      if (!data || data.length === 0) {
        sql += `-- ${table}: 0 rows (skipped)\n\n`;
        continue;
      }

      sql += `-- ===================== ${table} (${data.length} rows) =====================\n`;

      const cols = Object.keys(data[0]);
      const colStr = cols.map(c => `"${c}"`).join(", ");

      for (const row of data) {
        const vals = cols.map(c => {
          const v = row[c];
          if (v === null || v === undefined) return "NULL";
          if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
          if (typeof v === "number") return String(v);
          if (Array.isArray(v)) {
            if (v.length === 0) return "'{}'";
            const items = v.map(item => `"${String(item).replace(/"/g, '\\"')}"`);
            return `'{${items.join(",")}}'`;
          }
          if (typeof v === "object") {
            return `'${JSON.dumps ? JSON.stringify(v).replace(/'/g, "''") : JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
          }
          return `E'${String(v).replace(/\\/g, "\\\\").replace(/'/g, "''").replace(/\n/g, "\\n")}'`;
        });

        sql += `INSERT INTO public."${table}" (${colStr}) VALUES (${vals.join(", ")}) ON CONFLICT DO NOTHING;\n`;
      }

      sql += "\n";
    }

    sql += `
-- Fix sequences
SELECT setval('profiles_user_number_seq', COALESCE((SELECT MAX(user_number) FROM profiles), 1));

-- Re-enable triggers and RLS
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE TRIGGER ALL;';
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
  END LOOP;
END $$;

COMMIT;

-- Verify
SELECT tablename, n_live_tup as rows FROM pg_stat_user_tables WHERE schemaname='public' ORDER BY n_live_tup DESC;
`;

    return new Response(sql, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": "attachment; filename=full_export.sql",
      },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
