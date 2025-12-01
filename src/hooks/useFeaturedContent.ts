import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DisplayLocation = 'home' | 'job_detail';
export type ContentType = 'job' | 'poster_clickable' | 'poster_static';

export interface FeaturedContent {
  id: string;
  content_type: ContentType;
  job_id?: string;
  title?: string;
  image_url?: string;
  link_url?: string;
  display_location: DisplayLocation;
  display_order: number;
  is_active: boolean;
  job?: any;
}

export const useFeaturedContent = (displayLocation: DisplayLocation) => {
  return useQuery({
    queryKey: ['featured-content', displayLocation],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_content')
        .select(`
          *,
          jobs (
            id,
            title,
            companies (
              name,
              logo_url,
              sector
            ),
            job_locations (
              locations (
                city,
                state
              )
            ),
            job_skills (
              skills (
                name
              )
            ),
            job_domains (
              domains (
                name
              )
            ),
            salary_min,
            salary_max,
            currency,
            job_type,
            work_mode,
            created_at
          )
        `)
        .eq('display_location', displayLocation)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as FeaturedContent[];
    },
  });
};
