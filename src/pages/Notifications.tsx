/**
 * Trang thông báo in-app
 */

import React from 'react';
import { ArrowLeft, Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { formatDate } from '../lib/format';

const TYPE_ICONS = {
  info: '🔵',
  success: '✅',
  warning: '⚠️',
  transaction: '💰',
};

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user)!;
  const { getUserNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  const notifications = getUserNotifications(user.id);

  const handleClick = (id: string, link?: string) => {
    markAsRead(id);
    if (link) navigate(link);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="px-4 py-4 pb-24">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
          {notifications.some((n) => !n.read) && (
            <button
              onClick={() => markAllAsRead(user.id)}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <CheckCheck className="w-4 h-4" />
              Đánh dấu đã đọc
            </button>
          )}
        </div>

        <h1 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
          <Bell className="w-6 h-6" />
          Thông báo
        </h1>

        {notifications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Không có thông báo nào</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleClick(notif.id, notif.link)}
                className={`w-full text-left bg-card rounded-xl shadow-card p-4 transition-colors hover:bg-background ${
                  !notif.read ? 'border-l-4 border-primary' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{TYPE_ICONS[notif.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold ${notif.read ? 'text-foreground' : 'text-foreground'}`}>
                      {notif.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{formatDate(notif.createdAt)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Notifications;
