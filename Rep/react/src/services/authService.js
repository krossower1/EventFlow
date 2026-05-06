import { apiClient } from '../api/apiClient';

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

  loginWithTwoFactor: async (login, password, code) => {
    const response = await apiClient.post('/auth/login-2fa', { login, password, code });
    return response.data;
  },

  getTwoFactorStatus: async () => {
    const response = await apiClient.get('/auth/2fa/status', { withCredentials: true });
    return response.data;
  },

  startTwoFactorSetup: async () => {
    const response = await apiClient.post('/auth/2fa/setup', {}, { withCredentials: true });
    return response.data;
  },

  enableTwoFactor: async (code) => {
    const response = await apiClient.post('/auth/2fa/enable', { code }, { withCredentials: true });
    return response.data;
  },

  disableTwoFactor: async (code) => {
    const response = await apiClient.post('/auth/2fa/disable', { code }, { withCredentials: true });
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