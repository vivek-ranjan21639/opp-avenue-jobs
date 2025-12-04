import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/components/JobCard';

// Utility function to format salary in LPA
function formatSalaryLPA(min: number, max: number, currency: string = 'INR'): string {
  const formatAmount = (amount: number) => {
    if (amount >= 100000) {
      return (amount / 100000).toFixed(1).replace(/\.0$/, '');
    }
    return (amount / 1000).toFixed(0) + 'K';
  };
  return `${formatAmount(min)}-${formatAmount(max)} LPA`;
}

// Utility function to format location display (city only)
function formatLocationDisplay(locations: any[]): string {
  if (!locations || locations.length === 0) return 'Location not specified';
  const firstLocation = locations[0]?.locations;
  if (!firstLocation) return 'Location not specified';
  
  if (locations.length === 1) {
    return firstLocation.city || 'Location not specified';
  }
  return `${firstLocation.city}+${locations.length - 1}`;
}

export const useJobs = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            sector
          ),
          job_locations (
            locations (
              city,
              state,
              country
            )
          ),
          job_skills (
            skills (
              name
            )
          ),
          job_domains (
            domains (
              id,
              name
            )
          )
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((job): Job => ({
        id: job.id,
        title: job.title,
        company: job.companies?.name || 'Unknown Company',
        location: formatLocationDisplay(job.job_locations || []),
        salary: job.salary_min && job.salary_max
          ? formatSalaryLPA(job.salary_min, job.salary_max, job.currency || 'INR')
          : 'Not disclosed',
        type: job.job_type || 'Full-time',
        experience: 'Not specified',
        skills: job.job_skills?.map((js: any) => js.skills?.name).filter(Boolean) || [],
        postedTime: formatPostedTime(job.created_at),
        description: job.description || '',
        remote: job.work_mode === 'Remote' || job.work_mode === 'Hybrid',
        companyLogo: job.companies?.logo_url,
        sector: job.companies?.sector,
        domains: job.job_domains?.map((jd: any) => jd.domains?.name).filter(Boolean) || [],
        applicationEmail: job.application_email,
        applicationLink: job.application_link,
        locations: job.job_locations?.map((jl: any) => jl.locations).filter(Boolean) || [],
        work_mode: job.work_mode
      }));
    },
  });
};

export const useJob = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID is required');

      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            website,
            culture_summary,
            employee_count,
            founded_year,
            office_locations,
            hq_location,
            company_culture (
              point
            )
          ),
          job_locations (
            locations (
              city,
              state,
              country
            )
          ),
          job_skills (
            skills (
              name,
              category
            )
          ),
          job_benefits (
            benefits (
              name
            )
          ),
          eligibility_criteria (
            education_level,
            min_experience,
            max_experience,
            age_limit,
            other_criteria
          )
        `)
        .eq('id', jobId)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const eligibility = data.eligibility_criteria?.[0];

      const locations = data.job_locations?.map((jl: any) => jl.locations) || [];
      
      return {
        ...data,
        company_name: data.companies?.name || 'Unknown Company',
        location: formatLocationDisplay(data.job_locations || []),
        locations: locations,
        salary: data.salary_min && data.salary_max
          ? formatSalaryLPA(data.salary_min, data.salary_max, data.currency || 'INR')
          : 'Not disclosed',
        type: data.job_type || 'Full-time',
        experience: eligibility && (eligibility.min_experience || eligibility.max_experience)
          ? `${eligibility.min_experience || 0}-${eligibility.max_experience || '+'} years`
          : 'Not specified',
        remote: data.work_mode === 'Remote' || data.work_mode === 'Hybrid',
        skills: data.job_skills?.map((js: any) => js.skills?.name).filter(Boolean) || [],
        benefits: data.job_benefits?.map((jb: any) => jb.benefits?.name).filter(Boolean) || [],
        culture_points: data.companies?.company_culture?.map((cc: any) => cc.point).filter(Boolean) || [],
        eligibility: eligibility || null,
        postedTime: formatPostedTime(data.created_at),
        companyLogo: data.companies?.logo_url,
        companyWebsite: data.companies?.website,
        companyDescription: data.companies?.culture_summary,
        companyEmployeeCount: data.companies?.employee_count,
        companyFoundedYear: data.companies?.founded_year,
        companyOfficeLocations: data.companies?.office_locations || [],
        companyHqLocation: data.companies?.hq_location,
        applicationEmail: data.application_email,
        applicationLink: data.application_link,
        work_mode: data.work_mode
      };
    },
    enabled: !!jobId,
  });
};

function formatPostedTime(postedAt: string): string {
  const posted = new Date(postedAt);
  const now = new Date();
  const diffMs = now.getTime() - posted.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return '1 month ago';
  return `${Math.floor(diffDays / 30)} months ago`;
}
