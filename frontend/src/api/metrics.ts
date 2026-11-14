import apiClient from './client';
import type { DatabaseSummaryMetrics } from '../types/analysis';

export const getSummaryMetrics = async (): Promise<DatabaseSummaryMetrics> => {
  const { data } = await apiClient.get<DatabaseSummaryMetrics>('/api/v1/metrics');
  return data;
};
