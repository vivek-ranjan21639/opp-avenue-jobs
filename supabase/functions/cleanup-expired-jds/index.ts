import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

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

    // Find expired jobs with JD files
    const { data: expiredJobs, error: queryError } = await supabase
      .from("jobs")
      .select("id, jd_file_url")
      .lt("deadline", new Date().toISOString().split("T")[0])
      .not("jd_file_url", "is", null);

    if (queryError) {
      return new Response(
        JSON.stringify({ error: `Query failed: ${queryError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let filesDeleted = 0;
    let logsCleared = 0;

    for (const job of expiredJobs || []) {
      // Delete JD file from storage
      if (job.jd_file_url) {
        const { error: delError } = await supabase.storage
          .from("JDs")
          .remove([job.jd_file_url]);

        if (!delError) filesDeleted++;
      }

      // Nullify jd_file_url
      await supabase
        .from("jobs")
        .update({ jd_file_url: null })
        .eq("id", job.id);

      // Remove processing log entries
      if (job.jd_file_url) {
        const { count } = await supabase
          .from("jd_processing_log")
          .delete()
          .eq("file_path", job.jd_file_url);

        logsCleared += (count || 0);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        expired_jobs_found: expiredJobs?.length || 0,
        files_deleted: filesDeleted,
        logs_cleared: logsCleared,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${(err as Error).message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
