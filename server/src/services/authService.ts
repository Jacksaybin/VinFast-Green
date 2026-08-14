/**
 * Auth Service - User registration, login, logout
 */

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, execute } from '../db';
import { generateTokens } from '../middleware/auth';
import { auditLog } from '../middleware/audit';
import { AuthRequest } from '../middleware/auth';
import { awardSignupBonus } from '../routes/referrals';

export interface User {
  id: string;
  phone: string;
  password_hash: string;
  full_name: string;
  email: string | null;
  role: string;
  status: string;
  referral_code: string;
  referred_by: string | null;
  kyc_status: string;
  bank_account: string | null;
  bank_name: string | null;
  bank_branch: string | null;
  failed_login_count: number;
  locked_until: string | null;
  created_at: string;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

export interface PublicUser {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  role: string;
  referralCode: string;
  kycStatus: string;
  bankAccount: string | null;
  bankName: string | null;
  bankBranch: string | null;
  createdAt: string;
}

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    fullName: user.full_name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    referralCode: user.referral_code,
    kycStatus: user.kyc_status,
    bankAccount: user.bank_account,
    bankName: user.bank_name,
    bankBranch: user.bank_branch,
    createdAt: user.created_at,
  };
}

export const authService = {
  async register(
    phone: string,
    password: string,
    fullName: string,
    referralCode?: string
  ): Promise<{ success: boolean; user?: PublicUser; tokens?: any; error?: string }> {
    try {
      const existing = await queryOne<User>(
        'SELECT id FROM users WHERE phone = $1',
        [phone]
      );

      if (existing) {
        return { success: false, error: 'Số điện thoại đã được đăng ký' };
      }

      if (referralCode) {
        const referrer = await queryOne<User>(
          'SELECT id FROM users WHERE referral_code = $1',
          [referralCode.toUpperCase()]
        );
        if (!referrer) {
          return { success: false, error: 'Mã giới thiệu không hợp lệ' };
        }
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const referralId = referralCode
        ? (await queryOne<{ id: string }>('SELECT id FROM users WHERE referral_code = $1', [referralCode.toUpperCase()]))?.id
        : null;

      const result = await queryOne<User>(
        `INSERT INTO users (phone, password_hash, full_name, referred_by)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [phone, passwordHash, fullName, referralId]
      );

      if (!result) {
        return { success: false, error: 'Đăng ký thất bại' };
      }

      const user = await queryOne<User>('SELECT * FROM users WHERE id = $1', [result.id]);
      if (!user) return { success: false, error: 'Lỗi truy vấn user' };

      const tokens = generateTokens({ id: user.id, phone: user.phone, role: user.role });

      await auditLog({
        userId: user.id,
        action: 'register',
        newData: { phone: user.phone, fullName: user.full_name },
      });

      // Award referral signup bonus to referrer (if any)
      if (referralId) {
        await awardSignupBonus(referralId, user.id);
      }

      return {
        success: true,
        user: toPublicUser(user),
        tokens,
      };
    } catch (err: any) {
      if (err.code === '23505') {
        return { success: false, error: 'Số điện thoại đã được đăng ký' };
      }
      console.error('Register error:', err);
      return { success: false, error: 'Lỗi server, vui lòng thử lại' };
    }
  },

  async login(
    phone: string,
    password: string,
    req?: AuthRequest
  ): Promise<{ success: boolean; user?: PublicUser; tokens?: any; error?: string }> {
    try {
      const user = await queryOne<User>(
        'SELECT * FROM users WHERE phone = $1',
        [phone]
      );

      if (!user) {
        return { success: false, error: 'Số điện thoại hoặc mật khẩu không đúng' };
      }

      if (user.status === 'suspended') {
        return { success: false, error: 'Tài khoản đã bị khóa, vui lòng liên hệ admin' };
      }

      // Account lockout check
      if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
        const minutes = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60_000);
        return {
          success: false,
          error: `Tài khoản tạm thời bị khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau ${minutes} phút.`,
        };
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        // Increment failed login counter and lock if needed
        const newCount = (user.failed_login_count || 0) + 1;
        const shouldLock = newCount >= MAX_FAILED_ATTEMPTS;
        await execute(
          `UPDATE users SET failed_login_count = $1, locked_until = $2 WHERE id = $3`,
          [
            newCount,
            shouldLock ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60_000).toISOString() : user.locked_until,
            user.id,
          ]
        );

        await auditLog({
          userId: user.id,
          action: shouldLock ? 'login_locked' : 'login_failed',
          req,
        });

        if (shouldLock) {
          return {
            success: false,
            error: `Đăng nhập sai quá nhiều lần. Tài khoản tạm khóa ${LOCK_DURATION_MINUTES} phút.`,
          };
        }
        return { success: false, error: 'Số điện thoại hoặc mật khẩu không đúng' };
      }

      // Successful login: reset counter
      if (user.failed_login_count > 0 || user.locked_until) {
        await execute(
          `UPDATE users SET failed_login_count = 0, locked_until = NULL WHERE id = $1`,
          [user.id]
        );
      }

      const tokens = generateTokens({ id: user.id, phone: user.phone, role: user.role });

      await auditLog({
        userId: user.id,
        action: 'login',
        req,
      });

      return {
        success: true,
        user: toPublicUser(user),
        tokens,
      };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Lỗi server, vui lòng thử lại' };
    }
  },

  async getProfile(userId: string): Promise<PublicUser | null> {
    const user = await queryOne<User>('SELECT * FROM users WHERE id = $1', [userId]);
    return user ? toPublicUser(user) : null;
  },

  async updateProfile(
    userId: string,
    data: { fullName?: string; email?: string; bankAccount?: string; bankName?: string; bankBranch?: string }
  ): Promise<PublicUser | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.fullName !== undefined) { fields.push(`full_name = $${idx++}`); values.push(data.fullName); }
    if (data.email !== undefined) { fields.push(`email = $${idx++}`); values.push(data.email); }
    if (data.bankAccount !== undefined) { fields.push(`bank_account = $${idx++}`); values.push(data.bankAccount); }
    if (data.bankName !== undefined) { fields.push(`bank_name = $${idx++}`); values.push(data.bankName); }
    if (data.bankBranch !== undefined) { fields.push(`bank_branch = $${idx++}`); values.push(data.bankBranch); }

    if (fields.length === 0) {
      return this.getProfile(userId);
    }

    values.push(userId);
    const user = await queryOne<User>(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    return user ? toPublicUser(user) : null;
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    const user = await queryOne<User>('SELECT * FROM users WHERE id = $1', [userId]);
    if (!user) return { success: false, error: 'Không tìm thấy người dùng' };

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return { success: false, error: 'Mật khẩu hiện tại không đúng' };

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await execute('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, userId]);

    await auditLog({ userId, action: 'password_changed' });

    return { success: true };
  },

  async getReferrals(userId: string) {
    const [referred, commission] = await Promise.all([
      query(
        `SELECT id, full_name, phone, created_at, status
         FROM users WHERE referred_by = $1 ORDER BY created_at DESC`,
        [userId]
      ),
      query(
        `SELECT COALESCE(SUM(amount), 0)::float as total_commission,
                COUNT(*)::int as commission_count
         FROM transactions
         WHERE user_id = $1 AND type = 'referral' AND status = 'completed'`,
        [userId]
      ),
    ]);

    return {
      referred: referred.map((r: any) => ({
        id: r.id,
        fullName: r.full_name,
        phone: r.phone,
        createdAt: r.created_at,
        status: r.status,
      })),
      totalCommission: parseFloat(commission?.[0]?.total_commission || '0'),
      commissionCount: parseInt(commission?.[0]?.commission_count || '0'),
    };
  },

  async getAllUsers(page = 1, limit = 20): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * limit;
    const total = (await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM users'))?.count || '0';
    const users = await query<User>(
      `SELECT id, phone, full_name, email, role, status, referral_code, referred_by, kyc_status, created_at
       FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return { users, total: parseInt(total) };
  },

  async getAdmins(): Promise<{ users: any[]; total: number }> {
    const admins = await query(
      `SELECT id, phone, full_name, email, role, status, permissions
       FROM users
       WHERE role IN ('admin', 'super_admin')
       ORDER BY created_at DESC`
    );
    return {
      users: admins.map((a: any) => ({
        id: a.id,
        phone: a.phone,
        fullName: a.full_name,
        email: a.email,
        role: a.role,
        status: a.status,
        permissions: a.permissions || {},
      })),
      total: admins.length,
    };
  },

  async updateAdmin(
    adminId: string,
    data: { role?: 'admin' | 'super_admin'; permissions?: Record<string, boolean> }
  ): Promise<boolean> {
    if (data.role !== undefined) {
      await execute('UPDATE users SET role = $1 WHERE id = $2', [data.role, adminId]);
    }
    if (data.permissions !== undefined) {
      await execute('UPDATE users SET permissions = $1 WHERE id = $2', [JSON.stringify(data.permissions), adminId]);
    }
    await auditLog({ action: 'admin_updated', entityId: adminId, newData: data });
    return true;
  },

  async updateUserStatus(
    userId: string,
    status: 'active' | 'suspended'
  ): Promise<boolean> {
    const count = await execute(
      'UPDATE users SET status = $1 WHERE id = $2',
      [status, userId]
    );
    return count > 0;
  },

  async getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalInvestment: number;
    totalProfit: number;
    pendingDeposits: number;
    pendingWithdrawals: number;
    todayRevenue: number;
  }> {
    const [
      totalRes,
      activeRes,
      investRes,
      pendingDep,
      pendingWd,
      profitRes,
      revenueRes,
    ] = await Promise.all([
      queryOne<{ count: string }>('SELECT COUNT(*) as count FROM users'),
      queryOne<{ count: string }>('SELECT COUNT(*) as count FROM users WHERE status = $1', ['active']),
      queryOne<{ total: string }>('SELECT COALESCE(SUM(amount), 0) as total FROM investments WHERE status = $1', ['active']),
      queryOne<{ count: string }>('SELECT COUNT(*) as count FROM transactions WHERE type = $1 AND status = $2', ['deposit', 'pending']),
      queryOne<{ count: string }>('SELECT COUNT(*) as count FROM transactions WHERE type = $1 AND status = $2', ['withdraw', 'pending']),
      queryOne<{ total: string }>('SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = $1 AND status = $2', ['profit', 'completed']),
      queryOne<{ total: string }>('SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = $1 AND status = $2 AND created_at::date = CURRENT_DATE', ['profit', 'completed']),
    ]);

    return {
      totalUsers: parseInt(totalRes?.count || '0'),
      activeUsers: parseInt(activeRes?.count || '0'),
      totalInvestment: parseFloat(investRes?.total || '0'),
      totalProfit: parseFloat(profitRes?.total || '0'),
      pendingDeposits: parseInt(pendingDep?.count || '0'),
      pendingWithdrawals: parseInt(pendingWd?.count || '0'),
      todayRevenue: parseFloat(revenueRes?.total || '0'),
    };
  },
};
