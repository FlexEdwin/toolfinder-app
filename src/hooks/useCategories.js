import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

/**
 * Custom hook for fetching distinct categories with React Query
 * @returns {Object} React Query result with categories array
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_distinct_categories');

      if (error) throw error;

      // Return categories array directly
      return data || [];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - categories rarely change
  });
}
