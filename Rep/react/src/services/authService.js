import { apiClient, getAuthHeaders } from '../api/apiClient';

export const authService = {
  checkSession: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  login: async (login, password) => {
    const response = await apiClient.post('/auth/login', { login, password });
    return response.data;
  },

  register: async (data) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  verifyEmail: async (email, code) => {
    const response = await apiClient.post('/auth/verify-email', { email, code });
    return response.data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
  },

  deleteOwnAccount: async () => {
    const response = await apiClient.delete('/users/me', { withCredentials: true });
    return response.data;
  }
};