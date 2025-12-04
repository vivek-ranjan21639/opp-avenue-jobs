import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DisplayLocation = 'home' | 'job_detail';
export type ContentType = 'poster_clickable' | 'poster_static' | 'poster_job_link';

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
}

export const useFeaturedContent = (displayLocation: DisplayLocation) => {
  return useQuery({
    queryKey: ['featured-content', displayLocation],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_content')
        .select(`
          id,
          content_type,
          job_id,
          title,
          image_url,
          link_url,
          display_location,
          display_order,
          is_active
        `)
        .eq('display_location', displayLocation)
        .eq('is_active', true)
        .neq('content_type', 'job') // Exclude job type items
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      // Map content types: poster_clickable with job_id becomes poster_job_link
      return (data || []).map(item => ({
        ...item,
        content_type: (item.content_type === 'poster_clickable' && item.job_id 
          ? 'poster_job_link' 
          : item.content_type) as ContentType
      })) as FeaturedContent[];
    },
  });
};