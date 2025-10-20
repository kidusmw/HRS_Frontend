import { api } from '@/lib/axios';
import type { LoginCredentials, RegisterData, AuthResponse } from '@/types/auth';

export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post('/register', data);
  return response.data;
};

export const verifyEmail = async (url: string): Promise<AuthResponse> => {
  const response = await api.get(url);
  return response.data;
};

export const loginUser = async (data: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/login', data);
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  await api.post('/logout');
};
