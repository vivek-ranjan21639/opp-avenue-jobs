import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/components/JobCard";

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

export const useRecommendedJobs = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ['recommended-jobs', jobId],
    queryFn: async () => {
      if (!jobId) return [];

      // Get current job's domains and skills for matching
      const { data: currentJob } = await supabase
        .from('jobs')
        .select(`
          title,
          job_domains(domain_id),
          job_skills(skill_id)
        `)
        .eq('id', jobId)
        .single();

      if (!currentJob) return [];

      const currentDomainIds = currentJob.job_domains?.map((d: any) => d.domain_id) || [];
      const currentSkillIds = currentJob.job_skills?.map((s: any) => s.skill_id) || [];

      // Fetch jobs excluding current one
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
        .neq('id', jobId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching jobs for recommendations:', error);
        return [];
      }

      // Score and sort jobs by relevance
      const scoredJobs = jobs.map(job => {
        let score = 0;
        
        // Domain match score (40%)
        const jobDomainIds = job.job_domains?.map((d: any) => d.domain_id) || [];
        const domainMatches = jobDomainIds.filter((id: string) => currentDomainIds.includes(id)).length;
        if (currentDomainIds.length > 0) {
          score += (domainMatches / currentDomainIds.length) * 40;
        }

        // Skills match score (40%)
        const jobSkillIds = job.job_skills?.map((s: any) => s.skill_id) || [];
        const skillMatches = jobSkillIds.filter((id: string) => currentSkillIds.includes(id)).length;
        if (currentSkillIds.length > 0) {
          score += (skillMatches / currentSkillIds.length) * 40;
        }

        // Recency boost (20%)
        const daysSincePosted = Math.floor((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSincePosted < 7) score += 20;
        else if (daysSincePosted < 14) score += 15;
        else if (daysSincePosted < 30) score += 10;

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
    enabled: !!jobId,
  });
};