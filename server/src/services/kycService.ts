/**
 * KYC Service - Submit, approve, reject KYC documents
 */

import { query, queryOne, execute } from '../db';
import { auditLog } from '../middleware/audit';
import { AuthRequest } from '../middleware/auth';

export const kycService = {
  async submitKyc(
    userId: string,
    data: { frontImage: string; backImage: string },
    req?: AuthRequest
  ) {
    if (!data.frontImage || !data.backImage) {
      return { success: false, error: 'Vui lòng cung cấp ảnh CMND/CCCD mặt trước và sau' };
    }

    await execute(
      `UPDATE users SET kyc_status = 'pending', kyc_front_image = $1, kyc_back_image = $2, kyc_rejection_reason = NULL, updated_at = NOW()
       WHERE id = $3`,
      [data.frontImage, data.backImage, userId]
    );

    await auditLog({
      userId,
      action: 'kyc_submitted',
      req,
    });

    return { success: true, message: 'Đã gửi hồ sơ KYC, chờ admin duyệt' };
  },

  async getKycStatus(userId: string) {
    const user = await queryOne<any>(
      'SELECT kyc_status, kyc_rejection_reason, kyc_front_image, kyc_back_image, updated_at FROM users WHERE id = $1',
      [userId]
    );
    return user;
  },

  async getPendingKyc(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const total = (await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM users WHERE kyc_status = 'pending'`
    ))?.count || '0';

    const users = await query(
      `SELECT id, phone, full_name, email, kyc_front_image, kyc_back_image, created_at, updated_at
       FROM users WHERE kyc_status = 'pending'
       ORDER BY updated_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return { users, total: parseInt(total) };
  },

  async approveKyc(userId: string, adminId: string, req?: AuthRequest) {
    const count = await execute(
      `UPDATE users SET kyc_status = 'approved', kyc_rejection_reason = NULL, updated_at = NOW()
       WHERE id = $1 AND kyc_status = 'pending'`,
      [userId]
    );

    if (count === 0) return { success: false, error: 'Không tìm thấy hồ sơ KYC chờ duyệt' };

    await auditLog({
      userId,
      action: 'kyc_approved',
      entityId: userId,
      req,
    });

    return { success: true, message: 'Đã duyệt KYC' };
  },

  async rejectKyc(userId: string, reason: string, adminId: string, req?: AuthRequest) {
    if (!reason || reason.trim().length === 0) {
      return { success: false, error: 'Vui lòng nhập lý do từ chối' };
    }

    const count = await execute(
      `UPDATE users SET kyc_status = 'rejected', kyc_rejection_reason = $1, updated_at = NOW()
       WHERE id = $2`,
      [reason, userId]
    );

    if (count === 0) return { success: false, error: 'Không tìm thấy hồ sơ' };

    await auditLog({
      userId,
      action: 'kyc_rejected',
      entityId: userId,
      newData: { reason },
      req,
    });

    return { success: true, message: 'Đã từ chối KYC' };
  },
};
