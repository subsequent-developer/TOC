import apiClient from './client';
import type {
  AnalysisRecord,
  PaginatedAnalysesResponse,
  WorkflowAnalysisRequest,
  OrderHistoryResponse,
} from '../types/analysis';

export interface ListAnalysesParams {
  skip?: number;
  limit?: number;
  verdict?: string | null;
  is_anomaly?: boolean | null;
}

export const createAnalysis = async (request: WorkflowAnalysisRequest): Promise<AnalysisRecord> => {
  const { data } = await apiClient.post<AnalysisRecord>('/api/v1/analyses', request);
  return data;
};

export const listAnalyses = async (params: ListAnalysesParams = {}): Promise<PaginatedAnalysesResponse> => {
  const cleanParams: Record<string, unknown> = {};
  if (params.skip !== undefined) cleanParams.skip = params.skip;
  if (params.limit !== undefined) cleanParams.limit = params.limit;
  if (params.verdict) cleanParams.verdict = params.verdict;
  if (params.is_anomaly !== null && params.is_anomaly !== undefined)
    cleanParams.is_anomaly = params.is_anomaly;

  const { data } = await apiClient.get<PaginatedAnalysesResponse>('/api/v1/analyses', {
    params: cleanParams,
  });
  return data;
};

export const getAnalysisById = async (id: number): Promise<AnalysisRecord> => {
  const { data } = await apiClient.get<AnalysisRecord>(`/api/v1/analyses/${id}`);
  return data;
};

export const getOrderHistory = async (
  orderId: string,
  limit = 50
): Promise<OrderHistoryResponse> => {
  const { data } = await apiClient.get<OrderHistoryResponse>(
    `/api/v1/orders/${encodeURIComponent(orderId)}/analyses`,
    { params: { limit } }
  );
  return data;
};
