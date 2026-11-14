import { useQuery } from '@tanstack/react-query';
import { getAnalysisById } from '../api/analyses';

export const useAnalysis = (id: number | null) =>
  useQuery({
    queryKey: ['analysis', id],
    queryFn: () => getAnalysisById(id!),
    enabled: id !== null && id > 0,
  });
