import { apiClient } from '../api/apiClient';

const withAuth = (authCredentials) => {
  const config = { withCredentials: true };
  if (authCredentials?.login && authCredentials?.password) {
    config.headers = { Authorization: `Basic ${btoa(`${authCredentials.login}:${authCredentials.password}`)}` };
  }
  return config;
};

export const getNotificationSettings = async (authCredentials) => {
  const response = await apiClient.get('/users/me/notification-settings', withAuth(authCredentials));
  return response.data;
};

export const updateNotificationSettings = async (authCredentials, payload) => {
  const response = await apiClient.put('/users/me/notification-settings', payload, withAuth(authCredentials));
  return response.data;
};

export const getNotifications = async (authCredentials, limit = 30) => {
  const response = await apiClient.get('/users/me/notifications', {
    ...withAuth(authCredentials),
    params: { limit },
  });
  return response.data;
};

export const getUnreadNotificationsCount = async (authCredentials) => {
  const response = await apiClient.get('/users/me/notifications/unread-count', withAuth(authCredentials));
  return response.data;
};

export const markNotificationAsRead = async (authCredentials, notificationId) => {
  const response = await apiClient.put(
    `/users/me/notifications/${notificationId}/read`,
    {},
    withAuth(authCredentials)
  );
  return response.data;
};

export const markAllNotificationsAsRead = async (authCredentials) => {
  await apiClient.put('/users/me/notifications/read-all', {}, withAuth(authCredentials));
};

export const deleteNotification = async (authCredentials, notificationId) => {
  await apiClient.delete(
    `/users/me/notifications/${notificationId}`,
    withAuth(authCredentials)
  );
};

export const deleteAllNotifications = async (authCredentials) => {
  await apiClient.delete('/users/me/notifications', withAuth(authCredentials));
};
