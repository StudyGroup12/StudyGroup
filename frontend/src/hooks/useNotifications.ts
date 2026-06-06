import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notification.api';

const PAGE_SIZE = 20;

export const useNotificationList = (page: number) => {
  const hasToken = !!sessionStorage.getItem('accessToken');
  return useQuery({
    queryKey: ['notifications', page],
    queryFn: () => fetchNotifications({ page, size: PAGE_SIZE }),
    enabled: hasToken,
  });
};

export const useUnreadNotificationCount = () => {
  const hasToken = !!sessionStorage.getItem('accessToken');
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => fetchUnreadCount(),
    enabled: hasToken,
    refetchInterval: 30_000,
  });
};

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: number) => markNotificationRead(notificationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
