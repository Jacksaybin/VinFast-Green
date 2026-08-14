/**
 * Settings Service - Read/write system settings
 */

import { query, queryOne, execute } from '../db';

export const settingsService = {
  async getAll() {
    const rows = await query('SELECT * FROM settings ORDER BY id');
    return rows.map((row: any) => ({
      id: row.id,
      value: row.value,
      description: row.description,
      updatedAt: row.updated_at,
    }));
  },

  async get(id: string) {
    const row = await queryOne<any>('SELECT * FROM settings WHERE id = $1', [id]);
    if (!row) return null;
    return {
      id: row.id,
      value: row.value,
      description: row.description,
      updatedAt: row.updated_at,
    };
  },

  async upsert(id: string, value: any, description?: string) {
    const json = typeof value === 'string' ? value : JSON.stringify(value);
    await execute(
      `INSERT INTO settings (id, value, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET value = $2, description = COALESCE($3, settings.description), updated_at = NOW()`,
      [id, json, description || null]
    );
    return true;
  },

  async delete(id: string) {
    const count = await execute('DELETE FROM settings WHERE id = $1', [id]);
    return count > 0;
  },
};
