import { useQuery } from '@tanstack/react-query';
import { getReadiness } from '../api/health';

export const useHealth = () =>
  useQuery({
    queryKey: ['health'],
    queryFn: getReadiness,
    refetchInterval: 30000,
    retry: 1,
  });
