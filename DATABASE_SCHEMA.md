# Database Schema Organization

All tables reside in the `public` schema. Each table has a SQL comment prefixed with a group tag (`[JOBS]`, `[BLOGS]`, `[RESOURCES]`, `[SITE]`) visible in the Supabase dashboard.

---

## 📋 Table Groups

### [JOBS] — Job Listings & Related Data

```
┌─────────────────────┐     ┌──────────────────┐
│       jobs          │────▶│    companies      │
│  (main listings)    │     │  (employers)      │
└─────┬───┬───┬───┬───┘     └────────┬──────────┘
      │   │   │   │                  │
      │   │   │   │         ┌────────▼──────────┐
      │   │   │   │         │  company_culture   │
      │   │   │   │         │  (culture points)  │
      │   │   │   │         └───────────────────┘
      │   │   │   │
      │   │   │   └──────▶ eligibility_criteria
      │   │   │
      │   │   └─── job_locations ──▶ locations
      │   └─────── job_skills ─────▶ skills
      │   └─────── job_domains ────▶ domains
      └─────────── job_benefits ───▶ benefits

┌─────────────────────┐     ┌──────────────────┐
│   staging_jobs      │     │   scraped_jobs    │
│  (pending review)   │     │  (from scraping)  │
└─────────────────────┘     └──────────────────┘

┌─────────────────────┐
│  jd_processing_log  │
│  (parsed JD files)  │
└─────────────────────┘
```

| Table | Description |
|-------|-------------|
| `jobs` | Main job listings with title, description, salary, type, mode |
| `companies` | Employers posting jobs (name, sector, logo, career_page_url) |
| `company_culture` | Culture bullet points per company |
| `locations` | City/state/country records |
| `skills` | Skill names with optional category |
| `domains` | Job domains/sectors |
| `benefits` | Job benefit names |
| `eligibility_criteria` | Experience, education, age requirements per job |
| `job_locations` | Junction: jobs ↔ locations |
| `job_skills` | Junction: jobs ↔ skills |
| `job_domains` | Junction: jobs ↔ domains |
| `job_benefits` | Junction: jobs ↔ benefits |
| `staging_jobs` | Parsed JDs awaiting admin approval before going live |
| `scraped_jobs` | Career page listings discovered by scraping |
| `jd_processing_log` | Tracks which JD DOCX files have been parsed |

---

### [BLOGS] — Blog Content

```
┌─────────────────────┐     ┌──────────────────┐
│       blogs         │────▶│     authors       │
│  (blog posts)       │     │  (writers)        │
└─────────┬───────────┘     └──────────────────┘
          │
          └─── blog_tags ──▶ tags

┌─────────────────────┐
│ blog_processing_log │
│ (converted DOCX)    │
└─────────────────────┘
```

| Table | Description |
|-------|-------------|
| `blogs` | Blog posts with title, slug, content (HTML), status, featured flag |
| `authors` | Blog authors with name, bio, profile URL |
| `tags` | Tag names for blog categorization |
| `blog_tags` | Junction: blogs ↔ tags |
| `blog_processing_log` | Tracks which blog DOCX files have been converted |

---

### [RESOURCES] — Career Resources

```
┌─────────────────────┐
│     resources       │──── (self-referencing via parent_id)
│  (guides, templates,│
│   tips, reports)    │
└─────────────────────┘

┌──────────────────────────┐
│ resource_processing_log  │
│ (converted resource DOCX)│
└──────────────────────────┘
```

| Table | Description |
|-------|-------------|
| `resources` | Career guides, resume templates, interview tips, industry reports. Types: category, resource, content. Has content_text (HTML), file_url, video_url, external_url, doc_file_path |
| `resource_processing_log` | Tracks which resource DOCX files have been converted |

---

### [SITE] — Site-Wide Configuration

| Table | Description |
|-------|-------------|
| `featured_content` | Featured carousel/banner items (linked to jobs or custom URLs) |
| `static_routes` | Static routes for sitemap generation |

---

## 🪣 Storage Buckets

| Bucket | Public | Purpose |
|--------|--------|---------|
| `JDs` | No | Job description DOCX files (`pending/` and `processed/` folders) |
| `blog-docs` | No | Blog post DOCX files |
| `resource-docs` | No | Resource DOCX files (career-guides/, resume-templates/, interview-tips/, industry-reports/) |
| `resource-files` | Yes | Downloadable resource files (PDFs, templates) |

---

## ⚡ Edge Functions

| Function | Purpose |
|----------|---------|
| `convert-docx` | Converts blog DOCX → HTML (single + batch mode) |
| `convert-resource-doc` | Converts resource DOCX → HTML (single + batch mode) |
| `parse-jd` | Parses JD DOCX files into staging_jobs |
| `approve-staging-job` | Moves approved staging jobs to live tables with intelligent upsert |
| `cleanup-expired-jds` | Deletes JD files for expired jobs |
| `scrape-careers` | Scrapes company career pages (requires Firecrawl) |
| `prerender` | Server-side rendering for SEO bots |
| `sitemap` | Dynamic sitemap generation |

---

## 🔑 Key Conventions

- **Human IDs**: Companies (COMP-00001), Jobs (JOB-00001), Skills (SKL-00001), etc. — auto-generated via triggers
- **RLS**: Public read for active content, admin-only write (admin UUID: `240f1361-...`)
- **Soft delete**: Jobs use `deleted_at` column; expired jobs cleaned by `delete_expired_jobs()` + `cleanup-expired-jds`
- **Full-text search**: Jobs have `search_vector` (tsvector) with GIN index
