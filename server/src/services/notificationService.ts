/**
 * Notification Service
 */

import { query, queryOne, execute } from '../db';

export const notificationService = {
  async getNotifications(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const total = (await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1',
      [userId]
    ))?.count || '0';

    const notifications = await query(
      `SELECT * FROM notifications WHERE user_id = $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return { notifications, total: parseInt(total) };
  },

  async getUnreadCount(userId: string): Promise<number> {
    const res = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    return parseInt(res?.count || '0');
  },

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const count = await execute(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    );
    return count > 0;
  },

  async markAllAsRead(userId: string): Promise<number> {
    const count = await execute(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    return count;
  },

  async createNotification(
    userId: string,
    title: string,
    message: string,
    type = 'info',
    link?: string
  ): Promise<void> {
    await execute(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, title, message, type, link]
    );
  },

  async broadcastNotification(
    title: string,
    message: string,
    type = 'info',
    link?: string,
    targetFilter?: { role?: string; kycStatus?: string }
  ): Promise<number> {
    const where: string[] = ["status = 'active'"];
    const params: any[] = [title, message, type, link || null];

    if (targetFilter?.role) {
      params.push(targetFilter.role);
      where.push(`role = $${params.length}`);
    }
    if (targetFilter?.kycStatus) {
      params.push(targetFilter.kycStatus);
      where.push(`kyc_status = $${params.length}`);
    }

    const count = await execute(
      `INSERT INTO notifications (user_id, title, message, type, link)
       SELECT id, $1, $2, $3, $4 FROM users WHERE ${where.join(' AND ')}`,
      params
    );
    return count;
  },
};
