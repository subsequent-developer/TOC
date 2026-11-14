import { useQuery } from '@tanstack/react-query';
import { listAnalyses, type ListAnalysesParams } from '../api/analyses';

export const useAnalyses = (params: ListAnalysesParams = {}) =>
  useQuery({
    queryKey: ['analyses', params],
    queryFn: () => listAnalyses(params),
    staleTime: 5000,
    placeholderData: (prev) => prev,
  });
