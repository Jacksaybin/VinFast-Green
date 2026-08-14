/**
 * Audit Service - Read audit logs
 */

import { query, queryOne } from '../db';

export const auditService = {
  async getLogs(page = 1, limit = 50, action?: string, userId?: string) {
    const offset = (page - 1) * limit;
    const params: any[] = [];
    const conditions: string[] = [];

    if (action) {
      params.push(action);
      conditions.push(`action = $${params.length}`);
    }
    if (userId) {
      params.push(userId);
      conditions.push(`user_id = $${params.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const total = (await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM audit_logs ${where}`,
      params
    ))?.count || '0';

    params.push(limit, offset);
    const logs = await query(
      `SELECT a.*, u.phone as user_phone, u.full_name as user_full_name
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       ${where}
       ORDER BY a.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return { logs, total: parseInt(total) };
  },

  async getStats() {
    const [total, recent24h, byAction] = await Promise.all([
      queryOne<{ count: string }>('SELECT COUNT(*) as count FROM audit_logs'),
      queryOne<{ count: string }>(
        `SELECT COUNT(*) as count FROM audit_logs WHERE created_at > NOW() - INTERVAL '24 hours'`
      ),
      query(
        `SELECT action, COUNT(*)::int as count FROM audit_logs
         WHERE created_at > NOW() - INTERVAL '7 days'
         GROUP BY action ORDER BY count DESC LIMIT 10`
      ),
    ]);

    return {
      total: parseInt(total?.count || '0'),
      last24h: parseInt(recent24h?.count || '0'),
      byAction,
    };
  },
};
