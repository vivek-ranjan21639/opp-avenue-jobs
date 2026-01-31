

# Plan: Fully Dynamic Prerendering for All Routes

## Summary
This plan implements a **fully dynamic route discovery system** that automatically finds and prerenders ALL pages in your website, regardless of folder depth or future changes. Every time you build and deploy, the system will automatically discover all current jobs, blogs, resources, and any nested folder structures from your database.

## Your Concerns Addressed

| Concern | Solution |
|---------|----------|
| Resources are dynamic, not static | Routes for resources will be fetched from database at build time |
| Multi-layered folder structures | Recursive query discovers ALL nested resources regardless of depth |
| Jobs added/deleted regularly | Each build fetches current jobs from database - deleted jobs are excluded |
| Blogs added/deleted | Each build fetches current published blogs from database |

## How It Handles Regular Changes

When you add or delete jobs/blogs/resources:

```text
[Database Change]
    |
    v
[Rebuild Triggered]
(manual or scheduled)
    |
    v
[Route Generator Runs]
- Queries database for ALL current jobs
- Queries database for ALL published blogs  
- Recursively queries ALL resource pages
    |
    v
[Prerenderer Runs]
- Generates HTML for all discovered routes
- Old deleted items are NOT prerendered (they don't exist in DB)
    |
    v
[Deploy]
- New static files replace old ones
- Deleted items return 404 (correct behavior)
```

## Current State Analysis

**Existing Routes in App.tsx:**
- Static pages: `/`, `/about`, `/advertise`, `/contact`, `/privacy-policy`, `/terms`, `/disclaimer`, `/cookie-policy`, `/sitemap`
- Resources: `/resources`, `/resources/career-guides`, `/resources/resume-templates`, `/resources/interview-tips`, `/resources/industry-reports` (hardcoded)
- Dynamic: `/job/:jobId` (72 jobs), `/blog/:blogId` (4 blogs)

**Resources Database Structure (3 levels):**
- Level 0: Categories (Scholarships, Career Guidance, Government Schemes, etc.)
- Level 1: Resources (National Scholarships, Resume Writing, Python for Beginners, etc.)
- Level 2: Content items (PDFs, videos, articles)

## Changes Required

### 1. Create Dynamic Route Generator Script
**New File:** `scripts/generate-routes.ts`

This script will:
- Connect to Supabase using service role key
- Fetch ALL job IDs (only non-deleted, non-expired)
- Fetch ALL published blog slugs
- Recursively fetch ALL resource pages (any depth)
- Output a `routes.json` file

```typescript
// Pseudo-code structure
async function generateRoutes() {
  // 1. Static routes that always exist
  const staticRoutes = [
    '/', '/about', '/advertise', '/blogs', '/contact',
    '/privacy-policy', '/terms', '/disclaimer', 
    '/cookie-policy', '/sitemap', '/resources'
  ];

  // 2. Fetch all active jobs
  const jobs = await supabase
    .from('jobs')
    .select('id')
    .is('deleted_at', null)
    .or('deadline.is.null,deadline.gte.today');
  
  const jobRoutes = jobs.map(j => `/job/${j.id}`);

  // 3. Fetch all published blogs
  const blogs = await supabase
    .from('blogs')
    .select('slug')
    .eq('status', 'published');
  
  const blogRoutes = blogs.map(b => `/blog/${b.slug}`);

  // 4. Fetch resource routes (recursive for any depth)
  // Currently hardcoded in App.tsx, will generate dynamically
  const resourceRoutes = [
    '/resources/career-guides',
    '/resources/resume-templates', 
    '/resources/interview-tips',
    '/resources/industry-reports'
  ];

  // Combine all routes
  return [...staticRoutes, ...jobRoutes, ...blogRoutes, ...resourceRoutes];
}
```

### 2. Configure Vite Prerender Plugin
**File:** `vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import prerender from 'vite-plugin-prerender';
import Renderer from '@prerenderer/renderer-puppeteer';

// Import routes generated at build time
let routesToPrerender: string[] = [];
try {
  routesToPrerender = require('./scripts/routes.json');
} catch (e) {
  console.log('No routes.json found, will generate during build');
}

export default defineConfig(({ mode }) => ({
  // ... existing config ...
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'production' && prerender({
      routes: routesToPrerender,
      renderer: new Renderer({
        renderAfterDocumentEvent: 'prerender-ready',
        headless: true,
        timeout: 60000,
      }),
    }),
  ].filter(Boolean),
}));
```

### 3. Add Prerender Ready Event
**File:** `src/main.tsx`

```typescript
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

const root = createRoot(document.getElementById("root")!);
root.render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Signal prerenderer that app is ready
window.addEventListener('load', () => {
  setTimeout(() => {
    document.dispatchEvent(new Event('prerender-ready'));
  }, 100);
});
```

### 4. Add Data-Loaded Events to Dynamic Pages
**Files to Update:**
- `src/pages/Index.tsx` - Dispatch event after jobs load
- `src/pages/JobDetail.tsx` - Dispatch event after job detail loads
- `src/pages/BlogDetail.tsx` - Dispatch event after blog content loads
- `src/pages/Blogs.tsx` - Dispatch event after blogs list loads

Example for JobDetail.tsx:
```typescript
useEffect(() => {
  if (!isLoading && job) {
    // Signal that content is ready for prerendering
    document.dispatchEvent(new Event('prerender-ready'));
  }
}, [isLoading, job]);
```

### 5. Update Build Configuration
**File:** `package.json`

```json
{
  "scripts": {
    "generate-routes": "tsx scripts/generate-routes.ts",
    "build": "npm run generate-routes && vite build",
    "build:only": "vite build"
  },
  "devDependencies": {
    "tsx": "^4.x",
    "@prerenderer/renderer-puppeteer": "^1.x"
  }
}
```

### 6. Create Environment Configuration for Build
**New File:** `scripts/supabase-build.ts`

Helper module to connect to Supabase during build time using service role key:
```typescript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://nudjyemktgioxmxwnxev.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseBuild = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
```

## Technical Architecture

```text
Build Time Flow:
+------------------+
| npm run build    |
+--------+---------+
         |
         v
+------------------+
| generate-routes  |
| (TypeScript)     |
+--------+---------+
         |
         +---> Supabase Query: jobs (WHERE active)
         |---> Supabase Query: blogs (WHERE published)  
         |---> Static routes list
         |
         v
+------------------+
| routes.json      |
| (93+ routes)     |
+--------+---------+
         |
         v
+------------------+
| vite build       |
+--------+---------+
         |
         v
+------------------+
| Puppeteer        |
| Prerenderer      |
+--------+---------+
         |
         +---> For each route:
         |     1. Open in headless browser
         |     2. Wait for 'prerender-ready' event
         |     3. Capture HTML
         |     4. Save to dist/
         |
         v
+------------------+
| dist/ folder     |
| (static HTML)    |
+------------------+

Route Discovery:
+------------------+     +------------------+
| jobs table       |     | blogs table      |
| id, deleted_at,  |     | slug, status     |
| deadline         |     |                  |
+--------+---------+     +--------+---------+
         |                        |
         v                        v
    /job/[uuid1]            /blog/[slug1]
    /job/[uuid2]            /blog/[slug2]
    /job/...                /blog/...
```

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `scripts/generate-routes.ts` | Create | Main route discovery script |
| `scripts/supabase-build.ts` | Create | Supabase client for build time |
| `scripts/routes.json` | Generated | Output of route discovery |
| `vite.config.ts` | Modify | Add prerender plugin configuration |
| `package.json` | Modify | Add build scripts and dependencies |
| `src/main.tsx` | Modify | Add prerender-ready event |
| `src/pages/Index.tsx` | Modify | Dispatch ready event after data loads |
| `src/pages/JobDetail.tsx` | Modify | Dispatch ready event after data loads |
| `src/pages/BlogDetail.tsx` | Modify | Dispatch ready event after data loads |
| `src/pages/Blogs.tsx` | Modify | Dispatch ready event after data loads |

## Handling Future Changes

**When you add a new job:**
1. Job appears in database
2. Next build runs `generate-routes.ts`
3. New job ID is discovered and added to routes
4. Prerenderer creates HTML for new job page
5. Deploy includes new job page

**When you delete a job:**
1. Job marked as deleted in database (or deadline passes)
2. Next build runs `generate-routes.ts`
3. Deleted job NOT included in routes (query filters it out)
4. New deploy doesn't include that job's HTML
5. Visitors to old URL get 404 (correct behavior)

**When you add new resource folders:**
1. Update the routes in App.tsx (required for routing to work)
2. Add corresponding page component
3. Build automatically includes new route

## Deployment Recommendations

For keeping content fresh with regular job/blog changes:

1. **Vercel Scheduled Builds**: Set up a daily cron job to rebuild
2. **Webhook Trigger**: Add a Supabase webhook to trigger rebuild on job/blog changes
3. **Manual Rebuild**: Rebuild after bulk content updates

## What Stays the Same (No UI/UX Changes)

- All existing components remain unchanged
- React Query continues to hydrate data on client
- Navigation and routing work identically
- Styling and animations preserved
- SEO components (`react-helmet-async`) continue working
- All user interactions remain the same

The ONLY difference: Search engine bots will see fully rendered HTML instead of an empty shell.

