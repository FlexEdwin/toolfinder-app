import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

/**
 * Custom hook for fetching tools with React Query
 * @param {Object} params - Query parameters
 * @param {string} params.search - Search term
 * @param {string} params.category - Category filter (default: "Todas")
 * @param {number} params.page - Page number (default: 1)
 * @returns {Object} React Query result object with tools array
 */
export function useTools({ search = '', category = 'Todas', page = 1 } = {}) {
  const ITEMS_PER_PAGE = 20;

  return useQuery({
    queryKey: ['tools', { search, category, page }],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('search_tools_smart', {
        search_term: search,
        category_filter: category,
        page_number: page,
        items_per_page: ITEMS_PER_PAGE,
      });

      if (error) throw error;

      // Return tools array directly
      return data || [];
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
