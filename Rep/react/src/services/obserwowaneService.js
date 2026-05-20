import { apiClient, getAuthHeaders } from '../api/apiClient';

/**
 * Konfiguracja axios: zawsze withCredentials (sesja po odświeżeniu strony);
 * opcjonalnie Basic Auth, gdy login/hasło są jeszcze w pamięci po świeżym logowaniu.
 */
export const buildObservedRequestConfig = (authCredentials) => {
  const config = { withCredentials: true };
  if (authCredentials?.login && authCredentials?.password) {
    config.headers = getAuthHeaders(authCredentials.login, authCredentials.password);
  }
  return config;
};

/** GET /api/obserwowane — pełna lista {@link ObservedWydarzenieDto} dla ustawień. */
export const fetchObservedEvents = async (authCredentials) => {
  const response = await apiClient.get('/obserwowane', buildObservedRequestConfig(authCredentials));
  return Array.isArray(response.data) ? response.data : [];
};

/** GET /api/obserwowane/ids — same ID do szybkiego sprawdzenia na wielu kartach. */
export const fetchObservedEventIds = async (authCredentials) => {
  const response = await apiClient.get('/obserwowane/ids', buildObservedRequestConfig(authCredentials));
  return Array.isArray(response.data) ? response.data : [];
};

/** POST /api/obserwowane/{id} — dodanie wydarzenia (backend wymaga USER + status AKTYWNY). */
export const addObservedEventApi = async (authCredentials, wydarzenieId) => {
  await apiClient.post(`/obserwowane/${wydarzenieId}`, {}, buildObservedRequestConfig(authCredentials));
};

/** DELETE /api/obserwowane/{id} — usunięcie z obserwowanych. */
export const removeObservedEventApi = async (authCredentials, wydarzenieId) => {
  await apiClient.delete(`/obserwowane/${wydarzenieId}`, buildObservedRequestConfig(authCredentials));
};
