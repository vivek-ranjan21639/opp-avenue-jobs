import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TopBlog {
  id: string;
  title: string;
  slug: string;
  author_id: string;
  thumbnail_url?: string;
  read_time_minutes?: number;
  authors?: {
    name: string;
    profile_pic_url?: string;
  };
}

export const useTopBlogs = () => {
  return useQuery({
    queryKey: ['top-blogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          id,
          title,
          slug,
          author_id,
          thumbnail_url,
          read_time_minutes,
          authors (
            name,
            profile_pic_url
          )
        `)
        .eq('status', 'published')
        .eq('top_blog', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data as TopBlog[];
    },
  });
};
