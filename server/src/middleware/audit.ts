/**
 * Audit Logger Middleware & Utility
 */

import { query } from '../db';
import { AuthRequest } from './auth';

export type AuditAction =
  // Auth lifecycle
  | 'login'
  | 'login_failed'
  | 'login_locked'
  | 'logout'
  | 'register'
  | 'password_changed'
  | 'profile_updated'
  // Wallet / deposits
  | 'deposit_request'
  | 'deposit_approved'
  | 'deposit_rejected'
  // Wallet / withdrawals
  | 'withdraw_request'
  | 'withdraw_approved'
  | 'withdraw_rejected'
  // Investments
  | 'investment_created'
  | 'investment_completed'
  | 'daily_profit_credited'
  | 'reinvestment_executed'
  // Admin manual adjustments
  | 'balance_adjusted'
  // KYC
  | 'kyc_submitted'
  | 'kyc_approved'
  | 'kyc_rejected'
  // User management
  | 'user_status_changed'
  | 'user_role_changed'
  | 'user_permissions_changed'
  // Referrals
  | 'referral_bonus_credited'
  | 'referral_bonus_claimed'
  // News
  | 'news_created'
  | 'news_updated'
  | 'news_deleted'
  // Packages
  | 'package_created'
  | 'package_updated'
  | 'package_status_changed'
  // Notifications
  | 'notification_broadcast'
  // Chat
  | 'chat_closed'
  // Admin management
  | 'admin_created'
  | 'admin_updated'
  // System / cron
  | 'cron_profit_run'
  | 'settings_updated';

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
