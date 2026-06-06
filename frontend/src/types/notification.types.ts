export type NotificationType =
  | 'SCHEDULE_CREATED'
  | 'SCHEDULE_UPDATED'
  | 'SCHEDULE_DELETED'
  | 'SCHEDULE_REMINDER';

export interface Notification {
  id: number;
  groupId: number;
  groupName: string;
  scheduleId: number;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface UnreadCount {
  unreadCount: number;
}
