

## Plan: Replace Firecrawl with Free Native Fetch Scraper

The current `scrape-careers` function depends on Firecrawl (paid API). We'll replace it with a free approach using native `fetch` to download the HTML and a regex-based link extractor — no external dependencies or API keys needed.

### What changes

**File: `supabase/functions/scrape-careers/index.ts`**

Replace the Firecrawl API call with:
1. Direct `fetch` of the company's `career_page_url` with a browser-like User-Agent header
2. Parse the raw HTML to extract all `<a href="...">` links and their anchor text using regex
3. Resolve relative URLs to absolute using the page's base URL
4. Filter links using the existing job-URL heuristics (same logic already in place)
5. Also extract a better title from the anchor text instead of just URL slugs
6. Remove the `FIRECRAWL_API_KEY` check entirely — no API key needed

### Technical details

- Use `fetch(url, { headers: { "User-Agent": "Mozilla/5.0 ..." } })` to get HTML as text
- Extract links with regex: `/<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi`
- Strip HTML tags from anchor text to get clean title
- Resolve relative URLs with `new URL(href, baseUrl)`
- Everything else (dedup check against `scraped_jobs`, insert new entries) stays the same
- No external service, no API key, completely free

### Limitations

- Won't work on heavily JS-rendered career pages (SPA sites like Greenhouse iframes). For those, the raw HTML won't contain job links. This is a known trade-off vs Firecrawl.
- Most corporate career pages serve server-rendered HTML with job links, so this will work for the majority of cases.

