import { apiClient, getAuthHeaders } from '../api/apiClient';

export const authService = {
  checkSession: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Pobiera profil zalogowanego użytkownika z endpointu /users/me.
  getOwnProfile: async (config = { withCredentials: true }) => {
    const response = await apiClient.get('/users/me', config);
    return response.data;
  },

  // Pobiera listę użytkowników (używane m.in. w widoku uczestników).
  getUsers: async (config = { withCredentials: true }) => {
    const response = await apiClient.get('/users', config);
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