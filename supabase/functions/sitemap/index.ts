import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://nudjyemktgioxmxwnxev.supabase.co";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const SITE_URL = "https://www.opportunityavenue.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toUrlEntry(loc: string, lastmod?: string, changefreq = "weekly", priority = "0.5"): string {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const today = new Date().toISOString().split("T")[0];

    // Fetch static routes, jobs, and blogs in parallel
    const [routesResult, jobsResult, blogsResult] = await Promise.all([
      supabase
        .from("static_routes")
        .select("path, priority, changefreq")
        .eq("is_active", true)
        .order("path"),
      supabase
        .from("jobs")
        .select("id, updated_at")
        .is("deleted_at", null)
        .or(`deadline.is.null,deadline.gte.${today}`)
        .order("updated_at", { ascending: false }),
      supabase
        .from("blogs")
        .select("slug, updated_at")
        .eq("status", "published")
        .order("updated_at", { ascending: false }),
    ]);

    const entries: string[] = [];

    // Hardcoded homepage
    entries.push(toUrlEntry(`${SITE_URL}/`, today, "daily", "1.0"));

    // DB-driven static routes
    if (routesResult.data) {
      for (const route of routesResult.data) {
        entries.push(toUrlEntry(`${SITE_URL}${route.path}`, today, route.changefreq, route.priority));
      }
    }

    // Job routes
    if (jobsResult.data) {
      for (const job of jobsResult.data) {
        const lastmod = job.updated_at ? job.updated_at.split("T")[0] : today;
        entries.push(toUrlEntry(`${SITE_URL}/job/${job.id}`, lastmod, "daily", "0.8"));
      }
    }

    // Blog routes
    if (blogsResult.data) {
      for (const blog of blogsResult.data) {
        const lastmod = blog.updated_at ? blog.updated_at.split("T")[0] : today;
        entries.push(toUrlEntry(`${SITE_URL}/blog/${blog.slug}`, lastmod, "weekly", "0.7"));
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
