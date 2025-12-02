import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

/**
 * Custom hook for fetching tools with infinite pagination
 * @param {Object} params - Query parameters
 * @param {string} params.search - Search term
 * @param {string} params.category - Category filter (default: "Todas")
 * @returns {Object} React Query infinite query result object with pages array
 */
export function useTools({ search = '', category = 'Todas' } = {}) {
  const ITEMS_PER_PAGE = 20;

  return useInfiniteQuery({
    queryKey: ['tools', { search, category }],
    queryFn: async ({ pageParam = 1 }) => {
      const { data, error } = await supabase.rpc('search_tools_smart', {
        search_term: search,
        category_filter: category,
        page_number: pageParam,
        items_per_page: ITEMS_PER_PAGE,
      });

      if (error) throw error;

      // Return tools array directly
      return data || [];
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // If last page has fewer than 20 items, we've reached the end
      if (lastPage.length < ITEMS_PER_PAGE) {
        return undefined;
      }
      // Otherwise, return the next page number
      return allPages.length + 1;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
