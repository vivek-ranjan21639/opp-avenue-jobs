import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import mammoth from "https://esm.sh/mammoth@1.8.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { mode, blog_id, file_path } = body;

    // Batch mode: process all new files in blog-docs bucket
    if (mode === "batch") {
      return await handleBatch(supabase);
    }

    // Single mode: process one specific blog
    if (!blog_id || !file_path) {
      return new Response(
        JSON.stringify({ error: "blog_id and file_path are required (or use mode: 'batch')" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await processFile(supabase, blog_id, file_path);
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${(err as Error).message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function processFile(supabase: any, blogId: string, filePath: string) {
  try {
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("blog-docs")
      .download(filePath);

    if (downloadError || !fileData) {
      const errMsg = `Failed to download file: ${downloadError?.message}`;
      await logProcessing(supabase, blogId, filePath, "error", errMsg);
      return { success: false, error: errMsg };
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const result = await mammoth.convertToHtml(
      { arrayBuffer },
      {
        styleMap: [
          "p[style-name='Title'] => h1:fresh",
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Heading 4'] => h4:fresh",
        ],
      }
    );

    const html = result.value;
    const warnings = result.messages;

    if (warnings.length > 0) {
      console.log("Mammoth conversion warnings:", warnings);
    }

    const { error: updateError } = await supabase
      .from("blogs")
      .update({ content: html })
      .eq("id", blogId);

    if (updateError) {
      const errMsg = `Failed to update blog: ${updateError.message}`;
      await logProcessing(supabase, blogId, filePath, "error", errMsg);
      return { success: false, error: errMsg };
    }

    await logProcessing(supabase, blogId, filePath, "success", null);
    return {
      success: true,
      message: "Blog content updated from DOCX",
      warnings: warnings.map((w: { message: string }) => w.message),
      html_length: html.length,
    };
  } catch (err) {
    const errMsg = (err as Error).message;
    await logProcessing(supabase, blogId, filePath, "error", errMsg);
    return { success: false, error: errMsg };
  }
}

async function handleBatch(supabase: any) {
  // List all files in blog-docs bucket
  const { data: files, error: listError } = await supabase.storage
    .from("blog-docs")
    .list("", { limit: 1000 });

  if (listError) {
    return new Response(
      JSON.stringify({ error: `Failed to list files: ${listError.message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get already-processed files
  const { data: processed } = await supabase
    .from("blog_processing_log")
    .select("file_path")
    .eq("status", "success");

  const processedPaths = new Set((processed || []).map((p: any) => p.file_path));

  // Filter to only DOCX files not yet processed
  const docxFiles = (files || []).filter(
    (f: any) => f.name?.endsWith(".docx") && !processedPaths.has(f.name)
  );

  // For each new file, try to match a blog by slug (filename without extension)
  const results = [];
  for (const file of docxFiles) {
    const slug = file.name.replace(".docx", "");
    const { data: blogs } = await supabase
      .from("blogs")
      .select("id")
      .eq("slug", slug)
      .limit(1);

    if (blogs && blogs.length > 0) {
      const result = await processFile(supabase, blogs[0].id, file.name);
      results.push({ file: file.name, blog_id: blogs[0].id, ...result });
    } else {
      results.push({ file: file.name, success: false, error: `No blog found with slug: ${slug}` });
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      total_files: files?.length || 0,
      already_processed: processedPaths.size,
      newly_processed: results.length,
      results,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function logProcessing(
  supabase: any,
  blogId: string,
  filePath: string,
  status: string,
  errorMessage: string | null
) {
  await supabase.from("blog_processing_log").upsert(
    {
      blog_id: blogId,
      file_path: filePath,
      status,
      error_message: errorMessage,
      processed_at: new Date().toISOString(),
    },
    { onConflict: "file_path" }
  );
}
