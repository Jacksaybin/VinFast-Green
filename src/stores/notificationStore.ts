/**
 * Store quản lý thông báo in-app
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'transaction';
  read: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (userId: string) => void;
  getUnreadCount: (userId: string) => number;
  getUserNotifications: (userId: string) => AppNotification[];
  seedWelcomeNotifications: (userId: string) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (notification) => {
        const item: AppNotification = {
          ...notification,
          id: `notif_${Date.now()}`,
          read: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ notifications: [item, ...state.notifications] }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllAsRead: (userId) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.userId === userId ? { ...n, read: true } : n
          ),
        }));
      },

      getUnreadCount: (userId) => {
        return get().notifications.filter((n) => n.userId === userId && !n.read).length;
      },

      getUserNotifications: (userId) => {
        return get()
          .notifications.filter((n) => n.userId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      seedWelcomeNotifications: (userId) => {
        const existing = get().notifications.some((n) => n.userId === userId);
        if (existing) return;

        const welcome: AppNotification[] = [
          {
            id: `notif_welcome_${userId}`,
            userId,
            title: 'Chào mừng đến V-GREEN',
            message: 'Tài khoản của bạn đã được kích hoạt. Bắt đầu khám phá các gói đầu tư ngay!',
            type: 'info',
            read: false,
            createdAt: new Date().toISOString(),
            link: '/investment',
          },
          {
            id: `notif_bonus_${userId}`,
            userId,
            title: 'Thưởng đặt lịch',
            message: 'Đầu tư gói VIC07 trước cuối tháng để nhận thưởng đặt lịch lên đến 5.7 tỷ VND.',
            type: 'warning',
            read: false,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            link: '/benefits',
          },
        ];

        set((state) => ({ notifications: [...welcome, ...state.notifications] }));
      },
    }),
    {
      name: 'vgreen-notifications',
    }
  )
);
