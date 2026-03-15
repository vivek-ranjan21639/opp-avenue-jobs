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
    const { mode, resource_id, file_path } = body;

    if (mode === "batch") {
      return await handleBatch(supabase);
    }

    if (!resource_id || !file_path) {
      return new Response(
        JSON.stringify({ error: "resource_id and file_path are required (or use mode: 'batch')" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await processFile(supabase, resource_id, file_path);
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

async function processFile(supabase: any, resourceId: string, filePath: string) {
  try {
    // Download DOCX from resource-docs bucket
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("resource-docs")
      .download(filePath);

    if (downloadError || !fileData) {
      const errMsg = `Failed to download: ${downloadError?.message}`;
      await logProcessing(supabase, resourceId, filePath, "error", errMsg);
      return { success: false, error: errMsg };
    }

    // Convert DOCX to HTML
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

    // Update resource content_text with HTML
    const { error: updateError } = await supabase
      .from("resources")
      .update({ content_text: html })
      .eq("id", resourceId);

    if (updateError) {
      const errMsg = `Failed to update resource: ${updateError.message}`;
      await logProcessing(supabase, resourceId, filePath, "error", errMsg);
      return { success: false, error: errMsg };
    }

    await logProcessing(supabase, resourceId, filePath, "success", null);
    return {
      success: true,
      message: "Resource content updated from DOCX",
      html_length: html.length,
      warnings: result.messages.map((w: { message: string }) => w.message),
    };
  } catch (err) {
    const errMsg = (err as Error).message;
    await logProcessing(supabase, resourceId, filePath, "error", errMsg);
    return { success: false, error: errMsg };
  }
}

async function handleBatch(supabase: any) {
  // Get all resources with doc_file_path set
  const { data: resources, error: resErr } = await supabase
    .from("resources")
    .select("id, doc_file_path")
    .not("doc_file_path", "is", null);

  if (resErr) {
    return new Response(
      JSON.stringify({ error: `Failed to fetch resources: ${resErr.message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get already-processed files
  const { data: processed } = await supabase
    .from("resource_processing_log")
    .select("file_path")
    .eq("status", "success");

  const processedPaths = new Set((processed || []).map((p: any) => p.file_path));

  // Filter to only new files
  const toProcess = (resources || []).filter(
    (r: any) => r.doc_file_path && !processedPaths.has(r.doc_file_path)
  );

  const results = [];
  for (const resource of toProcess) {
    const result = await processFile(supabase, resource.id, resource.doc_file_path);
    results.push({ resource_id: resource.id, file_path: resource.doc_file_path, ...result });
  }

  return new Response(
    JSON.stringify({
      success: true,
      total_found: resources?.length || 0,
      already_processed: processedPaths.size,
      newly_processed: results.length,
      results,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function logProcessing(
  supabase: any,
  resourceId: string,
  filePath: string,
  status: string,
  errorMessage: string | null
) {
  await supabase.from("resource_processing_log").upsert(
    {
      resource_id: resourceId,
      file_path: filePath,
      status,
      error_message: errorMessage,
      processed_at: new Date().toISOString(),
    },
    { onConflict: "file_path" }
  );
}
