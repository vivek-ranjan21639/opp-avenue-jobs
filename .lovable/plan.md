

# Auto-Prerendering for New Pages

## Problem
Every new page requires manually importing and calling `usePrerenderReady`. If you forget, that page won't signal Netlify's prerender extension properly.

## Solution
Create a **Layout wrapper component** that automatically calls `usePrerenderReady(true)` for any page it wraps. Pages with async data can override this by calling the hook themselves (the hook already has a guard to only signal once).

## Changes

### 1. Create `src/components/PageLayout.tsx`
A new layout component that:
- Wraps page content with Header and Footer (which every page already uses)
- Calls `usePrerenderReady(true)` by default (for static pages)
- Accepts an optional `prerenderReady` prop so dynamic pages can control timing (e.g., `prerenderReady={!isLoading}`)

### 2. Update `src/hooks/usePrerenderReady.ts`
Ensure the hook resets `window.prerenderReady = false` on route changes so each page navigation gets a fresh signal. This is important for SPA navigation where Netlify re-renders on new URLs.

### 3. Refactor all 17 existing pages
Replace the repeated Header/Footer/usePrerenderReady boilerplate with `<PageLayout>`. For example:

**Static page (About):**
```tsx
// Before
usePrerenderReady(true);
return (<><Header .../><main>...</main><Footer/></>);

// After
return (<PageLayout><main>...</main></PageLayout>);
```

**Dynamic page (Index):**
```tsx
// Before
usePrerenderReady(!isLoading);
return (<><Header .../><main>...</main><Footer/></>);

// After
return (<PageLayout prerenderReady={!isLoading}><main>...</main></PageLayout>);
```

### 4. Add to `static_routes` table
As a reminder/checklist: whenever you create a new page, also insert a row into the `static_routes` table in Supabase so it appears in the XML sitemap.

## Checklist for Adding a New Page (After This Change)

1. Create the page component in `src/pages/`
2. Wrap content in `<PageLayout>` (prerendering handled automatically)
3. If the page fetches data, pass `prerenderReady={!isLoading}`
4. Add the route to `App.tsx`
5. Add a row to the `static_routes` table in Supabase for the sitemap

## Files Summary

| File | Action |
|------|--------|
| `src/components/PageLayout.tsx` | Create -- shared layout with auto prerender signal |
| `src/hooks/usePrerenderReady.ts` | Minor update -- ensure single-signal guard works across navigations |
| All 17 page files | Refactor -- use `PageLayout` instead of manual Header/Footer/usePrerenderReady |

## Benefit
New pages are prerender-ready by default just by using `<PageLayout>`. No extra imports or hooks to remember.
