

# Enable Netlify Prerender Extension (Zero Build Impact)

## Current Problem

The SSR checker shows a blank `<div id="root"></div>` because your site is a client-side SPA. Crawlers receive empty HTML. The `window.prerenderReady` signal is already implemented in your code but nothing is consuming it.

## Solution: Netlify Prerender Extension (Runtime, Not Build-Time)

Netlify has a **built-in Prerender extension** that works at runtime -- it does NOT slow down your build at all. When a crawler/bot requests a page, Netlify intercepts the request, renders it in a headless browser, waits for `window.prerenderReady === true`, and serves the fully rendered HTML. Regular users still get the fast SPA.

Your code already has everything needed (`window.prerenderReady`, `usePrerenderReady` hook, `PageLayout` wrapper). We just need to enable it and make a few small tweaks.

## Steps

### 1. Enable Netlify Prerender Extension (Manual -- One Time)

Go to your Netlify dashboard:
1. Visit https://app.netlify.com/extensions/prerender
2. Install the extension to your team
3. Go to your project > Extensions > Prerender > **Enable prerendering**
4. Save and re-deploy

This is the only manual step. Once enabled, it works for ALL pages automatically -- current and future.

### 2. Small Code Fixes

**a) Fix `index.html` -- Add `<meta name="fragment" content="!">` tag**

This meta tag tells crawlers that this page supports the AJAX crawling scheme and has pre-rendered content available. Netlify's prerender extension looks for this.

**b) Update `netlify.toml` -- Add bot detection header**

Add a custom header to help the prerender extension identify cacheable responses:

```
[build.environment]
  PRERENDER_ENABLED = "true"
```

**c) Verify `usePrerenderReady` reset logic**

The current hook resets `window.prerenderReady = false` on mount. For prerendering (where the bot loads the page fresh each time), this is correct. No change needed.

### 3. No Build-Time Prerendering Required

The Netlify Prerender extension handles everything at the edge/runtime:
- No Puppeteer in your build
- No build time increase
- Works for dynamic routes (`/job/:id`, `/blog/:slug`) automatically
- Works for any new pages you add (as long as they use `PageLayout`)
- Cached results are served for subsequent bot requests

## Files to Modify

| File | Change |
|------|--------|
| `index.html` | Add `<meta name="fragment" content="!">` in `<head>` |
| `netlify.toml` | Add `PRERENDER_ENABLED` env var for clarity |

## What Happens After This

- Crawlers request any page (e.g., `/about`, `/job/123`, `/blog/my-post`)
- Netlify detects it's a bot via User-Agent
- Netlify's serverless function renders the page in a headless browser
- It waits for `window.prerenderReady === true` (your existing signal)
- Returns fully rendered HTML to the crawler
- Caches the result for 24-48 hours
- Regular users still get the fast SPA experience

## Future-Proof

When you add new resource categories, blogs, or any page:
1. Wrap it in `<PageLayout>` (already your pattern)
2. Add the route in `App.tsx`
3. Done -- Netlify prerender handles it automatically at runtime

No build scripts, no route discovery, no Puppeteer -- the prerender extension handles all bot rendering on-demand.

