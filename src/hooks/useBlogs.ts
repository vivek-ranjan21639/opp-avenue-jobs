import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  summary: string | null;
  thumbnail_url: string | null;
  status: string;
  featured: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  read_time_minutes?: number;
  author: {
    id: string;
    name: string;
    bio: string | null;
    profile_pic_url: string | null;
    profile_url: string | null;
  } | null;
  tags: {
    id: string;
    name: string;
  }[];
}

// Calculate read time based on content (average 200 words per minute)
export const calculateReadTime = (content: string | null): number => {
  if (!content) return 1;
  const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
  const wordCount = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
};

export const useBlogs = (tagFilter?: string | null) => {
  return useQuery({
    queryKey: ['blogs', tagFilter],
    queryFn: async () => {
      let query = supabase
        .from('blogs')
        .select(`
          *,
          author:authors(id, name, bio, profile_pic_url, profile_url),
          blog_tags(
            tag:tags(id, name)
          )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform the data to match our Blog interface
      const blogs: Blog[] = (data || []).map((blog: any) => ({
        ...blog,
        tags: blog.blog_tags?.map((bt: any) => bt.tag).filter(Boolean) || [],
        read_time_minutes: blog.read_time_minutes || 1 // Use backend value, fallback to 1
      }));
      
      // Filter by tag if provided
      if (tagFilter) {
        return blogs.filter(blog => 
          blog.tags.some(tag => tag.name === tagFilter)
        );
      }
      
      return blogs;
    },
  });
};

export const useBlog = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          author:authors(id, name, bio, profile_pic_url, profile_url),
          blog_tags(
            tag:tags(id, name)
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      
      if (error) throw error;
      
      // Transform the data
      const blog: Blog = {
        ...data,
        tags: data.blog_tags?.map((bt: any) => bt.tag).filter(Boolean) || [],
        read_time_minutes: data.read_time_minutes || 1 // Use backend value, fallback to 1
      };
      
      return blog;
    },
    enabled: !!slug,
  });
};

export const useBlogTags = () => {
  return useQuery({
    queryKey: ['blog-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });
};
