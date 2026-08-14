/**
 * Wallet Service - Balance, deposits, withdrawals
 */

import { query, queryOne, execute, pool } from '../db';
import { auditLog } from '../middleware/audit';
import { AuthRequest } from '../middleware/auth';
import { notificationService } from './notificationService';
import { settingsService } from './settingsService';
import { investmentService } from './investmentService';

function ref(prefix: string): string {
  return `${prefix}${Date.now().toString(36).toUpperCase()}`;
}

async function getMinAmount(settingId: string, fallback: number): Promise<number> {
  try {
    const setting = await settingsService.get(settingId);
    if (setting?.value) {
      const parsed = JSON.parse(setting.value);
      return parseFloat(parsed.amount) || fallback;
    }
  } catch { /* fall through */ }
  return fallback;
}

export const walletService = {
  async getWallet(userId: string) {
    return queryOne<{ balance: string; locked_balance: string }>(
      'SELECT balance, locked_balance FROM wallets WHERE user_id = $1',
      [userId]
    );
  },

  async requestDeposit(
    userId: string,
    amount: number,
    description?: string,
    req?: AuthRequest
  ) {
    const minAmount = await getMinAmount('min_deposit', 100000);
    if (amount < minAmount) {
      return { success: false, error: `Số tiền nạp tối thiểu là ${minAmount.toLocaleString('vi-VN')} ₫` };
    }

    const reference = ref('DP');
    await query(
      `INSERT INTO transactions (user_id, type, amount, status, reference, description)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, 'deposit', amount, 'pending', reference, description || 'Yêu cầu nạp tiền']
    );

    await auditLog({
      userId,
      action: 'deposit_request',
      newData: { amount, reference },
      req,
    });

    return {
      success: true,
      reference,
      message: 'Yêu cầu nạp tiền đã được gửi. Vui lòng chờ admin duyệt.',
    };
  },

  async requestWithdraw(
    userId: string,
    amount: number,
    description?: string,
    req?: AuthRequest
  ) {
    const minAmount = await getMinAmount('min_withdraw', 100000);
    if (amount < minAmount) {
      return { success: false, error: `Số tiền rút tối thiểu là ${minAmount.toLocaleString('vi-VN')} ₫` };
    }

    const wallet = await this.getWallet(userId);
    const balance = parseFloat(wallet?.balance || '0');

    if (amount > balance) {
      return { success: false, error: 'Số dư không đủ' };
    }

    const reference = ref('WD');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE wallets SET balance = balance - $1, locked_balance = locked_balance + $1, updated_at = NOW()
         WHERE user_id = $2 AND balance >= $1`,
        [amount, userId]
      );

      await client.query(
        `INSERT INTO transactions (user_id, type, amount, status, reference, description)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, 'withdraw', amount, 'pending', reference, description || 'Yêu cầu rút tiền']
      );

      await client.query('COMMIT');

      await auditLog({
        userId,
        action: 'withdraw_request',
        newData: { amount, reference },
        req,
      });

      return { success: true, reference, message: 'Yêu cầu rút tiền đã được gửi.' };
    } catch (err) {
      await client.query('ROLLBACK');
      return { success: false, error: 'Lỗi xử lý, vui lòng thử lại' };
    } finally {
      client.release();
    }
  },

  async getTransactions(userId: string, type?: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const params: any[] = [userId];
    let where = 'WHERE user_id = $1';
    if (type) { params.push(type); where += ` AND type = $${params.length}`; }

    const total = (await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM transactions ${where}`, params
    ))?.count || '0';

    const transactions = await query(
      `SELECT * FROM transactions ${where}
       ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return { transactions, total: parseInt(total) };
  },

  async getAllPendingDeposits(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const total = (await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM transactions WHERE type = 'deposit' AND status = 'pending'`
    ))?.count || '0';

    const deposits = await query(
      `SELECT t.*, u.full_name, u.phone
       FROM transactions t
       JOIN users u ON t.user_id = u.id
       WHERE t.type = 'deposit' AND t.status = 'pending'
       ORDER BY t.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return { deposits, total: parseInt(total) };
  },

  async getAllPendingWithdrawals(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const total = (await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM transactions WHERE type = 'withdraw' AND status = 'pending'`
    ))?.count || '0';

    const withdrawals = await query(
      `SELECT t.*, u.full_name, u.phone
       FROM transactions t
       JOIN users u ON t.user_id = u.id
       WHERE t.type = 'withdraw' AND t.status = 'pending'
       ORDER BY t.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return { withdrawals, total: parseInt(total) };
  },

  async approveDeposit(transactionId: string, adminId: string, reason: string, req?: AuthRequest) {
    const tx = await queryOne<any>(
      `SELECT t.*, u.id as user_id FROM transactions t JOIN users u ON t.user_id = u.id WHERE t.id = $1`,
      [transactionId]
    );
    if (!tx) return { success: false, error: 'Không tìm thấy giao dịch' };
    if (tx.status !== 'pending') return { success: false, error: 'Giao dịch không ở trạng thái chờ duyệt' };

    const client = await pool.connect();
    let isFirstDeposit = false;
    try {
      await client.query('BEGIN');

      // Detect first completed deposit (count runs before this one flips to completed)
      const prior = await client.query<{ count: string }>(
        `SELECT COUNT(*)::text as count FROM transactions
         WHERE user_id = $1 AND type = 'deposit' AND status = 'completed'`,
        [tx.user_id]
      );
      isFirstDeposit = parseInt(prior?.rows?.[0]?.count || '0') === 0;

      await client.query(
        `UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE user_id = $2`,
        [tx.amount, tx.user_id]
      );

      await client.query(
        `UPDATE transactions
         SET status = 'completed', processed_by = $1, processed_at = NOW(), metadata = COALESCE(metadata, '{}'::jsonb) || $3::jsonb
         WHERE id = $2`,
        [adminId, transactionId, JSON.stringify({ reason, processed_at: new Date().toISOString() })]
      );

      // First completed deposit → credit referral commission to referrer(s)
      if (isFirstDeposit) {
        await investmentService.creditReferralCommissions(
          client,
          tx.user_id,
          parseFloat(tx.amount),
          tx.reference,
          'deposit'
        );
      }

      await client.query('COMMIT');

      await auditLog({
        userId: tx.user_id,
        action: 'deposit_approved',
        entityId: transactionId,
        newData: { amount: tx.amount, reason, firstDepositBonus: isFirstDeposit },
        req,
      });

      await notificationService.createNotification(
        tx.user_id,
        'Nạp tiền thành công',
        `Yêu cầu nạp ${parseFloat(tx.amount).toLocaleString('vi-VN')} ₫ đã được duyệt và cộng vào ví của bạn.`,
        'transaction',
        '/wallet'
      );

      return { success: true, message: 'Đã duyệt nạp tiền thành công' };
    } catch (err) {
      await client.query('ROLLBACK');
      return { success: false, error: 'Lỗi xử lý' };
    } finally {
      client.release();
    }
  },

  async rejectDeposit(transactionId: string, adminId: string, reason: string, req?: AuthRequest) {
    const tx = await queryOne<any>('SELECT * FROM transactions WHERE id = $1', [transactionId]);
    if (!tx) return { success: false, error: 'Không tìm thấy giao dịch' };
    if (tx.status !== 'pending') return { success: false, error: 'Giao dịch không ở trạng thái chờ duyệt' };

    await execute(
      `UPDATE transactions
       SET status = 'failed', processed_by = $1, processed_at = NOW(), metadata = COALESCE(metadata, '{}'::jsonb) || $3::jsonb
       WHERE id = $2`,
      [adminId, transactionId, JSON.stringify({ reason, processed_at: new Date().toISOString() })]
    );

    await auditLog({
      userId: tx.user_id,
      action: 'deposit_rejected',
      entityId: transactionId,
      newData: { amount: tx.amount, reason },
      req,
    });

    await notificationService.createNotification(
      tx.user_id,
      'Nạp tiền bị từ chối',
      `Yêu cầu nạp ${parseFloat(tx.amount).toLocaleString('vi-VN')} ₫ đã bị từ chối. Lý do: ${reason}`,
      'warning',
      '/wallet'
    );

    return { success: true, message: 'Đã từ chối yêu cầu nạp tiền' };
  },

  async approveWithdraw(transactionId: string, adminId: string, reason: string, req?: AuthRequest) {
    const tx = await queryOne<any>(
      `SELECT t.*, u.id as user_id FROM transactions t JOIN users u ON t.user_id = u.id WHERE t.id = $1`,
      [transactionId]
    );
    if (!tx) return { success: false, error: 'Không tìm thấy giao dịch' };
    if (tx.status !== 'pending') return { success: false, error: 'Giao dịch không ở trạng thái chờ duyệt' };

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE wallets SET locked_balance = GREATEST(0, locked_balance - $1), updated_at = NOW()
         WHERE user_id = $2`,
        [tx.amount, tx.user_id]
      );

      await client.query(
        `UPDATE transactions
         SET status = 'completed', processed_by = $1, processed_at = NOW(), metadata = COALESCE(metadata, '{}'::jsonb) || $3::jsonb
         WHERE id = $2`,
        [adminId, transactionId, JSON.stringify({ reason, processed_at: new Date().toISOString() })]
      );

      await client.query('COMMIT');

      await auditLog({
        userId: tx.user_id,
        action: 'withdraw_approved',
        entityId: transactionId,
        newData: { amount: tx.amount, reason },
        req,
      });

      await notificationService.createNotification(
        tx.user_id,
        'Rút tiền thành công',
        `Yêu cầu rút ${parseFloat(tx.amount).toLocaleString('vi-VN')} ₫ đã được duyệt. Tiền sẽ được chuyển về tài khoản ngân hàng của bạn.`,
        'transaction',
        '/wallet'
      );

      return { success: true, message: 'Đã duyệt rút tiền thành công' };
    } catch (err) {
      await client.query('ROLLBACK');
      return { success: false, error: 'Lỗi xử lý' };
    } finally {
      client.release();
    }
  },

  async rejectWithdraw(transactionId: string, adminId: string, reason: string, req?: AuthRequest) {
    const tx = await queryOne<any>('SELECT * FROM transactions WHERE id = $1', [transactionId]);
    if (!tx) return { success: false, error: 'Không tìm thấy giao dịch' };
    if (tx.status !== 'pending') return { success: false, error: 'Giao dịch không ở trạng thái chờ duyệt' };

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE wallets SET balance = balance + $1, locked_balance = GREATEST(0, locked_balance - $1), updated_at = NOW()
         WHERE user_id = $2`,
        [tx.amount, tx.user_id]
      );

      await client.query(
        `UPDATE transactions
         SET status = 'failed', processed_by = $1, processed_at = NOW(), metadata = COALESCE(metadata, '{}'::jsonb) || $4::jsonb
         WHERE id = $2`,
        [adminId, transactionId, JSON.stringify({ reason, processed_at: new Date().toISOString() })]
      );

      await client.query('COMMIT');

      await auditLog({
        userId: tx.user_id,
        action: 'withdraw_rejected',
        entityId: transactionId,
        newData: { amount: tx.amount, reason },
        req,
      });

      await notificationService.createNotification(
        tx.user_id,
        'Rút tiền bị từ chối',
        `Yêu cầu rút ${parseFloat(tx.amount).toLocaleString('vi-VN')} ₫ đã bị từ chối. Lý do: ${reason}. Số tiền đã được hoàn về ví.`,
        'warning',
        '/wallet'
      );

      return { success: true, message: 'Đã từ chối yêu cầu rút tiền' };
    } catch (err) {
      await client.query('ROLLBACK');
      return { success: false, error: 'Lỗi xử lý' };
    } finally {
      client.release();
    }
  },

  async bulkApproveDeposits(ids: string[], adminId: string, reason: string, req?: AuthRequest) {
    const processed: { id: string; ok: boolean; error?: string }[] = [];
    for (const id of ids) {
      const result = await this.approveDeposit(id, adminId, reason || 'Duyệt hàng loạt', req);
      processed.push({ id, ok: result.success, error: !result.success ? result.error : undefined });
    }
    return {
      success: true,
      processed,
      approved: processed.filter((p) => p.ok).length,
      failed: processed.filter((p) => !p.ok).length,
    };
  },

  async bulkRejectDeposits(ids: string[], adminId: string, reason: string, req?: AuthRequest) {
    const processed: { id: string; ok: boolean; error?: string }[] = [];
    for (const id of ids) {
      const result = await this.rejectDeposit(id, adminId, reason || 'Từ chối hàng loạt', req);
      processed.push({ id, ok: result.success, error: !result.success ? result.error : undefined });
    }
    return {
      success: true,
      processed,
      rejected: processed.filter((p) => p.ok).length,
      failed: processed.filter((p) => !p.ok).length,
    };
  },

  async bulkApproveWithdrawals(ids: string[], adminId: string, reason: string, req?: AuthRequest) {
    const processed: { id: string; ok: boolean; error?: string }[] = [];
    for (const id of ids) {
      const result = await this.approveWithdraw(id, adminId, reason || 'Duyệt hàng loạt', req);
      processed.push({ id, ok: result.success, error: !result.success ? result.error : undefined });
    }
    return {
      success: true,
      processed,
      approved: processed.filter((p) => p.ok).length,
      failed: processed.filter((p) => !p.ok).length,
    };
  },

  async bulkRejectWithdrawals(ids: string[], adminId: string, reason: string, req?: AuthRequest) {
    const processed: { id: string; ok: boolean; error?: string }[] = [];
    for (const id of ids) {
      const result = await this.rejectWithdraw(id, adminId, reason || 'Từ chối hàng loạt', req);
      processed.push({ id, ok: result.success, error: !result.success ? result.error : undefined });
    }
    return {
      success: true,
      processed,
      rejected: processed.filter((p) => p.ok).length,
      failed: processed.filter((p) => !p.ok).length,
    };
  },

  async adjustBalance(
    userId: string,
    amount: number,
    action: 'add' | 'subtract',
    note: string,
    adminId: string,
    req?: AuthRequest
  ) {
    const absAmount = Math.abs(amount);

    const wallet = await queryOne<{ balance: string }>(
      `SELECT balance FROM wallets WHERE user_id = $1 FOR UPDATE`,
      [userId]
    );
    if (!wallet) return { success: false, error: 'Không tìm thấy ví người dùng' };

    const oldBalance = parseFloat(wallet.balance);

    if (action === 'subtract' && oldBalance < absAmount) {
      return { success: false, error: `Số dư không đủ (hiện có ${oldBalance.toLocaleString('vi-VN')} ₫)` };
    }

    // Soft daily cap to mitigate fat-finger errors (100M/day per admin)
    const dailySum = await queryOne<{ sum: string }>(
      `SELECT COALESCE(SUM(amount), 0) as sum
       FROM transactions
       WHERE processed_by = $1
         AND type IN ('admin_credit', 'admin_debit')
         AND processed_at >= CURRENT_DATE`,
      [adminId]
    );
    const dailyTotal = parseFloat(dailySum?.sum || '0');
    if (dailyTotal + absAmount > 100_000_000) {
      return {
        success: false,
        error: `Bạn đã điều chỉnh ${dailyTotal.toLocaleString('vi-VN')} ₫ trong hôm nay. Giới hạn 100.000.000 ₫/ngày.`,
      };
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const type = action === 'add' ? 'admin_credit' : 'admin_debit';
      const reference = ref('ADJ');

      await client.query(
        `UPDATE wallets SET
           balance = ${action === 'add' ? 'balance + $1' : 'GREATEST(0, balance - $1)'},
           updated_at = NOW()
         WHERE user_id = $2`,
        [absAmount, userId]
      );

      const newBalance = action === 'add' ? oldBalance + absAmount : Math.max(0, oldBalance - absAmount);

      await client.query(
        `INSERT INTO transactions (user_id, type, amount, status, reference, description, processed_by, processed_at, metadata)
         VALUES ($1, $2, $3, 'completed', $4, $5, $6, NOW(), $7::jsonb)`,
        [
          userId,
          type,
          absAmount,
          reference,
          note,
          adminId,
          JSON.stringify({
            note,
            adminId,
            oldBalance,
            newBalance,
            action,
            processedAt: new Date().toISOString(),
          }),
        ]
      );

      await client.query('COMMIT');

      await auditLog({
        userId,
        action: 'balance_adjusted',
        entityId: reference,
        newData: { amount: absAmount, action, note, adminId, oldBalance, newBalance, dailyTotal: dailyTotal + absAmount },
        req,
      });

      await notificationService.createNotification(
        userId,
        action === 'add' ? 'Số dư được cộng' : 'Số dư bị trừ',
        `Admin đã ${action === 'add' ? 'cộng' : 'trừ'} ${absAmount.toLocaleString('vi-VN')} ₫ ${action === 'add' ? 'vào' : 'khỏi'} ví của bạn. Lý do: ${note}`,
        'transaction',
        '/wallet'
      );

      return { success: true, reference, oldBalance, newBalance };
    } catch (err) {
      await client.query('ROLLBACK');
      return { success: false, error: 'Lỗi xử lý' };
    } finally {
      client.release();
    }
  },

  async getAllTransactions(page = 1, limit = 20, type?: string) {
    const offset = (page - 1) * limit;
    const params: any[] = [limit, offset];
    let where = '';
    if (type) { params.push(type); where = `WHERE t.type = $${params.length}`; }

    const total = (await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM transactions t ${where}`, params.slice(0, -1)
    ))?.count || '0';

    const transactions = await query(
      `SELECT t.*, u.full_name, u.phone
       FROM transactions t
       JOIN users u ON t.user_id = u.id
       ${where}
       ORDER BY t.created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    );

    return { transactions, total: parseInt(total) };
  },
};
