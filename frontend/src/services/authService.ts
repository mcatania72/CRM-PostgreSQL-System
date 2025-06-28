import { apiClient } from './apiClient';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  firstName?: string;
  lastName?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  async getProfile(): Promise<any> {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  async updateProfile(data: any): Promise<any> {
    const response = await apiClient.put('/auth/profile', data);
    return response.data.user;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
  },

  async refreshToken(): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  }
};