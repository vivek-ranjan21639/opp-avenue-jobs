# Vercel Prerendering Implementation Plan

## Overview
Implement static site generation (SSG) with prerendering for improved SEO and performance on Vercel deployment.

---

## Phase 1: Foundation Setup

### 1.1 Install Dependencies
- `react-helmet-async` - Dynamic meta tag management
- `vite-plugin-prerender` - Static HTML generation at build time

### 1.2 Configure Helmet Provider
- Wrap app with `HelmetProvider` in `main.tsx`
- Create reusable `SEO` component for consistent meta tag management

---

## Phase 2: SEO Meta Tags Implementation

### 2.1 Create SEO Component (`src/components/SEO.tsx`)
- Title, description, canonical URL
- Open Graph tags (og:title, og:description, og:image, og:url)
- Twitter Card tags
- JSON-LD structured data support

### 2.2 Add SEO to All Pages
| Page | Title | Structured Data |
|------|-------|-----------------|
| Index | "Find Your Dream Job - JobPortal" | WebSite schema |
| JobDetail | "{Job Title} at {Company}" | JobPosting schema |
| BlogDetail | "{Blog Title}" | BlogPosting schema |
| Blogs | "Career Blog & Insights" | Blog schema |
| About | "About Us" | Organization schema |
| Contact | "Contact Us" | ContactPage schema |
| Resources | "Career Resources" | CollectionPage schema |
| All others | Appropriate titles | Basic meta tags |

---

## Phase 3: Structured Data (JSON-LD)

### 3.1 Schema Types to Implement
- **WebSite** - Homepage with search action
- **JobPosting** - Individual job pages (required for Google Jobs)
- **BlogPosting** - Individual blog posts
- **Organization** - About page
- **BreadcrumbList** - Navigation breadcrumbs

### 3.2 Create JSON-LD Components
- `src/components/seo/WebsiteSchema.tsx`
- `src/components/seo/JobPostingSchema.tsx`
- `src/components/seo/BlogPostingSchema.tsx`
- `src/components/seo/OrganizationSchema.tsx`

---

## Phase 4: Sitemap & Robots.txt

### 4.1 Dynamic XML Sitemap
- Create build script to generate `sitemap.xml`
- Include all static routes
- Fetch and include all job/blog URLs from Supabase
- Add lastmod dates

### 4.2 Update robots.txt
- Add sitemap reference
- Configure crawl directives

---

## Phase 5: Vite Prerender Configuration

### 5.1 Configure vite-plugin-prerender
- Define static routes for prerendering
- Configure renderer options (headless Chrome)
- Set up post-process hooks for HTML optimization

### 5.2 Static Routes to Prerender
```
/, /blogs, /about, /contact, /resources, 
/career-guides, /resume-templates, /interview-tips,
/industry-reports, /advertise, /privacy-policy,
/terms-conditions, /cookie-policy, /disclaimer, /sitemap
```

---

## Phase 6: Vercel Configuration

### 6.1 Create vercel.json
- Configure rewrites for SPA fallback
- Set caching headers for static assets
- Configure build output

### 6.2 Build Script Updates
- Add sitemap generation to build process
- Configure environment for prerendering

---

## Phase 7: Performance Optimizations

### 7.1 Critical Resource Hints
- Add preconnect for Supabase API
- Preload critical fonts/assets
- Configure resource priorities

### 7.2 Image Optimization
- Ensure all images have alt attributes
- Add loading="lazy" for below-fold images
- Add width/height to prevent CLS

---

## Files to Create/Modify

### New Files:
- `src/components/SEO.tsx` - Main SEO component
- `src/components/seo/WebsiteSchema.tsx`
- `src/components/seo/JobPostingSchema.tsx`
- `src/components/seo/BlogPostingSchema.tsx`
- `src/components/seo/OrganizationSchema.tsx`
- `scripts/generate-sitemap.mjs` - Sitemap generator
- `vercel.json` - Vercel configuration

### Modified Files:
- `src/main.tsx` - Add HelmetProvider
- `index.html` - Add preconnect hints
- `vite.config.ts` - Add prerender plugin
- `package.json` - Add build scripts
- `public/robots.txt` - Add sitemap reference
- All pages in `src/pages/` - Add SEO component

---

## Implementation Order
1. Install dependencies
2. Create SEO component and schemas
3. Update main.tsx with HelmetProvider
4. Add SEO to all pages
5. Create sitemap generator script
6. Update robots.txt
7. Configure Vite prerendering
8. Create vercel.json
9. Update index.html with resource hints
10. Test and verify

---

## Limitations & Notes
- Dynamic routes (job/blog details) require ISR or on-demand regeneration for fresh data
- Build time increases with more prerendered pages
- Supabase connection required during build for sitemap generation
