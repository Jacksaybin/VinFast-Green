/**
 * Audit Logger Middleware & Utility
 */

import { query } from '../db';
import { AuthRequest } from './auth';

export type AuditAction =
  | 'login'
  | 'login_failed'
  | 'login_locked'
  | 'logout'
  | 'register'
  | 'password_changed'
  | 'deposit_request'
  | 'deposit_approved'
  | 'deposit_rejected'
  | 'withdraw_request'
  | 'withdraw_approved'
  | 'withdraw_rejected'
  | 'investment_created'
  | 'balance_adjusted'
  | 'kyc_submitted'
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'user_status_changed'
  | 'news_created'
  | 'news_updated'
  | 'news_deleted'
  | 'package_updated';

export interface AuditLogParams {
  userId?: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  oldData?: any;
  newData?: any;
  req?: AuthRequest;
}

export async function auditLog(params: AuditLogParams): Promise<void> {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_data, new_data, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        params.userId || null,
        params.action,
        params.entityType || null,
        params.entityId || null,
        params.oldData ? JSON.stringify(params.oldData) : null,
        params.newData ? JSON.stringify(params.newData) : null,
        params.req?.ip || null,
        params.req?.headers['user-agent'] || null,
      ]
    );
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}
