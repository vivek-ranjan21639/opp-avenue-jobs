import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBlogAuthors = () => {
  return useQuery({
    queryKey: ['blog-authors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('authors')
        .select('id, name, profile_url')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });
};
