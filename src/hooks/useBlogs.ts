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
  author: {
    id: string;
    name: string;
    bio: string | null;
    profile_pic_url: string | null;
  } | null;
  tags: {
    id: string;
    name: string;
  }[];
}

export const useBlogs = (tagFilter?: string | null) => {
  return useQuery({
    queryKey: ['blogs', tagFilter],
    queryFn: async () => {
      let query = supabase
        .from('blogs')
        .select(`
          *,
          author:authors(id, name, bio, profile_pic_url),
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
        tags: blog.blog_tags?.map((bt: any) => bt.tag).filter(Boolean) || []
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
          author:authors(id, name, bio, profile_pic_url),
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
        tags: data.blog_tags?.map((bt: any) => bt.tag).filter(Boolean) || []
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
