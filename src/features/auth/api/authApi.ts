import { api } from '@/lib/axios';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '@/types/auth';

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

/*
 * Profile (authenticated user)
 */

export interface UpdateProfilePayload {
  name: string;
  email: string;
  phoneNumber?: string | null;
  avatar?: File | null;
  removeAvatar?: boolean;
}

export const getProfile = async (): Promise<{ data: User }> => {
  const response = await api.get('/profile');
  return response.data;
};

export const updateProfile = async (payload: UpdateProfilePayload): Promise<{ data: User }> => {
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('email', payload.email);
  if (payload.phoneNumber !== undefined) {
    if (payload.phoneNumber === null) {
      formData.append('phoneNumber', '');
    } else {
      formData.append('phoneNumber', payload.phoneNumber);
    }
  }
  if (payload.removeAvatar) {
    formData.append('removeAvatar', '1');
  }
  if (payload.avatar) {
    formData.append('avatar', payload.avatar);
  }

  const response = await api.put('/profile', formData);
  return response.data;
};

export const updatePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ message: string }> => {
  const response = await api.put('/profile/password', payload);
  return response.data;
};
