import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "FIRECRAWL_API_KEY not configured. Please connect Firecrawl." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
        // Scrape career page with Firecrawl
        const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: company.career_page_url,
            formats: ["links", "markdown"],
            onlyMainContent: true,
          }),
        });

        const scrapeData = await scrapeResponse.json();

        if (!scrapeResponse.ok) {
          results.push({
            company: company.name,
            success: false,
            error: scrapeData.error || `Status ${scrapeResponse.status}`,
          });
          continue;
        }

        // Extract job links from the page
        const links = scrapeData.data?.links || scrapeData.links || [];
        const markdown = scrapeData.data?.markdown || scrapeData.markdown || "";

        // Filter links that look like job postings (heuristic)
        const jobLinks = links.filter((link: string) => {
          const lower = link.toLowerCase();
          return (
            lower.includes("/job") ||
            lower.includes("/career") ||
            lower.includes("/position") ||
            lower.includes("/opening") ||
            lower.includes("/apply") ||
            lower.includes("/vacancy")
          );
        });

        let newCount = 0;

        for (const jobUrl of jobLinks) {
          // Check if already scraped
          const { data: existing } = await supabase
            .from("scraped_jobs")
            .select("id")
            .eq("company_id", company.id)
            .eq("source_url", jobUrl)
            .limit(1);

          if (existing && existing.length > 0) continue;

          // Extract title from URL or use generic
          const urlParts = jobUrl.split("/");
          const titleFromUrl = urlParts[urlParts.length - 1]
            ?.replace(/[-_]/g, " ")
            .replace(/\.\w+$/, "")
            .trim() || "Untitled Position";

          await supabase.from("scraped_jobs").insert({
            company_id: company.id,
            source_url: jobUrl,
            title: titleFromUrl,
            status: "pending",
            raw_content: null,
          });

          newCount++;
        }

        results.push({
          company: company.name,
          success: true,
          total_links: links.length,
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
