

## Comprehensive Automation Plan (Updated)

This is the full consolidated plan covering all automation: resources, blogs, JD parsing, scraping, cleanup, and schema organization.

---

### A. Resource Storage & DOCX-to-HTML Conversion

**Current state**: The `resources` table has `content_text` (rendered as plain text), `file_url`, `video_url`, `external_url`. Resource types: `category`, `resource`, `content`. Four sub-pages exist: career-guides, resume-templates, interview-tips, industry-reports. No storage bucket for resource documents exists yet.

**Storage bucket: `resource-docs` (private)**

Folder structure mirrors the four resource categories:

```text
resource-docs/
├── career-guides/       ← DOCX guides to convert to HTML
├── resume-templates/    ← DOCX templates (convert to HTML for preview + keep file_url for download)
├── interview-tips/      ← DOCX articles (convert to HTML)
└── industry-reports/    ← DOCX reports (convert to HTML for preview + keep file_url for download)
```

**New table: `resource_processing_log`**
- Columns: `id` (uuid PK), `resource_id` (FK → resources), `file_path` (text, unique), `processed_at` (timestamptz), `status` (text: success/error), `error_message` (text nullable)
- Tracks which DOCX files have been converted, so only new files are processed on each run.

**New edge function: `convert-resource-doc`**
- Two modes:
  - **Single**: `{ resource_id, file_path }` — converts one DOCX, stores HTML in `resources.content_text`
  - **Batch**: `{ mode: "batch" }` — lists all files in `resource-docs/`, checks `resource_processing_log`, processes only new files
- Matching: filename convention maps to resource (e.g., filename slug matches resource title or an explicit `doc_file_path` column added to `resources`)
- Uses mammoth.js (same as blog conversion)
- Logs every processed file in `resource_processing_log`

**Frontend change**: Resource sub-pages currently render `content_text` as plain text (`<p>{guide.content_text}</p>`). Update all four pages to render it as HTML using `dangerouslySetInnerHTML` so converted DOCX content displays with proper formatting (headings, lists, bold, etc.). This also makes the content SEO-indexable since it's inline HTML in the DOM.

**Add `doc_file_path` column to `resources` table**: Optional text column to explicitly link a resource to its DOCX file in `resource-docs/`. Used by batch mode to match files to resources.

**Resource upload workflow**:
1. Upload DOCX to `resource-docs/{category-folder}/{filename}.docx`
2. Create a row in `resources` table with `doc_file_path` set to the storage path
3. Run `convert-resource-doc` (batch or single) — only new/unprocessed files are converted
4. For downloadable resources (templates, reports), also upload the final file to a **public** `resource-files` bucket and set `file_url` to the public URL
5. For videos, set `video_url` directly; for external links, set `external_url`

**Second storage bucket: `resource-files` (public)**
- For downloadable files users can access (PDFs, DOCX templates)
- Public URL pattern: `https://nudjyemktgioxmxwnxev.supabase.co/storage/v1/object/public/resource-files/{folder}/{filename}`

```text
resource-files/
├── resume-templates/    ← downloadable template files (PDF/DOCX)
└── industry-reports/    ← downloadable report files (PDF)
```

---

### B. Incremental Blog DOCX Conversion

**New table: `blog_processing_log`**
- Columns: `id`, `blog_id` (FK → blogs), `file_path` (unique), `processed_at`, `status`, `error_message`

**Update `convert-docx` edge function**: Add batch mode `{ mode: "batch" }` that lists `blog-docs` bucket, checks `blog_processing_log`, processes only new files. Existing single-blog mode unchanged.

---

### C. Automated Career Page Scraping

**Add `career_page_url` column to `companies`** (text, nullable).

**New table: `scraped_jobs`**
- Columns: `id`, `company_id` (FK), `source_url` (text), `title` (text), `file_path` (text nullable), `status` (enum: pending/approved/rejected), `raw_content` (text), `scraped_at` (timestamptz), `approved_at` (timestamptz nullable), `created_at` (timestamptz default now())
- Unique constraint on `(company_id, source_url)`

**New edge function: `scrape-careers`**
- Uses Firecrawl to scrape each company's `career_page_url`
- Compares against `scraped_jobs` by `source_url + company_id`
- Inserts new listings with `status = 'pending'`
- Scheduled daily via `pg_cron`

---

### D. JD Parsing with Staging Review

**New table: `staging_jobs`**
- Mirrors `jobs` columns plus: `source_scraped_job_id` (FK nullable), `file_path`, `parsed_company_name`, `parsed_locations` (jsonb), `parsed_skills` (jsonb), `parsed_domains` (jsonb), `parsed_benefits` (jsonb), `parsed_culture_points` (jsonb), `parsed_eligibility` (jsonb), `review_status` (enum: pending_review/approved/rejected), `review_notes`, `created_at`, `approved_at`

**New table: `jd_processing_log`**
- Columns: `id`, `file_path` (unique), `staging_job_id` (FK nullable), `processed_at`, `status`, `error_message`

**Storage: JDs bucket folders**
```text
JDs/
├── pending/     ← new uploads awaiting parse
└── processed/   ← parsed files (moved after processing)
```

**New edge function: `parse-jd`**
- Lists `JDs/pending/`, skips files in `jd_processing_log`
- Parses structured DOCX headings (Company, Title, Location, Skills, Domains, Benefits, etc.)
- Inserts into `staging_jobs` (NOT live `jobs` table)
- Moves file to `processed/`, logs in `jd_processing_log`

**New edge function: `approve-staging-job`**
- For each approved staging job, performs intelligent upsert:
  1. Company — find or create in `companies`
  2. Locations — find or create each in `locations`, link via `job_locations`
  3. Skills — find or create each in `skills`, link via `job_skills`
  4. Domains — find or create each in `domains`, link via `job_domains`
  5. Benefits — find or create each in `benefits`, link via `job_benefits`
  6. Insert into `jobs` with resolved `company_id`
  7. Insert `eligibility_criteria`
  8. Insert `company_culture` points
  9. Create all junction table rows

**Two-stage review**:
```text
DOCX upload → parse-jd → staging_jobs (pending_review)
                              ↓ admin reviews
                     approve-staging-job → jobs + all related tables (live)
```

---

### E. Expired JD Cleanup

**New edge function: `cleanup-expired-jds`**
- Queries jobs where `deadline < CURRENT_DATE` and `jd_file_url IS NOT NULL`
- Deletes files from `JDs` bucket, nullifies `jd_file_url`
- Clears `jd_processing_log` entries
- Runs daily via `pg_cron` before `delete_expired_jobs()`

---

### F. Database Schema Organization

Add SQL comments to every table with group prefixes:

```text
[JOBS]       — jobs, companies, company_culture, locations, skills, domains,
               benefits, eligibility_criteria, job_locations, job_skills,
               job_domains, job_benefits, staging_jobs, scraped_jobs,
               jd_processing_log
[BLOGS]      — blogs, authors, tags, blog_tags, blog_processing_log
[RESOURCES]  — resources, resource_processing_log
[SITE]       — featured_content, static_routes
```

Create `DATABASE_SCHEMA.md` in project root with full table diagram.

---

### Implementation Order

1. **Migration 1**: Table comments on all existing tables
2. **Migration 2**: Create `resource_processing_log`, `blog_processing_log`, `staging_jobs`, `scraped_jobs`, `jd_processing_log`. Add `career_page_url` to `companies`. Add `doc_file_path` to `resources`. Create `resource-docs` and `resource-files` storage buckets with RLS policies.
3. **Edge function**: `convert-resource-doc` (DOCX → HTML for resources, batch + single mode)
4. **Frontend**: Update CareerGuides, ResumeTemplates, InterviewTips, IndustryReports to render `content_text` as HTML
5. **Edge function**: Update `convert-docx` with batch mode + `blog_processing_log`
6. **Edge function**: `parse-jd` (DOCX → staging_jobs)
7. **Edge function**: `approve-staging-job` (staging → live tables with intelligent upsert)
8. **Edge function**: `scrape-careers` (requires Firecrawl connector)
9. **Edge function**: `cleanup-expired-jds`
10. **Create**: `DATABASE_SCHEMA.md`
11. **Scheduling**: `pg_cron` jobs for daily scrape-careers, cleanup-expired-jds, batch convert-docx, batch convert-resource-doc

### Prerequisites

- Firecrawl connector for career page scraping
- Companies need `career_page_url` populated
- Consistent DOCX template for JDs
- Resource DOCX files uploaded with matching `doc_file_path` in the resources table

