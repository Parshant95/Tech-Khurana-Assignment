import apiClient from './client';
import { Application } from '../types';

export const getApplications = async (): Promise<Application[]> => {
  const { data } = await apiClient.get<{ applications: Application[] }>('/applications');
  return data.applications;
};

export const createApplication = async (app: Partial<Application>): Promise<Application> => {
  const { data } = await apiClient.post<{ application: Application }>('/applications', app);
  return data.application;
};

export const updateApplication = async (
  id: string,
  app: Partial<Application>
): Promise<Application> => {
  const { data } = await apiClient.patch<{ application: Application }>(`/applications/${id}`, app);
  return data.application;
};

export const deleteApplication = async (id: string): Promise<void> => {
  await apiClient.delete(`/applications/${id}`);
};
