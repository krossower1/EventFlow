import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8081/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    // Ten nagłówek blokuje systemowe okienko logowania w przeglądarce!
    'X-Requested-With': 'XMLHttpRequest' 
  }
});

// Pomocnicza funkcja do generowania headera dla Basic Auth
export const getAuthHeaders = (login, password) => {
  const basicToken = btoa(`${login}:${password}`);
  return { Authorization: `Basic ${basicToken}` };
};