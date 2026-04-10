import apiClient from './client';
import { AuthResponse, User } from '../types';

export const register = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', { name, email, password });
  return data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
  return data;
};

export const getMe = async (): Promise<{ user: User }> => {
  const { data } = await apiClient.get<{ user: User }>('/auth/me');
  return data;
};
