import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/components/JobCard";

interface RecommendedJobRow {
  job_id: string;
  title: string;
  company_id: string;
  company_name: string;
  company_logo: string | null;
  company_sector: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  job_type: string | null;
  work_mode: string | null;
  created_at: string;
  relevance_score: number;
}

const formatSalaryLPA = (min: number | null, max: number | null, currency: string | null): string => {
  if (!min && !max) return 'Not disclosed';
  const minLPA = min ? (min / 100000).toFixed(1) : '0';
  const maxLPA = max ? (max / 100000).toFixed(1) : '0';
  return `${minLPA}-${maxLPA} LPA`;
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
  return `${Math.floor(diffDays / 30)} month(s) ago`;
};

export const useRecommendedJobs = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ['recommended-jobs', jobId],
    queryFn: async () => {
      if (!jobId) return [];

      const { data, error } = await supabase.rpc('get_recommended_jobs', {
        p_job_id: jobId,
        p_limit: 15
      });

      if (error) {
        console.error('Error fetching recommended jobs:', error);
        throw error;
      }

      // Fetch additional data for each job (locations, skills, domains)
      const jobIds = (data as RecommendedJobRow[]).map(job => job.job_id);
      
      // Fetch locations
      const { data: locationsData } = await supabase
        .from('job_locations')
        .select(`
          job_id,
          locations (city, state)
        `)
        .in('job_id', jobIds);

      // Fetch skills
      const { data: skillsData } = await supabase
        .from('job_skills')
        .select(`
          job_id,
          skills (name)
        `)
        .in('job_id', jobIds);

      // Fetch domains
      const { data: domainsData } = await supabase
        .from('job_domains')
        .select(`
          job_id,
          domains (name)
        `)
        .in('job_id', jobIds);

      // Map the data to Job interface
      const recommendedJobs: Job[] = (data as RecommendedJobRow[]).map(row => {
        const jobLocations = locationsData?.filter(l => l.job_id === row.job_id) || [];
        const jobSkills = skillsData?.filter(s => s.job_id === row.job_id) || [];
        const jobDomains = domainsData?.filter(d => d.job_id === row.job_id) || [];

        const locationDisplay = jobLocations.length > 0
          ? jobLocations.length > 1
            ? `${(jobLocations[0] as any).locations?.city}+${jobLocations.length - 1}`
            : (jobLocations[0] as any).locations?.city || 'Location not specified'
          : 'Location not specified';

        return {
          id: row.job_id,
          title: row.title,
          company: row.company_name,
          companyLogo: row.company_logo || undefined,
          location: locationDisplay,
          locations: jobLocations.map((l: any) => l.locations),
          salary: formatSalaryLPA(row.salary_min, row.salary_max, row.currency),
          type: row.job_type || 'Full-time',
          experience: 'Not specified',
          skills: jobSkills.map((s: any) => s.skills?.name).filter(Boolean),
          postedTime: formatPostedTime(row.created_at),
          description: '',
          remote: row.work_mode === 'Remote' || row.work_mode === 'Hybrid',
          sector: row.company_sector || undefined,
          domains: jobDomains.map((d: any) => d.domains?.name).filter(Boolean),
          work_mode: row.work_mode || undefined
        };
      });

      return recommendedJobs;
    },
    enabled: !!jobId,
  });
};
