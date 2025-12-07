import { useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const STORAGE_KEY = 'oppavenue_viewed_jobs';
const MAX_HISTORY_SIZE = 50; // Limit to prevent storage bloat

export interface AggregatedProfile {
  jobIds: string[];
  domains: Record<string, number>;
  skills: Record<string, number>;
  jobTypes: Record<string, number>;
  sectors: Record<string, number>;
  avgSalaryMin: number;
  avgSalaryMax: number;
  workModes: Record<string, number>;
}

// Get viewed jobs from sessionStorage
export const getViewedJobs = (): string[] => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

// Add a job to viewed history
export const addViewedJob = (jobId: string): void => {
  try {
    const current = getViewedJobs();
    if (current.includes(jobId)) return;
    
    // Add new job at the beginning, limit size
    const updated = [jobId, ...current].slice(0, MAX_HISTORY_SIZE);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save job to session history:', e);
  }
};

// Hook to fetch aggregated profile from all viewed jobs
export const useAggregatedProfile = () => {
  const viewedJobIds = useMemo(() => getViewedJobs(), []);

  return useQuery({
    queryKey: ['aggregated-profile', viewedJobIds],
    queryFn: async (): Promise<AggregatedProfile> => {
      if (viewedJobIds.length === 0) {
        return {
          jobIds: [],
          domains: {},
          skills: {},
          jobTypes: {},
          sectors: {},
          avgSalaryMin: 0,
          avgSalaryMax: 0,
          workModes: {},
        };
      }

      // Fetch all viewed jobs with their related data
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

      if (error) {
        console.error('Error fetching viewed jobs for profile:', error);
        return {
          jobIds: viewedJobIds,
          domains: {},
          skills: {},
          jobTypes: {},
          sectors: {},
          avgSalaryMin: 0,
          avgSalaryMax: 0,
          workModes: {},
        };
      }

      // Aggregate data from all viewed jobs
      const domains: Record<string, number> = {};
      const skills: Record<string, number> = {};
      const jobTypes: Record<string, number> = {};
      const sectors: Record<string, number> = {};
      const workModes: Record<string, number> = {};
      let totalSalaryMin = 0;
      let totalSalaryMax = 0;
      let salaryCount = 0;

      for (const job of jobs || []) {
        // Count domains
        for (const jd of job.job_domains || []) {
          domains[jd.domain_id] = (domains[jd.domain_id] || 0) + 1;
        }

        // Count skills
        for (const js of job.job_skills || []) {
          skills[js.skill_id] = (skills[js.skill_id] || 0) + 1;
        }

        // Count job types
        if (job.job_type) {
          jobTypes[job.job_type] = (jobTypes[job.job_type] || 0) + 1;
        }

        // Count sectors
        const sector = job.companies?.sector;
        if (sector) {
          sectors[sector] = (sectors[sector] || 0) + 1;
        }

        // Count work modes
        if (job.work_mode) {
          workModes[job.work_mode] = (workModes[job.work_mode] || 0) + 1;
        }

        // Sum salaries
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
    },
    enabled: viewedJobIds.length > 0,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

// Custom hook for managing session job history
export const useSessionJobHistory = () => {
  const addJob = useCallback((jobId: string) => {
    addViewedJob(jobId);
  }, []);

  const getJobs = useCallback(() => {
    return getViewedJobs();
  }, []);

  return {
    addJob,
    getJobs,
    viewedJobIds: getViewedJobs(),
  };
};
