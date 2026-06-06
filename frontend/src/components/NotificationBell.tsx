import { Link } from 'react-router-dom';
import { useUnreadNotificationCount } from '../hooks/useNotifications';
import './NotificationBell.css';

const NotificationBell = () => {
  const { data } = useUnreadNotificationCount();
  const count = data?.data.unreadCount ?? 0;

  return (
    <Link to="/notifications" className="nav-bell" aria-label="알림">
      <span className="nav-bell-icon">🔔</span>
      <span className="nav-bell-text">알림</span>
      {count > 0 && (
        <span className="nav-bell-badge">{count > 99 ? '99+' : count}</span>
      )}
    </Link>
  );
};

export default NotificationBell;
