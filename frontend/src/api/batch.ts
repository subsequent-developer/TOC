import apiClient from './client';
import type { BatchAnalysisRequest, BatchAnalysisResponse } from '../types/analysis';

export const createBatchAnalysis = async (
  request: BatchAnalysisRequest
): Promise<BatchAnalysisResponse> => {
  const { data } = await apiClient.post<BatchAnalysisResponse>(
    '/api/v1/analyses/batch',
    request
  );
  return data;
};
