

## Plan: DOCX-to-HTML Blog Upload Pipeline

### How It Works

You upload a `.docx` file to a Supabase Storage bucket. A Supabase Edge Function receives the file, converts it to HTML using the **mammoth** library, and stores the resulting HTML in the blog's `content` column. This way you write blogs in Word and the system handles conversion automatically.

### Architecture

```text
Upload DOCX → Supabase Storage (blog-docs bucket)
                    ↓
         Edge Function "convert-docx"
           (mammoth.js: DOCX → HTML)
                    ↓
         UPDATE blogs SET content = <html>
```

### Implementation Steps

1. **Create a `blog-docs` storage bucket** (public: false) via SQL migration for uploading DOCX files.

2. **Create edge function `convert-docx`**
   - Accepts `{ blog_id, file_path }` in the request body
   - Downloads the DOCX from Storage using the service role key
   - Converts to HTML using `mammoth` (npm library, works in Deno)
   - Updates `blogs.content` with the generated HTML
   - Returns success/error response

3. **No frontend changes needed for blog rendering** — the existing `BlogDetail.tsx` already renders HTML content with DOMPurify sanitization and rich media support.

### Technical Details

- **mammoth.js** is the standard DOCX→HTML converter. It preserves headings, lists, bold/italic, links, tables, and images. Images embedded in the DOCX are extracted as base64 data URIs in the HTML.
- The edge function uses `SUPABASE_SERVICE_ROLE_KEY` to read from storage and update the blogs table, bypassing RLS.
- Blog authors upload DOCX via Supabase Dashboard (Storage → blog-docs) or any admin interface, then call the edge function with the blog ID and file path.

### Limitations to Be Aware Of

- Complex Word formatting (custom fonts, colors, text boxes) may not convert perfectly — mammoth focuses on semantic HTML.
- Embedded images become base64 data URIs, which increases HTML size. A future enhancement could upload images to storage separately.

