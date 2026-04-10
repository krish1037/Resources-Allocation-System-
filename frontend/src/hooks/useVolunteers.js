import { useQuery } from '@tanstack/react-query';
import { getVolunteers } from '../services/api';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setVolunteers as setVolunteersAction } from '../store/volunteerSlice';

export default function useVolunteers() {
  const dispatch = useDispatch();

  const query = useQuery({
    queryKey: ['volunteers'],
    queryFn: async () => {
      const response = await getVolunteers();
      return response.data;
    },
    refetchInterval: 30000, // Volunteers refresh every 30 seconds
  });

  useEffect(() => {
    if (query.data) {
      dispatch(setVolunteersAction(query.data));
    }
  }, [query.data, dispatch]);

  return {
    volunteers: query.data || [],
    loading: query.isLoading,
    error: query.error
  };
}
