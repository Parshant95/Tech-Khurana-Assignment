import apiClient from './client';
import { AIParseResponse } from '../types';

export const parseJobDescription = async (jobDescription: string): Promise<AIParseResponse> => {
  const { data } = await apiClient.post<AIParseResponse>('/ai/parse', { jobDescription });
  return data;
};
