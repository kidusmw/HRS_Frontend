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

export const getGoogleRedirectUrl = async (): Promise<{ redirect_url: string }> => {
  const response = await api.get('/auth/google/redirect');
  return response.data;
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const response = await api.post('/password/forgot', { email });
  return response.data;
};

export const resetPassword = async (data: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<{ message: string }> => {
  const response = await api.post('/password/reset', data);
  return response.data;
};
