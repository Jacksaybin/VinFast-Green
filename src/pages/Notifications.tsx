/**
 * Trang thông báo in-app
 * Đã tinh chỉnh: token semantic 100%, dùng EmptyState + icon semantic thay emoji, lucide icons.
 */

import React from 'react';
import { ArrowLeft, Bell, CheckCheck, Circle, AlertCircle, CheckCircle2, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import PageHeader from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { NoNotifications } from '../assets/illustrations';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { formatDate } from '../lib/format';
import { cn } from '../lib/utils';

const TYPE_META = {
  info: { icon: AlertCircle, cls: 'bg-info-subtle text-info' },
  success: { icon: CheckCircle2, cls: 'bg-success-subtle text-success-strong' },
  warning: { icon: AlertCircle, cls: 'bg-warning-subtle text-warning-strong' },
  transaction: { icon: Wallet, cls: 'bg-primary/10 text-primary' },
} as const;

const Notifications: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user)!;
  const { getUserNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  const notifications = getUserNotifications(user.id);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClick = (id: string, link?: string) => {
    markAsRead(id);
    if (link) navigate(link);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <PageHeader
        title={t('notifications.title')}
        subtitle={`${unreadCount} ${t('notifications.markAllRead').toLowerCase()}`}
        onBack={() => navigate(-1)}
        rightAction={
          unreadCount > 0 ? (
            <button
              onClick={() => markAllAsRead(user.id)}
              className="flex items-center gap-1 whitespace-nowrap rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              aria-label={t('notifications.markAllRead')}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {t('notifications.markAllRead')}
            </button>
          ) : null
        }
      />

      <div className="px-4 pb-24">
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <EmptyState
              illustration={<NoNotifications size={140} />}
              title={t('notifications.empty')}
              description={t('notifications.empty')}
            />
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => {
              const meta = TYPE_META[notif.type] ?? TYPE_META.info;
              const Icon = meta.icon;
              return (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif.id, notif.link)}
                  className={cn(
                    'group flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover',
                    !notif.read && 'border-l-4 border-l-primary bg-primary/[0.03]',
                  )}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
                      meta.cls,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <p className={cn('font-semibold text-foreground', !notif.read && 'text-primary')}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <Circle className="mt-1 h-2 w-2 flex-shrink-0 fill-primary text-primary" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{notif.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDate(notif.createdAt)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Notifications;
