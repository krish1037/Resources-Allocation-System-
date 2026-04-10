import { useQuery } from '@tanstack/react-query';
import { getNeeds } from '../services/api';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setNeeds as setNeedsAction } from '../store/needsSlice';

export default function useNeeds(limit = 50) {
  const dispatch = useDispatch();

  const query = useQuery({
    queryKey: ['needs', limit],
    queryFn: async () => {
      const response = await getNeeds(limit);
      return response.data.needs;
    },
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  // Keep Redux in sync for compatibility with other components
  useEffect(() => {
    if (query.data) {
      dispatch(setNeedsAction(query.data));
    }
  }, [query.data, dispatch]);

  return {
    needs: query.data || [],
    loading: query.isLoading,
    error: query.error
  };
}
