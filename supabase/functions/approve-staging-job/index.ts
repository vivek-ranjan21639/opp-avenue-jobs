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

    const { staging_job_id } = await req.json();

    if (!staging_job_id) {
      return new Response(
        JSON.stringify({ error: "staging_job_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch staging job
    const { data: staging, error: fetchError } = await supabase
      .from("staging_jobs")
      .select("*")
      .eq("id", staging_job_id)
      .single();

    if (fetchError || !staging) {
      return new Response(
        JSON.stringify({ error: `Staging job not found: ${fetchError?.message}` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (staging.review_status !== "approved") {
      return new Response(
        JSON.stringify({ error: "Staging job must have review_status = 'approved'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. COMPANY: Find or create
    let companyId: string | null = null;
    if (staging.parsed_company_name) {
      const { data: existing } = await supabase
        .from("companies")
        .select("id")
        .ilike("name", staging.parsed_company_name)
        .limit(1);

      if (existing && existing.length > 0) {
        companyId = existing[0].id;
      } else {
        const { data: newCompany, error: compErr } = await supabase
          .from("companies")
          .insert({ name: staging.parsed_company_name })
          .select("id")
          .single();

        if (compErr) {
          return errorResponse(`Failed to create company: ${compErr.message}`);
        }
        companyId = newCompany.id;
      }
    }

    if (!companyId) {
      return errorResponse("No company name found in staging job");
    }

    // 2. LOCATIONS: Find or create each
    const locationIds: string[] = [];
    const locations = (staging.parsed_locations || []) as Array<{ city: string; state?: string; country?: string }>;
    for (const loc of locations) {
      if (!loc.city) continue;
      let query = supabase.from("locations").select("id").ilike("city", loc.city);
      if (loc.state) query = query.ilike("state", loc.state);
      if (loc.country) query = query.ilike("country", loc.country);
      const { data: existing } = await query.limit(1);

      if (existing && existing.length > 0) {
        locationIds.push(existing[0].id);
      } else {
        const { data: newLoc, error: locErr } = await supabase
          .from("locations")
          .insert({ city: loc.city, state: loc.state || null, country: loc.country || null })
          .select("id")
          .single();
        if (!locErr && newLoc) locationIds.push(newLoc.id);
      }
    }

    // 3. SKILLS: Find or create each
    const skillIds: string[] = [];
    const skills = (staging.parsed_skills || []) as string[];
    for (const skillName of skills) {
      if (!skillName) continue;
      const { data: existing } = await supabase
        .from("skills")
        .select("id")
        .ilike("name", skillName)
        .limit(1);

      if (existing && existing.length > 0) {
        skillIds.push(existing[0].id);
      } else {
        const { data: newSkill, error: skErr } = await supabase
          .from("skills")
          .insert({ name: skillName })
          .select("id")
          .single();
        if (!skErr && newSkill) skillIds.push(newSkill.id);
      }
    }

    // 4. DOMAINS: Find or create each
    const domainIds: string[] = [];
    const domains = (staging.parsed_domains || []) as string[];
    for (const domainName of domains) {
      if (!domainName) continue;
      const { data: existing } = await supabase
        .from("domains")
        .select("id")
        .ilike("name", domainName)
        .limit(1);

      if (existing && existing.length > 0) {
        domainIds.push(existing[0].id);
      } else {
        const { data: newDom, error: domErr } = await supabase
          .from("domains")
          .insert({ name: domainName })
          .select("id")
          .single();
        if (!domErr && newDom) domainIds.push(newDom.id);
      }
    }

    // 5. BENEFITS: Find or create each
    const benefitIds: string[] = [];
    const benefits = (staging.parsed_benefits || []) as string[];
    for (const benefitName of benefits) {
      if (!benefitName) continue;
      const { data: existing } = await supabase
        .from("benefits")
        .select("id")
        .ilike("name", benefitName)
        .limit(1);

      if (existing && existing.length > 0) {
        benefitIds.push(existing[0].id);
      } else {
        const { data: newBen, error: benErr } = await supabase
          .from("benefits")
          .insert({ name: benefitName })
          .select("id")
          .single();
        if (!benErr && newBen) benefitIds.push(newBen.id);
      }
    }

    // 6. INSERT JOB
    const jobData: Record<string, any> = {
      title: staging.title,
      company_id: companyId,
      description: staging.description,
      responsibilities: staging.responsibilities,
      qualifications: staging.qualifications,
      salary_min: staging.salary_min,
      salary_max: staging.salary_max,
      deadline: staging.deadline,
      vacancies: staging.vacancies,
      application_link: staging.application_link,
      application_email: staging.application_email,
      jd_file_url: staging.file_path,
    };

    // Map currency and enums carefully
    if (staging.currency) {
      const validCurrencies = ["INR", "USD", "EUR", "GBP", "Other"];
      jobData.currency = validCurrencies.includes(staging.currency.toUpperCase())
        ? staging.currency.toUpperCase()
        : "Other";
    }
    if (staging.job_type) {
      const validTypes = ["Full-time", "Part-time", "Internship", "Contract"];
      const matched = validTypes.find((t) => t.toLowerCase() === staging.job_type.toLowerCase());
      if (matched) jobData.job_type = matched;
    }
    if (staging.work_mode) {
      const validModes = ["Remote", "On-site", "Hybrid"];
      const matched = validModes.find((m) => m.toLowerCase() === staging.work_mode.toLowerCase());
      if (matched) jobData.work_mode = matched;
    }

    const { data: newJob, error: jobErr } = await supabase
      .from("jobs")
      .insert(jobData)
      .select("id")
      .single();

    if (jobErr) {
      return errorResponse(`Failed to create job: ${jobErr.message}`);
    }

    const jobId = newJob.id;

    // 7. ELIGIBILITY CRITERIA
    const eligibility = (staging.parsed_eligibility || {}) as Record<string, any>;
    if (Object.values(eligibility).some((v) => v !== null)) {
      await supabase.from("eligibility_criteria").insert({
        job_id: jobId,
        min_experience: eligibility.min_experience || null,
        max_experience: eligibility.max_experience || null,
        education_level: eligibility.education_level || null,
        age_limit: eligibility.age_limit || null,
        other_criteria: eligibility.other_criteria || null,
      });
    }

    // 8. COMPANY CULTURE
    const culturePoints = (staging.parsed_culture_points || []) as string[];
    for (const point of culturePoints) {
      if (!point) continue;
      await supabase.from("company_culture").insert({
        company_id: companyId,
        point,
      });
    }

    // 9. JUNCTION TABLES
    for (const locId of locationIds) {
      await supabase.from("job_locations").insert({ job_id: jobId, location_id: locId });
    }
    for (const skillId of skillIds) {
      await supabase.from("job_skills").insert({ job_id: jobId, skill_id: skillId });
    }
    for (const domainId of domainIds) {
      await supabase.from("job_domains").insert({ job_id: jobId, domain_id: domainId });
    }
    for (const benefitId of benefitIds) {
      await supabase.from("job_benefits").insert({ job_id: jobId, benefit_id: benefitId });
    }

    // 10. Update staging job status
    await supabase
      .from("staging_jobs")
      .update({ review_status: "approved", approved_at: new Date().toISOString() })
      .eq("id", staging_job_id);

    return new Response(
      JSON.stringify({
        success: true,
        job_id: jobId,
        company_id: companyId,
        locations_linked: locationIds.length,
        skills_linked: skillIds.length,
        domains_linked: domainIds.length,
        benefits_linked: benefitIds.length,
        culture_points_added: culturePoints.length,
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

function errorResponse(message: string) {
  return new Response(
    JSON.stringify({ error: message }),
    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
