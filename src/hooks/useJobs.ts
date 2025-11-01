import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/components/JobCard';

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
            logo_url
          ),
          locations (
            city,
            state,
            country
          ),
          job_skills (
            skills (
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
        location: job.locations 
          ? `${job.locations.city}${job.locations.state ? ', ' + job.locations.state : ''}${job.locations.country ? ', ' + job.locations.country : ''}`
          : 'Location not specified',
        salary: job.salary_min && job.salary_max
          ? `${job.currency || 'INR'} ${job.salary_min} - ${job.salary_max}`
          : 'Not disclosed',
        type: job.job_type || 'Full-time',
        experience: 'Not specified',
        skills: job.job_skills?.map((js: any) => js.skills?.name).filter(Boolean) || [],
        postedTime: formatPostedTime(job.created_at),
        description: job.description || '',
        remote: job.work_mode === 'Remote' || job.work_mode === 'Hybrid',
        companyLogo: job.companies?.logo_url
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
          locations (
            city,
            state,
            country
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

      return {
        ...data,
        company_name: data.companies?.name || 'Unknown Company',
        location: data.locations 
          ? `${data.locations.city}${data.locations.state ? ', ' + data.locations.state : ''}${data.locations.country ? ', ' + data.locations.country : ''}`
          : 'Location not specified',
        salary: data.salary_min && data.salary_max
          ? `${data.currency || 'INR'} ${data.salary_min} - ${data.salary_max}`
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
        companyHqLocation: data.companies?.hq_location
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
