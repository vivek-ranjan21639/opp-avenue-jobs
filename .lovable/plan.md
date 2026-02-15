

# Comprehensive Netlify Prerendering for ALL Pages

## Problem
Currently only 4 out of 17 pages have prerender signaling, and those 4 use the wrong mechanism. Netlify's Prerender extension requires `window.prerenderReady = true` (a global variable), but the code dispatches a custom DOM event instead. This means Netlify's headless browser never gets the signal, and must wait for the 10-second timeout on every page.

## Changes

### 1. Update the Prerender Hook (`src/hooks/usePrerenderReady.ts`)
Replace the custom DOM event with `window.prerenderReady = true`, which is what Netlify checks.

### 2. Add TypeScript Declaration (`src/vite-env.d.ts`)
Add `prerenderReady` to the global `Window` interface so TypeScript accepts `window.prerenderReady`.

### 3. Update Fallback in `src/main.tsx`
Change the 5-second fallback from dispatching a custom event to setting `window.prerenderReady = true`. Also initialize `window.prerenderReady = false` at startup.

### 4. Add `usePrerenderReady` to ALL Remaining Pages

**Pages with async data (signal after data loads):**

| Page | File | Signal Condition |
|------|------|-----------------|
| Resources | `src/pages/Resources.tsx` | `!loadingFeatured` |
| Career Guides | `src/pages/CareerGuides.tsx` | `!isLoading` |
| Resume Templates | `src/pages/ResumeTemplates.tsx` | `!isLoading` |
| Interview Tips | `src/pages/InterviewTips.tsx` | `!isLoading` |
| Industry Reports | `src/pages/IndustryReports.tsx` | `!isLoading` |
| Sitemap | `src/pages/Sitemap.tsx` | `true` (static content) |

**Pages with static content (signal immediately):**

| Page | File |
|------|------|
| About | `src/pages/About.tsx` |
| Advertise | `src/pages/Advertise.tsx` |
| Contact | `src/pages/Contact.tsx` |
| Privacy Policy | `src/pages/PrivacyPolicy.tsx` |
| Terms & Conditions | `src/pages/TermsConditions.tsx` |
| Disclaimer | `src/pages/Disclaimer.tsx` |
| Cookie Policy | `src/pages/CookiePolicy.tsx` |

Each static page gets: `usePrerenderReady(true)` -- signals immediately since there's no data to wait for.

### 5. Already Handled (4 pages -- just need the hook fix)
- `Index.tsx` -- signals after jobs load
- `JobDetail.tsx` -- signals after job loads
- `BlogDetail.tsx` -- signals after blog loads
- `Blogs.tsx` -- signals after blogs load

These already call `usePrerenderReady` and will automatically work once the hook internals are updated.

## Summary of All Files

| File | Action | What Changes |
|------|--------|-------------|
| `src/hooks/usePrerenderReady.ts` | Modify | Set `window.prerenderReady = true` instead of dispatching event |
| `src/vite-env.d.ts` | Modify | Add `prerenderReady` to Window interface |
| `src/main.tsx` | Modify | Initialize `window.prerenderReady = false`, update fallback |
| `src/pages/About.tsx` | Modify | Add `usePrerenderReady(true)` |
| `src/pages/Advertise.tsx` | Modify | Add `usePrerenderReady(true)` |
| `src/pages/Contact.tsx` | Modify | Add `usePrerenderReady(true)` |
| `src/pages/PrivacyPolicy.tsx` | Modify | Add `usePrerenderReady(true)` |
| `src/pages/TermsConditions.tsx` | Modify | Add `usePrerenderReady(true)` |
| `src/pages/Disclaimer.tsx` | Modify | Add `usePrerenderReady(true)` |
| `src/pages/CookiePolicy.tsx` | Modify | Add `usePrerenderReady(true)` |
| `src/pages/Sitemap.tsx` | Modify | Add `usePrerenderReady(true)` |
| `src/pages/Resources.tsx` | Modify | Add `usePrerenderReady(!loadingFeatured)` |
| `src/pages/CareerGuides.tsx` | Modify | Add `usePrerenderReady(!isLoading)` |
| `src/pages/ResumeTemplates.tsx` | Modify | Add `usePrerenderReady(!isLoading)` |
| `src/pages/InterviewTips.tsx` | Modify | Add `usePrerenderReady(!isLoading)` |
| `src/pages/IndustryReports.tsx` | Modify | Add `usePrerenderReady(!isLoading)` |

**Total: 16 files modified, 0 new files, all 17 pages covered.**

## How It Works End-to-End

1. Netlify's Prerender extension intercepts requests from bots/crawlers
2. It opens the page in a headless browser
3. The browser loads React, fetches data from Supabase
4. When data is ready, the page sets `window.prerenderReady = true`
5. Netlify captures the fully-rendered HTML and serves it to the bot
6. Result is cached at Netlify's CDN for up to 3 days (or until next deploy)
7. Human visitors get the normal SPA experience -- no change for them

No UI/UX changes. No new dependencies. Just making every page properly signal readiness to Netlify's prerender system.
