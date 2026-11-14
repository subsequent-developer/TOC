import apiClient from './client';
import type { LivenessResponse, ReadinessResponse } from '../types/analysis';

export const getLiveness = async (): Promise<LivenessResponse> => {
  const { data } = await apiClient.get<LivenessResponse>('/health');
  return data;
};

export const getReadiness = async (): Promise<ReadinessResponse> => {
  const { data } = await apiClient.get<ReadinessResponse>('/api/v1/health/ready');
  return data;
};
