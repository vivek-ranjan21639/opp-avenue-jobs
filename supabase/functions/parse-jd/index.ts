import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import mammoth from "https://esm.sh/mammoth@1.8.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Expected DOCX headings for structured parsing
const FIELD_KEYS = [
  "company", "title", "location", "job type", "work mode", "salary",
  "deadline", "vacancies", "description", "responsibilities", "qualifications",
  "skills", "domains", "benefits", "culture", "experience", "education",
  "age limit", "other criteria", "application link", "application email",
];

function parseJDText(text: string) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const fields: Record<string, string> = {};
  let currentKey = "";

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    const matchedKey = FIELD_KEYS.find(
      (k) => lowerLine.startsWith(k + ":") || lowerLine.startsWith(k + " :")
    );

    if (matchedKey) {
      currentKey = matchedKey;
      const colonIdx = line.indexOf(":");
      const value = line.substring(colonIdx + 1).trim();
      fields[currentKey] = value;
    } else if (currentKey) {
      // Append to current field (bullet points, multi-line)
      fields[currentKey] = (fields[currentKey] || "") + "\n" + line;
    }
  }

  return fields;
}

function parseBulletList(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

function parseCommaSeparated(text: string | undefined): string[] {
  if (!text) return [];
  return text.split(",").map((s) => s.trim()).filter(Boolean);
}

function parseLocations(text: string | undefined): Array<{ city: string; state?: string; country?: string }> {
  if (!text) return [];
  return text.split(";").map((loc) => {
    const parts = loc.split(",").map((p) => p.trim());
    return {
      city: parts[0] || "",
      state: parts[1] || undefined,
      country: parts[2] || undefined,
    };
  }).filter((l) => l.city);
}

function parseSalary(text: string | undefined): { min?: number; max?: number; currency?: string } {
  if (!text) return {};
  const match = text.match(/(\d[\d,]*)\s*[-–]\s*(\d[\d,]*)\s*(\w+)?/);
  if (match) {
    return {
      min: parseInt(match[1].replace(/,/g, "")),
      max: parseInt(match[2].replace(/,/g, "")),
      currency: match[3] || undefined,
    };
  }
  return {};
}

function parseExperience(text: string | undefined): { min?: number; max?: number } {
  if (!text) return {};
  const match = text.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (match) return { min: parseInt(match[1]), max: parseInt(match[2]) };
  const single = text.match(/(\d+)/);
  if (single) return { min: parseInt(single[1]) };
  return {};
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const mode = body.mode || "batch";

    // List files in JDs/pending/
    const { data: files, error: listError } = await supabase.storage
      .from("JDs")
      .list("pending", { limit: 100 });

    if (listError) {
      return new Response(
        JSON.stringify({ error: `Failed to list files: ${listError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get already-processed files
    const { data: processed } = await supabase
      .from("jd_processing_log")
      .select("file_path");

    const processedPaths = new Set((processed || []).map((p: any) => p.file_path));

    const docxFiles = (files || []).filter(
      (f: any) => f.name?.endsWith(".docx") && !processedPaths.has(`pending/${f.name}`)
    );

    const results = [];

    for (const file of docxFiles) {
      const filePath = `pending/${file.name}`;
      try {
        // Download DOCX
        const { data: fileData, error: dlError } = await supabase.storage
          .from("JDs")
          .download(filePath);

        if (dlError || !fileData) {
          await logJD(supabase, filePath, null, "error", dlError?.message || "Download failed");
          results.push({ file: file.name, success: false, error: dlError?.message });
          continue;
        }

        // Extract text using mammoth
        const arrayBuffer = await fileData.arrayBuffer();
        const textResult = await mammoth.extractRawText({ arrayBuffer });
        const rawText = textResult.value;

        // Parse structured fields
        const fields = parseJDText(rawText);
        const salary = parseSalary(fields["salary"]);
        const exp = parseExperience(fields["experience"]);

        // Insert into staging_jobs
        const stagingData = {
          title: fields["title"] || file.name.replace(".docx", ""),
          description: fields["description"] || null,
          responsibilities: parseBulletList(fields["responsibilities"]),
          qualifications: parseBulletList(fields["qualifications"]),
          salary_min: salary.min || null,
          salary_max: salary.max || null,
          currency: salary.currency || null,
          job_type: fields["job type"] || null,
          work_mode: fields["work mode"] || null,
          deadline: fields["deadline"] || null,
          vacancies: fields["vacancies"] ? parseInt(fields["vacancies"]) : null,
          application_link: fields["application link"] || null,
          application_email: fields["application email"] || null,
          file_path: filePath,
          parsed_company_name: fields["company"] || null,
          parsed_locations: parseLocations(fields["location"]),
          parsed_skills: parseCommaSeparated(fields["skills"]),
          parsed_domains: parseCommaSeparated(fields["domains"]),
          parsed_benefits: parseCommaSeparated(fields["benefits"]),
          parsed_culture_points: parseBulletList(fields["culture"]),
          parsed_eligibility: {
            min_experience: exp.min || null,
            max_experience: exp.max || null,
            education_level: fields["education"] || null,
            age_limit: fields["age limit"] ? parseInt(fields["age limit"]) : null,
            other_criteria: fields["other criteria"] || null,
          },
          review_status: "pending_review",
        };

        const { data: staging, error: insertError } = await supabase
          .from("staging_jobs")
          .insert(stagingData)
          .select("id")
          .single();

        if (insertError) {
          await logJD(supabase, filePath, null, "error", insertError.message);
          results.push({ file: file.name, success: false, error: insertError.message });
          continue;
        }

        // Move file from pending/ to processed/
        const { error: moveError } = await supabase.storage
          .from("JDs")
          .move(filePath, `processed/${file.name}`);

        if (moveError) {
          console.error("Failed to move file:", moveError);
        }

        await logJD(supabase, filePath, staging.id, "success", null);
        results.push({ file: file.name, success: true, staging_job_id: staging.id });
      } catch (err) {
        const errMsg = (err as Error).message;
        await logJD(supabase, filePath, null, "error", errMsg);
        results.push({ file: file.name, success: false, error: errMsg });
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
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${(err as Error).message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function logJD(
  supabase: any,
  filePath: string,
  stagingJobId: string | null,
  status: string,
  errorMessage: string | null
) {
  await supabase.from("jd_processing_log").upsert(
    {
      file_path: filePath,
      staging_job_id: stagingJobId,
      status,
      error_message: errorMessage,
      processed_at: new Date().toISOString(),
    },
    { onConflict: "file_path" }
  );
}
