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
            logo_url
          )
        `)
        .eq('is_active', true)
        .order('posted_at', { ascending: false });

      if (error) throw error;

      return data.map((job): Job => ({
        id: job.id,
        title: job.title,
        company: job.company_name,
        location: job.location,
        salary: job.salary,
        type: job.type,
        experience: job.experience,
        skills: job.skills,
        postedTime: formatPostedTime(job.posted_at),
        description: job.description,
        remote: job.remote || false,
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
            logo_url,
            website,
            description
          )
        `)
        .eq('id', jobId)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      return {
        ...data,
        postedTime: formatPostedTime(data.posted_at),
        companyLogo: data.companies?.logo_url,
        companyWebsite: data.companies?.website,
        companyDescription: data.companies?.description
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
