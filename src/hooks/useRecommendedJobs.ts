import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/components/JobCard";
import { getViewedJobs, AggregatedProfile } from "./useSessionJobHistory";

const formatSalaryLPA = (min: number | null, max: number | null): string => {
  if (!min && !max) return 'Not disclosed';
  const formatAmount = (amount: number) => {
    if (amount >= 100000) {
      return (amount / 100000).toFixed(1).replace(/\.0$/, '');
    }
    return (amount / 1000).toFixed(0) + 'K';
  };
  const minStr = min ? formatAmount(min) : '0';
  const maxStr = max ? formatAmount(max) : '0';
  return `${minStr}-${maxStr} LPA`;
};

const formatPostedTime = (createdAt: string): string => {
  const now = new Date();
  const posted = new Date(createdAt);
  const diffMs = now.getTime() - posted.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return '1 month ago';
  return `${Math.floor(diffDays / 30)} months ago`;
};

const formatLocationDisplay = (locations: any[]): string => {
  if (!locations || locations.length === 0) return 'Location not specified';
  const firstLocation = locations[0]?.locations;
  if (!firstLocation) return 'Location not specified';
  
  if (locations.length === 1) {
    return firstLocation.city || 'Location not specified';
  }
  return `${firstLocation.city}+${locations.length - 1}`;
};

// Build aggregated profile from all viewed jobs
const buildAggregatedProfile = async (viewedJobIds: string[]): Promise<AggregatedProfile | null> => {
  if (viewedJobIds.length === 0) return null;

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select(`
      id,
      job_type,
      work_mode,
      salary_min,
      salary_max,
      companies (
        sector
      ),
      job_domains (
        domain_id
      ),
      job_skills (
        skill_id
      )
    `)
    .in('id', viewedJobIds)
    .is('deleted_at', null);

  if (error || !jobs || jobs.length === 0) return null;

  const domains: Record<string, number> = {};
  const skills: Record<string, number> = {};
  const jobTypes: Record<string, number> = {};
  const sectors: Record<string, number> = {};
  const workModes: Record<string, number> = {};
  let totalSalaryMin = 0;
  let totalSalaryMax = 0;
  let salaryCount = 0;

  for (const job of jobs) {
    for (const jd of job.job_domains || []) {
      domains[jd.domain_id] = (domains[jd.domain_id] || 0) + 1;
    }
    for (const js of job.job_skills || []) {
      skills[js.skill_id] = (skills[js.skill_id] || 0) + 1;
    }
    if (job.job_type) {
      jobTypes[job.job_type] = (jobTypes[job.job_type] || 0) + 1;
    }
    const sector = job.companies?.sector;
    if (sector) {
      sectors[sector] = (sectors[sector] || 0) + 1;
    }
    if (job.work_mode) {
      workModes[job.work_mode] = (workModes[job.work_mode] || 0) + 1;
    }
    if (job.salary_min || job.salary_max) {
      totalSalaryMin += job.salary_min || 0;
      totalSalaryMax += job.salary_max || 0;
      salaryCount++;
    }
  }

  return {
    jobIds: viewedJobIds,
    domains,
    skills,
    jobTypes,
    sectors,
    avgSalaryMin: salaryCount > 0 ? totalSalaryMin / salaryCount : 0,
    avgSalaryMax: salaryCount > 0 ? totalSalaryMax / salaryCount : 0,
    workModes,
  };
};

export const useRecommendedJobs = (currentJobId: string | undefined) => {
  return useQuery({
    queryKey: ['recommended-jobs', currentJobId, getViewedJobs()],
    queryFn: async () => {
      if (!currentJobId) return [];

      // Get all viewed jobs from session (includes current job)
      const viewedJobIds = getViewedJobs();
      
      // Build aggregated profile from session history
      // If no history yet, fall back to just the current job
      const jobIdsForProfile = viewedJobIds.length > 0 ? viewedJobIds : [currentJobId];
      const profile = await buildAggregatedProfile(jobIdsForProfile);

      // Get all unique domain and skill IDs from the profile
      const profileDomainIds = profile ? Object.keys(profile.domains) : [];
      const profileSkillIds = profile ? Object.keys(profile.skills) : [];
      const totalUniqueDomains = profileDomainIds.length;
      const totalUniqueSkills = profileSkillIds.length;

      // Fetch candidate jobs excluding all viewed jobs
      const excludeIds = viewedJobIds.length > 0 ? viewedJobIds : [currentJobId];
      
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          created_at,
          salary_min,
          salary_max,
          currency,
          job_type,
          work_mode,
          companies (
            name,
            logo_url,
            sector
          ),
          job_locations (
            locations (
              city
            )
          ),
          job_skills (
            skill_id,
            skills (name)
          ),
          job_domains (
            domain_id,
            domains (name)
          ),
          eligibility_criteria (
            min_experience,
            max_experience
          )
        `)
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching jobs for recommendations:', error);
        return [];
      }

      // Score and sort jobs by relevance using aggregated profile
      const scoredJobs = jobs.map(job => {
        let score = 0;
        
        // Domain match score (35%)
        if (profile && totalUniqueDomains > 0) {
          const jobDomainIds = job.job_domains?.map((d: any) => d.domain_id) || [];
          const domainMatchCount = jobDomainIds.filter((id: string) => 
            profileDomainIds.includes(id)
          ).length;
          score += (domainMatchCount / totalUniqueDomains) * 35;
        }

        // Skills match score (35%)
        if (profile && totalUniqueSkills > 0) {
          const jobSkillIds = job.job_skills?.map((s: any) => s.skill_id) || [];
          const skillMatchCount = jobSkillIds.filter((id: string) => 
            profileSkillIds.includes(id)
          ).length;
          score += (skillMatchCount / totalUniqueSkills) * 35;
        }

        // Job type alignment (15%)
        if (profile && job.job_type && profile.jobTypes[job.job_type]) {
          score += 15;
        }

        // Recency boost (15%)
        const daysSincePosted = Math.floor((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSincePosted < 7) score += 15;
        else if (daysSincePosted < 14) score += 10;
        else if (daysSincePosted < 30) score += 5;

        return { ...job, relevanceScore: score };
      });

      // Sort by score and take top 15
      const topJobs = scoredJobs
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 15);

      // Map to Job interface
      const recommendedJobs: Job[] = topJobs.map(job => {
        const eligibility = job.eligibility_criteria?.[0];
        return {
          id: job.id,
          title: job.title,
          company: job.companies?.name || 'Unknown Company',
          companyLogo: job.companies?.logo_url || undefined,
          location: formatLocationDisplay(job.job_locations || []),
          locations: job.job_locations?.map((jl: any) => jl.locations).filter(Boolean) || [],
          salary: formatSalaryLPA(job.salary_min, job.salary_max),
          type: job.job_type || 'Full-time',
          experience: eligibility && (eligibility.min_experience || eligibility.max_experience)
            ? `${eligibility.min_experience || 0}-${eligibility.max_experience || '+'} yrs`
            : 'Not specified',
          skills: job.job_skills?.map((s: any) => s.skills?.name).filter(Boolean) || [],
          postedTime: formatPostedTime(job.created_at),
          description: '',
          remote: job.work_mode === 'Remote' || job.work_mode === 'Hybrid',
          sector: job.companies?.sector || undefined,
          domains: job.job_domains?.map((d: any) => d.domains?.name).filter(Boolean) || [],
          work_mode: job.work_mode || undefined
        };
      });

      return recommendedJobs;
    },
    enabled: !!currentJobId,
  });
};