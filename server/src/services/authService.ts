/**
 * Auth Service - User registration, login, logout
 */

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, execute } from '../db';
import { generateTokens } from '../middleware/auth';
import { auditLog } from '../middleware/audit';
import { AuthRequest } from '../middleware/auth';

export interface User {
  id: string;
  phone: string;
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
  created_at: string;
}

export interface PublicUser {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  role: string;
  referralCode: string;
  kycStatus: string;
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
        return { success: false, error: 'Tài khoản đã bị khóa' };
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return { success: false, error: 'Số điện thoại hoặc mật khẩu không đúng' };
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
    ] = await Promise.all([
      queryOne<{ count: string }>('SELECT COUNT(*) as count FROM users'),
      queryOne<{ count: string }>('SELECT COUNT(*) as count FROM users WHERE status = $1', ['active']),
      queryOne<{ total: string }>('SELECT COALESCE(SUM(amount), 0) as total FROM investments WHERE status = $1', ['active']),
      queryOne<{ count: string }>('SELECT COUNT(*) as count FROM transactions WHERE type = $1 AND status = $2', ['deposit', 'pending']),
      queryOne<{ count: string }>('SELECT COUNT(*) as count FROM transactions WHERE type = $1 AND status = $2', ['withdraw', 'pending']),
    ]);

    return {
      totalUsers: parseInt(totalRes?.count || '0'),
      activeUsers: parseInt(activeRes?.count || '0'),
      totalInvestment: parseFloat(investRes?.total || '0'),
      totalProfit: 0,
      pendingDeposits: parseInt(pendingDep?.count || '0'),
      pendingWithdrawals: parseInt(pendingWd?.count || '0'),
      todayRevenue: 0,
    };
  },
};
