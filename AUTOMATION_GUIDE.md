# Automation Guide

Step-by-step instructions for using the automated pipelines for **Blogs**, **Resources**, and **Jobs**.

---

## Table of Contents

1. [Blog DOCX-to-HTML Conversion](#1-blog-docx-to-html-conversion)
2. [Resource DOCX-to-HTML Conversion](#2-resource-docx-to-html-conversion)
3. [Job Description (JD) Parsing & Staging](#3-job-description-jd-parsing--staging)
4. [Career Page Scraping](#4-career-page-scraping)
5. [Expired JD Cleanup](#5-expired-jd-cleanup)
6. [Scheduling (pg_cron)](#6-scheduling-pg_cron)

---

## 1. Blog DOCX-to-HTML Conversion

Converts Word documents into HTML and saves them as blog content.

### Prerequisites
- A blog row must exist in the `blogs` table with a `slug` matching the DOCX filename (e.g., `my-blog-post.docx` → slug `my-blog-post`).
- The blog's `status` should be `draft` until you're ready to publish.

### Steps

#### A. Upload the DOCX file
1. Go to **Supabase Dashboard → Storage → `blog-docs`** bucket.
2. Upload your `.docx` file (e.g., `my-blog-post.docx`).

#### B. Run the conversion (Single mode)
Invoke the edge function with a specific blog:

```bash
curl -X POST "https://nudjyemktgioxmxwnxev.supabase.co/functions/v1/convert-docx" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{ "blog_id": "<BLOG_UUID>", "file_path": "my-blog-post.docx" }'
```

#### C. Run the conversion (Batch mode)
Processes all new/unprocessed DOCX files in the `blog-docs` bucket:

```bash
curl -X POST "https://nudjyemktgioxmxwnxev.supabase.co/functions/v1/convert-docx" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{ "mode": "batch" }'
```

#### D. Verify
1. Check the `blogs` table — the `content` column should now contain the converted HTML.
2. Check `blog_processing_log` for the processing status.
3. Update the blog `status` to `published` when ready.

#### Troubleshooting
- If a file is skipped in batch mode, it's already in `blog_processing_log`. Delete the log entry to reprocess.
- Filename must match the blog's `slug` exactly (minus the `.docx` extension).

---

## 2. Resource DOCX-to-HTML Conversion

Converts Word documents into HTML for resource pages (Career Guides, Resume Templates, Interview Tips, Industry Reports).

### Prerequisites
- A resource row must exist in the `resources` table.
- The resource's `doc_file_path` column must be set to the storage path (e.g., `career-guides/getting-started.docx`).

### Steps

#### A. Upload the DOCX file
1. Go to **Supabase Dashboard → Storage → `resource-docs`** bucket.
2. Navigate to the appropriate folder:
   - `career-guides/`
   - `resume-templates/`
   - `interview-tips/`
   - `industry-reports/`
3. Upload your `.docx` file.

#### B. Set the `doc_file_path` on the resource
1. Go to **Supabase Dashboard → Table Editor → `resources`**.
2. Find or create the resource row.
3. Set `doc_file_path` to the file's path within the bucket (e.g., `career-guides/getting-started.docx`).

#### C. Run the conversion (Single mode)

```bash
curl -X POST "https://nudjyemktgioxmxwnxev.supabase.co/functions/v1/convert-resource-doc" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{ "resource_id": "<RESOURCE_UUID>", "file_path": "career-guides/getting-started.docx" }'
```

#### D. Run the conversion (Batch mode)

```bash
curl -X POST "https://nudjyemktgioxmxwnxev.supabase.co/functions/v1/convert-resource-doc" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{ "mode": "batch" }'
```

#### E. For downloadable resources (Templates, Reports)
1. Upload the downloadable file (PDF/DOCX) to **Storage → `resource-files`** bucket in the matching folder.
2. Set `file_url` on the resource row to the public URL:
   ```
   https://nudjyemktgioxmxwnxev.supabase.co/storage/v1/object/public/resource-files/{folder}/{filename}
   ```

#### F. Verify
1. Check `resources.content_text` — should contain converted HTML.
2. Check `resource_processing_log` for status.
3. Visit the resource page on the frontend to confirm rendering.

---

## 3. Job Description (JD) Parsing & Staging

A two-stage pipeline: **Parse** DOCX → `staging_jobs` → **Approve** → live `jobs` table.

### Prerequisites
- DOCX files should follow a structured format with clearly labeled sections (see template below).

### DOCX Template Format

Your JD Word document should contain these headings/sections:

```
Company: Acme Corp
Title: Senior Software Engineer
Location: Mumbai, Maharashtra, India
Work Mode: Remote
Job Type: Full-time
Salary Min: 1200000
Salary Max: 2000000
Currency: INR
Deadline: 2026-06-30
Vacancies: 3
Application Link: https://acme.com/apply
Application Email: jobs@acme.com

Description:
We are looking for a Senior Software Engineer to join our team...

Responsibilities:
- Design and develop scalable systems
- Collaborate with cross-functional teams
- Mentor junior engineers

Qualifications:
- B.Tech in Computer Science or equivalent
- 5+ years of experience
- Strong problem-solving skills

Skills: Python, AWS, Docker, Kubernetes, PostgreSQL
Domains: Technology, Cloud Computing
Benefits: Health Insurance, Stock Options, Remote Work

Eligibility:
- Min Experience: 5
- Max Experience: 10
- Education Level: Bachelor's
- Age Limit: 40

Culture Points:
- Innovation-driven environment
- Flat hierarchy
- Work-life balance focus
```

### Steps

#### A. Upload the JD file
1. Go to **Supabase Dashboard → Storage → `JDs`** bucket.
2. Navigate to the `pending/` folder.
3. Upload your `.docx` file.

#### B. Parse the JD

```bash
curl -X POST "https://nudjyemktgioxmxwnxev.supabase.co/functions/v1/parse-jd" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

This will:
- Scan `JDs/pending/` for new files not yet in `jd_processing_log`
- Parse each DOCX and extract structured data
- Insert into `staging_jobs` with `review_status = 'pending_review'`
- Move the file to `JDs/processed/`
- Log the result in `jd_processing_log`

#### C. Review staging jobs
1. Go to **Supabase Dashboard → Table Editor → `staging_jobs`**.
2. Review the parsed data:
   - `title`, `parsed_company_name`, `description`
   - `parsed_locations`, `parsed_skills`, `parsed_domains` (JSON arrays)
   - `parsed_benefits`, `parsed_culture_points`, `parsed_eligibility`
   - `salary_min`, `salary_max`, `currency`, `work_mode`, `job_type`
3. Edit any incorrect values directly in the table editor.
4. Optionally add `review_notes`.

#### D. Approve the staging job

```bash
curl -X POST "https://nudjyemktgioxmxwnxev.supabase.co/functions/v1/approve-staging-job" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{ "staging_job_id": "<STAGING_JOB_UUID>" }'
```

This will:
1. **Company** — Find existing by name or create new in `companies`
2. **Job** — Insert into `jobs` with the resolved `company_id`
3. **Locations** — Find or create each location in `locations`, link via `job_locations`
4. **Skills** — Find or create each skill in `skills`, link via `job_skills`
5. **Domains** — Find or create each domain in `domains`, link via `job_domains`
6. **Benefits** — Find or create each benefit in `benefits`, link via `job_benefits`
7. **Eligibility** — Insert into `eligibility_criteria`
8. **Culture** — Insert points into `company_culture`
9. Update `staging_jobs.review_status` to `approved`

#### E. Reject a staging job
Manually set `review_status` to `rejected` in the `staging_jobs` table.

#### F. Verify
1. Check the `jobs` table for the new live listing.
2. Check related tables (`job_skills`, `job_locations`, etc.) for the linked data.
3. Visit the frontend to confirm the job appears.

---

## 4. Career Page Scraping

Automatically discovers new job listings from company career pages.

### Prerequisites
- Companies must have `career_page_url` set in the `companies` table.

### Steps

#### A. Set career page URLs
1. Go to **Supabase Dashboard → Table Editor → `companies`**.
2. For each company, set the `career_page_url` to their careers/jobs page (e.g., `https://acme.com/careers`).

#### B. Run the scraper

```bash
curl -X POST "https://nudjyemktgioxmxwnxev.supabase.co/functions/v1/scrape-careers" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

This will:
- Fetch each company's career page HTML using native `fetch`
- Extract all links and filter for job-related URLs (containing `/job`, `/career`, `/position`, `/opening`, `/apply`, `/vacancy`)
- Check against existing `scraped_jobs` to avoid duplicates
- Insert new entries with `status = 'pending'`

#### C. Review scraped jobs
1. Go to **Table Editor → `scraped_jobs`**.
2. Review entries with `status = 'pending'`.
3. For promising listings, change `status` to `approved`.
4. For irrelevant entries, change `status` to `rejected`.

#### D. Process approved scraped jobs
Approved scraped jobs can be linked to the JD pipeline:
1. Manually create a staging job entry, or
2. Download the job page content and create a DOCX for the parse-jd pipeline.

### Limitations
- Only works on server-rendered career pages (not heavy JS/SPA sites like some Greenhouse or Lever embeds).
- Link detection uses URL heuristics — some false positives/negatives are expected.

---

## 5. Expired JD Cleanup

Automatically removes stored JD files for expired job listings.

### What it does
- Finds jobs where `deadline < today` and `jd_file_url IS NOT NULL`
- Deletes the corresponding files from the `JDs` storage bucket
- Sets `jd_file_url` to `NULL` on the job
- Cleans up related `jd_processing_log` entries

### Run manually

```bash
curl -X POST "https://nudjyemktgioxmxwnxev.supabase.co/functions/v1/cleanup-expired-jds" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 6. Scheduling (pg_cron)

Set up automated daily runs using Supabase pg_cron. Run these SQL commands in the **SQL Editor**:

```sql
-- Daily career page scraping (runs at 2:00 AM UTC)
SELECT cron.schedule(
  'daily-scrape-careers',
  '0 2 * * *',
  $$SELECT net.http_post(
    'https://nudjyemktgioxmxwnxev.supabase.co/functions/v1/scrape-careers',
    '{}',
    'application/json',
    ARRAY[
      ('Authorization', 'Bearer <SERVICE_ROLE_KEY>')::net.http_header
    ]
  )$$
);

-- Daily expired JD cleanup (runs at 3:00 AM UTC)
SELECT cron.schedule(
  'daily-cleanup-expired-jds',
  '0 3 * * *',
  $$SELECT net.http_post(
    'https://nudjyemktgioxmxwnxev.supabase.co/functions/v1/cleanup-expired-jds',
    '{}',
    'application/json',
    ARRAY[
      ('Authorization', 'Bearer <SERVICE_ROLE_KEY>')::net.http_header
    ]
  )$$
);

-- Daily batch blog conversion (runs at 4:00 AM UTC)
SELECT cron.schedule(
  'daily-convert-blogs',
  '0 4 * * *',
  $$SELECT net.http_post(
    'https://nudjyemktgioxmxwnxev.supabase.co/functions/v1/convert-docx',
    '{"mode":"batch"}',
    'application/json',
    ARRAY[
      ('Authorization', 'Bearer <SERVICE_ROLE_KEY>')::net.http_header
    ]
  )$$
);

-- Daily batch resource conversion (runs at 4:30 AM UTC)
SELECT cron.schedule(
  'daily-convert-resources',
  '30 4 * * *',
  $$SELECT net.http_post(
    'https://nudjyemktgioxmxwnxev.supabase.co/functions/v1/convert-resource-doc',
    '{"mode":"batch"}',
    'application/json',
    ARRAY[
      ('Authorization', 'Bearer <SERVICE_ROLE_KEY>')::net.http_header
    ]
  )$$
);

-- Daily expired job deletion (runs at 5:00 AM UTC)
SELECT cron.schedule(
  'daily-delete-expired-jobs',
  '0 5 * * *',
  $$SELECT public.delete_expired_jobs()$$
);
```

> **Note:** Replace `<SERVICE_ROLE_KEY>` with your actual Supabase service role key. You can find it in **Supabase Dashboard → Settings → API**.

### View scheduled jobs

```sql
SELECT * FROM cron.job;
```

### Remove a scheduled job

```sql
SELECT cron.unschedule('daily-scrape-careers');
```

---

## Quick Reference

| Pipeline | Storage Bucket | Edge Function | Log Table |
|---|---|---|---|
| Blog Conversion | `blog-docs` | `convert-docx` | `blog_processing_log` |
| Resource Conversion | `resource-docs` | `convert-resource-doc` | `resource_processing_log` |
| JD Parsing | `JDs/pending/` → `JDs/processed/` | `parse-jd` | `jd_processing_log` |
| JD Approval | — | `approve-staging-job` | — |
| Career Scraping | — | `scrape-careers` | `scraped_jobs` |
| Expired JD Cleanup | `JDs` | `cleanup-expired-jds` | — |
| Downloadable Resources | `resource-files` (public) | — | — |
