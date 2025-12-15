import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

export function usePopularKits() {
  return useQuery({
    queryKey: ['popularKits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_popular_kits');
      
      if (error) {
        console.error('Error fetching popular kits:', error);
        throw error;
      }
      
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
