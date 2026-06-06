import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationList,
  useUnreadNotificationCount,
} from '../../hooks/useNotifications';
import { Notification } from '../../types/notification.types';
import './Notification.css';

const NotificationPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const hasToken = !!sessionStorage.getItem('accessToken');

  const listQuery = useNotificationList(page);
  const unreadQuery = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  if (!hasToken) {
    return (
      <div className="empty-state">
        로그인 후 알림을 확인할 수 있습니다.
        <div className="group-form-actions">
          <Link to="/login" className="button button-primary">로그인</Link>
        </div>
      </div>
    );
  }

  const list = listQuery.data?.data;
  const items = list?.content ?? [];
  const unreadCount = unreadQuery.data?.data.unreadCount ?? 0;

  const handleClick = (n: Notification) => {
    if (!n.read) markRead.mutate(n.id);
    if (n.type !== 'SCHEDULE_DELETED') {
      navigate(`/groups/${n.groupId}/schedules/${n.scheduleId}`);
    }
  };

  return (
    <section className="notification-page">
      <div className="notification-toolbar">
        <h1 style={{ margin: 0 }}>
          알림 {unreadCount > 0 && <span style={{ color: '#cf222e' }}>({unreadCount})</span>}
        </h1>
        <button
          type="button"
          className="button"
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending || unreadCount === 0}
        >
          모두 읽음
        </button>
      </div>

      {listQuery.isLoading && <div className="loading-state">알림을 불러오는 중입니다.</div>}
      {listQuery.isError && <div className="error-state">알림을 불러오지 못했습니다.</div>}
      {!listQuery.isLoading && !listQuery.isError && items.length === 0 && (
        <div className="empty-state">받은 알림이 없습니다.</div>
      )}

      {items.length > 0 && (
        <ul className="notification-list">
          {items.map((n) => (
            <li
              key={n.id}
              className={`notification-item ${n.read ? '' : 'unread'}`}
              onClick={() => handleClick(n)}
            >
              <span className={`notification-group-badge ${n.type}`}>{n.groupName}</span>
              <span className="notification-divider">|</span>
              <span className="notification-message">{n.message}</span>
            </li>
          ))}
        </ul>
      )}

      {list && list.totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            className="button"
            onClick={() => setPage((c) => Math.max(c - 1, 0))}
            disabled={list.first}
          >
            이전
          </button>
          <span>{list.number + 1} / {list.totalPages}</span>
          <button
            type="button"
            className="button"
            onClick={() => setPage((c) => c + 1)}
            disabled={list.last}
          >
            다음
          </button>
        </div>
      )}
    </section>
  );
};

export default NotificationPage;
