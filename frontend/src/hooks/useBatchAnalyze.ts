import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBatchAnalysis } from '../api/batch';
import type { BatchAnalysisRequest } from '../types/analysis';

export const useBatchAnalyze = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: BatchAnalysisRequest) => createBatchAnalysis(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });
};
