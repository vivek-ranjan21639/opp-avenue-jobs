import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function extractLinks(html: string, baseUrl: string): Array<{ url: string; title: string }> {
  const linkRegex = /<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const results: Array<{ url: string; title: string }> = [];
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const anchorHtml = match[2];

    // Strip HTML tags from anchor text
    const title = anchorHtml.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

    // Resolve relative URLs
    try {
      const absoluteUrl = new URL(href, baseUrl).href;
      if (absoluteUrl.startsWith("http")) {
        results.push({ url: absoluteUrl, title: title || "Untitled Position" });
      }
    } catch {
      // Skip malformed URLs
    }
  }

  return results;
}

function isJobLink(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes("/job") ||
    lower.includes("/career") ||
    lower.includes("/position") ||
    lower.includes("/opening") ||
    lower.includes("/apply") ||
    lower.includes("/vacancy")
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get companies with career_page_url
    const { data: companies, error: compErr } = await supabase
      .from("companies")
      .select("id, name, career_page_url")
      .not("career_page_url", "is", null);

    if (compErr) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch companies: ${compErr.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const company of companies || []) {
      try {
        // Fetch career page HTML directly
        const response = await fetch(company.career_page_url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
        });

        if (!response.ok) {
          results.push({
            company: company.name,
            success: false,
            error: `HTTP ${response.status}`,
          });
          continue;
        }

        const html = await response.text();

        // Extract all links with their anchor text
        const allLinks = extractLinks(html, company.career_page_url);

        // Filter to job-related links
        const jobLinks = allLinks.filter((link) => isJobLink(link.url));

        let newCount = 0;

        for (const job of jobLinks) {
          // Check if already scraped
          const { data: existing } = await supabase
            .from("scraped_jobs")
            .select("id")
            .eq("company_id", company.id)
            .eq("source_url", job.url)
            .limit(1);

          if (existing && existing.length > 0) continue;

          // Use anchor text as title, fallback to URL-derived title
          const title =
            job.title ||
            job.url
              .split("/")
              .pop()
              ?.replace(/[-_]/g, " ")
              .replace(/\.\w+$/, "")
              .trim() ||
            "Untitled Position";

          await supabase.from("scraped_jobs").insert({
            company_id: company.id,
            source_url: job.url,
            title,
            status: "pending",
            raw_content: null,
          });

          newCount++;
        }

        results.push({
          company: company.name,
          success: true,
          total_links: allLinks.length,
          job_links: jobLinks.length,
          new_jobs: newCount,
        });
      } catch (err) {
        results.push({
          company: company.name,
          success: false,
          error: (err as Error).message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        companies_processed: companies?.length || 0,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${(err as Error).message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
