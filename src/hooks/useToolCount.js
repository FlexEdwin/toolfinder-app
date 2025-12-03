import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

/**
 * Custom hook for fetching the total count of tools matching search criteria
 * @param {Object} params - Query parameters
 * @param {string} params.search - Search term
 * @param {string} params.category - Category filter (default: "Todas")
 * @returns {Object} React Query result object with count data
 */
export function useToolCount({ search = '', category = 'Todas' } = {}) {
  return useQuery({
    queryKey: ['toolCount', { search, category }],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('count_tools_smart', {
        search_term: search,
        category_filter: category,
      });

      if (error) throw error;

      // Return the count directly
      return data || 0;
    },
    staleTime: 1000 * 60, // 1 minute - counts don't need to be real-time
  });
}
