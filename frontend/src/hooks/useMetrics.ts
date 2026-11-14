import { useQuery } from '@tanstack/react-query';
import { getSummaryMetrics } from '../api/metrics';

export const useMetrics = () =>
  useQuery({
    queryKey: ['metrics'],
    queryFn: getSummaryMetrics,
    refetchInterval: 15000,
    staleTime: 10000,
  });
