import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ResourceType = Database['public']['Enums']['resource_type'];

export type HighlightType = 'featured' | 'new' | 'general';

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: ResourceType;
  content_type: string | null;
  content_text: string | null;
  file_url: string | null;
  video_url: string | null;
  external_url: string | null;
  thumbnail_url: string | null;
  parent_id: string | null;
  display_order: number;
  highlight_type: HighlightType;
  created_at: string;
  updated_at: string;
}

export const useResources = (type?: ResourceType) => {
  return useQuery({
    queryKey: ['resources', type],
    queryFn: async () => {
      let query = supabase
        .from('resources')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (type) {
        query = query.eq('type', type);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
};

export const useResource = (id: string | undefined) => {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useFeaturedResources = () => {
  return useQuery({
    queryKey: ['featured-resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('highlight_type', 'featured')
        .order('display_order', { ascending: true })
        .limit(6);

      if (error) throw error;
      return data as Resource[];
    },
  });
};

export const useNewResources = () => {
  return useQuery({
    queryKey: ['new-resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('highlight_type', 'new')
        .order('display_order', { ascending: true })
        .limit(6);

      if (error) throw error;
      return data as Resource[];
    },
  });
};
