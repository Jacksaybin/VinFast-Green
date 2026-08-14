/**
 * JWT Authentication Middleware
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { queryOne } from '../db';

export interface JwtPayload {
  userId: string;
  phone: string;
  role: string;
  iat: number;
  exp: number;
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
  const accessToken = jwt.sign(
    { userId: user.id, phone: user.phone, role: user.role },
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
 * Admir roles check against the `users.permissions` JSONB column.
 */
export const PERMISSIONS = {
  DEPOSITS_APPROVE: 'deposits.approve',
  DEPOSITS_REJECT: 'deposits.reject',
  WITHDRAWALS_APPROVE: 'withdrawals.approve',
  WITHDRAWALS_REJECT: 'withdrawals.reject',
  WALLET_ADJUST: 'wallet.adjust',
  USERS_SUSPEND: 'users.suspend',
  USERS_EDIT: 'users.edit',
  PACKAGES_EDIT: 'packages.edit',
  NEWS_EDIT: 'news.edit',
  SETTINGS_EDIT: 'settings.edit',
  AUDIT_VIEW: 'audit.view',
} as const;

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
