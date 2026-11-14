import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAnalysis } from '../api/analyses';
import type { WorkflowAnalysisRequest } from '../types/analysis';

export const useAnalyze = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: WorkflowAnalysisRequest) => createAnalysis(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });
};
