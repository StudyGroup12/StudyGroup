import api from './axios';
import { ApiResponse } from '../types/auth.types';
import { PageResponse } from '../types/group.types';
import { Notification, UnreadCount } from '../types/notification.types';

interface NotificationListParams {
  page?: number;
  size?: number;
}

export const fetchNotifications = async (
  params: NotificationListParams = {}
): Promise<ApiResponse<PageResponse<Notification>>> => {
  const response = await api.get('/api/notifications', { params });
  return response.data;
};

export const fetchUnreadCount = async (): Promise<ApiResponse<UnreadCount>> => {
  const response = await api.get('/api/notifications/unread-count');
  return response.data;
};

export const markNotificationRead = async (
  notificationId: number
): Promise<ApiResponse<Notification>> => {
  const response = await api.put(`/api/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsRead = async (): Promise<
  ApiResponse<{ updated: number }>
> => {
  const response = await api.put('/api/notifications/read-all');
  return response.data;
};
