import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/xml; charset=utf-8",
};

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const baseUrl = "https://jiji-kenya-sparkle.lovable.app";

  // Static pages
  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "daily" },
    { loc: "/search", priority: "0.8", changefreq: "daily" },
    { loc: "/pricing", priority: "0.7", changefreq: "weekly" },
    { loc: "/about-us", priority: "0.5", changefreq: "monthly" },
    { loc: "/contact-us", priority: "0.5", changefreq: "monthly" },
    { loc: "/faqs", priority: "0.5", changefreq: "monthly" },
    { loc: "/blog", priority: "0.6", changefreq: "daily" },
    { loc: "/sellers", priority: "0.6", changefreq: "daily" },
    { loc: "/careers", priority: "0.5", changefreq: "weekly" },
    { loc: "/safety-tips", priority: "0.4", changefreq: "monthly" },
  ];

  // Fetch categories
  const { data: categories } = await supabase
    .from("main_categories")
    .select("slug, updated_at")
    .eq("is_active", true);

  // Fetch active listings (last 1000)
  const { data: listings } = await supabase
    .from("base_listings")
    .select("id, title, main_category_id, updated_at, main_category:main_categories(slug)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1000);

  // Fetch published blog posts
  const { data: blogs } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("status", "published");

  // Build XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Static pages
  for (const page of staticPages) {
    xml += `
  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }

  // Categories
  if (categories) {
    for (const cat of categories) {
      xml += `
  <url>
    <loc>${baseUrl}/category/${cat.slug}</loc>
    <lastmod>${new Date(cat.updated_at).toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    }
  }

  // Listings
  if (listings) {
    for (const listing of listings) {
      const catSlug = (listing as any).main_category?.slug;
      const titleSlug = listing.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .substring(0, 60);
      const shortId = listing.id.replace(/-/g, "").slice(0, 8);
      const url = catSlug
        ? `/listing/${catSlug}/${titleSlug}-${shortId}`
        : `/listing/${listing.id}`;
      xml += `
  <url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${new Date(listing.updated_at).toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }
  }

  // Blog posts
  if (blogs) {
    for (const post of blogs) {
      xml += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at).toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`;
    }
  }

  xml += `
</urlset>`;

  return new Response(xml, { headers: corsHeaders });
});
