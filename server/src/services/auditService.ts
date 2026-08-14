/**
 * Audit Service - Read audit logs
 */

import { query, queryOne } from '../db';

export const auditService = {
  async getLogs(
    page = 1,
    limit = 50,
    action?: string,
    userId?: string,
    from?: string,
    to?: string,
    userSearch?: string
  ) {
    const offset = (page - 1) * limit;
    const { where, params } = buildWhere({ action, userId, userSearch, from, to });

    const total = (await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM audit_logs ${where}`,
      params
    ))?.count || '0';

    const paginatedParams = [...params, limit, offset];
    const logs = await query(
      `SELECT a.*, u.phone as user_phone, u.full_name as user_full_name
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       ${where}
       ORDER BY a.created_at DESC
       LIMIT $${paginatedParams.length - 1} OFFSET $${paginatedParams.length}`,
      paginatedParams
    );

    return { logs, total: parseInt(total) };
  },

  async getLogsForExport(
    action?: string,
    userId?: string,
    from?: string,
    to?: string,
    userSearch?: string
  ) {
    const { where, params } = buildWhere({ action, userId, userSearch, from, to });
    return query(
      `SELECT a.*, u.phone as user_phone, u.full_name as user_full_name
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       ${where}
       ORDER BY a.created_at DESC
       LIMIT 10000`,
      params
    );
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

function buildWhere(filters: {
  action?: string;
  userId?: string;
  userSearch?: string;
  from?: string;
  to?: string;
}) {
  const params: any[] = [];
  const conditions: string[] = [];

  if (filters.action) {
    params.push(filters.action);
    conditions.push(`a.action = $${params.length}`);
  }
  if (filters.userId) {
    params.push(filters.userId);
    conditions.push(`a.user_id = $${params.length}`);
  }
  if (filters.userSearch) {
    const like = `%${filters.userSearch.replace(/[%_]/g, '\\$&')}%`;
    params.push(like);
    conditions.push(
      `(a.user_id::text = $${params.length} OR a.user_id IN (SELECT id FROM users WHERE phone LIKE $${params.length} ESCAPE '\\' OR full_name ILIKE $${params.length}))`
    );
  }
  if (filters.from) {
    params.push(filters.from);
    const i = params.length;
    conditions.push(`a.created_at >= (CASE WHEN $${i} ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN $${i}::date ELSE $${i}::timestamptz END)`);
  }
  if (filters.to) {
    params.push(filters.to);
    const i = params.length;
    conditions.push(`a.created_at < (CASE WHEN $${i} ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN ($${i}::date + INTERVAL '1 day') ELSE $${i}::timestamptz END)`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}
