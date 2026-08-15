/**
 * JWT Authentication Middleware
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { queryOne } from '../db';
import { tokenBlacklist, userBlacklist } from './tokenBlacklist';

export interface JwtPayload {
  userId: string;
  phone: string;
  role: string;
  iat: number;
  exp: number;
  jti?: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production (≥16 chars)');
    }
    console.warn('[auth] JWT_SECRET missing or weak — using insecure dev fallback. DO NOT use in production.');
    return 'dev-only-insecure-jwt-secret-change-me';
  }
  return secret;
})();

export function generateTokens(user: { id: string; phone: string; role: string }) {
  const jti = crypto.randomUUID();

  const accessToken = jwt.sign(
    { userId: user.id, phone: user.phone, role: user.role, jti },
    JWT_SECRET,
    { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as any) || '30d' }
  );

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string; type: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (!payload?.userId || payload.type !== 'refresh') return null;
    return { userId: payload.userId, type: payload.type };
  } catch {
    return null;
  }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Check blacklist (logout trước đó, hoặc admin force-revoke)
  if (payload.jti && tokenBlacklist.has(payload.jti)) {
    return res.status(401).json({ error: 'Token đã bị thu hồi. Vui lòng đăng nhập lại.' });
  }

  // Check user-level block (admin suspend → all sessions dead)
  if (userBlacklist.isBlocked(payload.userId)) {
    return res.status(401).json({ error: 'Tài khoản đã bị tạm khoá. Vui lòng liên hệ hỗ trợ.' });
  }

  req.user = payload;
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}

/**
 * Permission keys (RBAC). Super admin always passes every permission.
 * Admin roles check against the `users.permissions` JSONB column.
 *
 * Naming convention: <resource>.<action>
 *  - *_VIEW: chỉ xem (read-only)
 *  - *_EDIT: tạo/sửa/xóa
 *  - *_APPROVE / *_REJECT: duyệt/từ chối yêu cầu
 */
export const PERMISSIONS = {
  // Wallet / deposits / withdrawals
  DEPOSITS_VIEW: 'deposits.view',
  DEPOSITS_APPROVE: 'deposits.approve',
  DEPOSITS_REJECT: 'deposits.reject',
  WITHDRAWALS_VIEW: 'withdrawals.view',
  WITHDRAWALS_APPROVE: 'withdrawals.approve',
  WITHDRAWALS_REJECT: 'withdrawals.reject',
  WALLET_ADJUST: 'wallet.adjust',
  TRANSACTIONS_VIEW: 'transactions.view',

  // Users
  USERS_VIEW: 'users.view',
  USERS_SUSPEND: 'users.suspend',
  USERS_EDIT: 'users.edit',

  // Investments / packages
  PACKAGES_VIEW: 'packages.view',
  PACKAGES_EDIT: 'packages.edit',
  INVESTMENTS_VIEW: 'investments.view',

  // News
  NEWS_VIEW: 'news.view',
  NEWS_EDIT: 'news.edit',

  // Notifications
  NOTIFICATIONS_VIEW: 'notifications.view',
  NOTIFICATIONS_BROADCAST: 'notifications.broadcast',

  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',

  // Chat
  CHAT_VIEW: 'chat.view',
  CHAT_REPLY: 'chat.reply',

  // KYC
  KYC_VIEW: 'kyc.view',
  KYC_APPROVE: 'kyc.approve',
  KYC_REJECT: 'kyc.reject',

  // Audit & system
  AUDIT_VIEW: 'audit.view',
  AUDIT_EXPORT: 'audit.export',
  CRON_RUN: 'cron.run',

  // Admin management (super_admin only by route, key reserved for future fine-grained control)
  ADMINS_VIEW: 'admins.view',
  ADMINS_EDIT: 'admins.edit',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Default permission set granted to a newly promoted `admin` role.
 * Super admin always bypasses these checks.
 */
export const DEFAULT_ADMIN_PERMISSIONS: Record<string, boolean> = {
  [PERMISSIONS.DEPOSITS_VIEW]: true,
  [PERMISSIONS.DEPOSITS_APPROVE]: true,
  [PERMISSIONS.DEPOSITS_REJECT]: true,
  [PERMISSIONS.WITHDRAWALS_VIEW]: true,
  [PERMISSIONS.WITHDRAWALS_APPROVE]: true,
  [PERMISSIONS.WITHDRAWALS_REJECT]: true,
  [PERMISSIONS.WALLET_ADJUST]: true,
  [PERMISSIONS.TRANSACTIONS_VIEW]: true,
  [PERMISSIONS.USERS_VIEW]: true,
  [PERMISSIONS.USERS_SUSPEND]: true,
  [PERMISSIONS.PACKAGES_VIEW]: true,
  [PERMISSIONS.PACKAGES_EDIT]: true,
  [PERMISSIONS.INVESTMENTS_VIEW]: true,
  [PERMISSIONS.NEWS_VIEW]: true,
  [PERMISSIONS.NEWS_EDIT]: true,
  [PERMISSIONS.NOTIFICATIONS_VIEW]: true,
  [PERMISSIONS.NOTIFICATIONS_BROADCAST]: true,
  [PERMISSIONS.SETTINGS_VIEW]: true,
  [PERMISSIONS.SETTINGS_EDIT]: true,
  [PERMISSIONS.CHAT_VIEW]: true,
  [PERMISSIONS.CHAT_REPLY]: true,
  [PERMISSIONS.KYC_VIEW]: true,
  [PERMISSIONS.KYC_APPROVE]: true,
  [PERMISSIONS.KYC_REJECT]: true,
  [PERMISSIONS.AUDIT_VIEW]: true,
  [PERMISSIONS.AUDIT_EXPORT]: true,
  [PERMISSIONS.CRON_RUN]: true,
};

export function requirePermission(permission: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

      // Super admin bypasses all permission checks
      if (req.user.role === 'super_admin') return next();

      const row = await queryOne<{ role: string; permissions: any }>(
        'SELECT role, permissions FROM users WHERE id = $1',
        [req.user.userId]
      );
      if (!row || (row.role !== 'admin' && row.role !== 'super_admin')) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const perms = row.permissions || {};
      if (perms[permission] === true) return next();

      return res.status(403).json({ error: `Bạn không có quyền: ${permission}` });
    } catch (err) {
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
}

/**
 * Accepts requests with or without a valid Bearer token.
 * Attaches req.user when a valid token is present, never rejects.
 */
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const payload = verifyAccessToken(authHeader.slice(7));
    if (payload) {
      req.user = payload;
    }
  }

  next();
}

/**
 * Alias cho requireAuth — dùng bởi các route legacy (referrals, reinvestments)
 */
export const authMiddleware = requireAuth;
