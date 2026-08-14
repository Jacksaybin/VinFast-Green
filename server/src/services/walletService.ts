/**
 * Wallet Service - Balance, deposits, withdrawals
 */

import { query, queryOne, execute, pool } from '../db';
import { auditLog } from '../middleware/audit';
import { AuthRequest } from '../middleware/auth';

function ref(prefix: string): string {
  return `${prefix}${Date.now().toString(36).toUpperCase()}`;
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
    if (amount < 100000) {
      return { success: false, error: 'Số tiền nạp tối thiểu là 100.000 ₫' };
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
    if (amount < 100000) {
      return { success: false, error: 'Số tiền rút tối thiểu là 100.000 ₫' };
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

  async approveDeposit(transactionId: string, adminId: string, req?: AuthRequest) {
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
        `UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE user_id = $2`,
        [tx.amount, tx.user_id]
      );

      await client.query(
        `UPDATE transactions SET status = 'completed', processed_by = $1, processed_at = NOW() WHERE id = $2`,
        [adminId, transactionId]
      );

      await client.query('COMMIT');

      await auditLog({
        userId: tx.user_id,
        action: 'deposit_approved',
        entityId: transactionId,
        newData: { amount: tx.amount },
        req,
      });

      return { success: true, message: 'Đã duyệt nạp tiền thành công' };
    } catch (err) {
      await client.query('ROLLBACK');
      return { success: false, error: 'Lỗi xử lý' };
    } finally {
      client.release();
    }
  },

  async rejectDeposit(transactionId: string, adminId: string, req?: AuthRequest) {
    const tx = await queryOne<any>('SELECT * FROM transactions WHERE id = $1', [transactionId]);
    if (!tx) return { success: false, error: 'Không tìm thấy giao dịch' };
    if (tx.status !== 'pending') return { success: false, error: 'Giao dịch không ở trạng thái chờ duyệt' };

    await execute(
      `UPDATE transactions SET status = 'failed', processed_by = $1, processed_at = NOW() WHERE id = $2`,
      [adminId, transactionId]
    );

    await auditLog({
      userId: tx.user_id,
      action: 'deposit_rejected',
      entityId: transactionId,
      newData: { amount: tx.amount },
      req,
    });

    return { success: true, message: 'Đã từ chối yêu cầu nạp tiền' };
  },

  async approveWithdraw(transactionId: string, adminId: string, req?: AuthRequest) {
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
        `UPDATE transactions SET status = 'completed', processed_by = $1, processed_at = NOW() WHERE id = $2`,
        [adminId, transactionId]
      );

      await client.query('COMMIT');

      await auditLog({
        userId: tx.user_id,
        action: 'withdraw_approved',
        entityId: transactionId,
        newData: { amount: tx.amount },
        req,
      });

      return { success: true, message: 'Đã duyệt rút tiền thành công' };
    } catch (err) {
      await client.query('ROLLBACK');
      return { success: false, error: 'Lỗi xử lý' };
    } finally {
      client.release();
    }
  },

  async rejectWithdraw(transactionId: string, adminId: string, req?: AuthRequest) {
    const tx = await queryOne<any>('SELECT * FROM transactions WHERE id = $1', [transactionId]);
    if (!tx) return { success: false, error: 'Không tìm thấy giao dịch' };

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE wallets SET balance = balance + $1, locked_balance = GREATEST(0, locked_balance - $1), updated_at = NOW()
         WHERE user_id = $2`,
        [tx.amount, tx.user_id]
      );

      await client.query(
        `UPDATE transactions SET status = 'failed', processed_by = $1, processed_at = NOW() WHERE id = $2`,
        [adminId, transactionId]
      );

      await client.query('COMMIT');

      await auditLog({
        userId: tx.user_id,
        action: 'withdraw_rejected',
        entityId: transactionId,
        newData: { amount: tx.amount },
        req,
      });

      return { success: true, message: 'Đã từ chối yêu cầu rút tiền' };
    } catch (err) {
      await client.query('ROLLBACK');
      return { success: false, error: 'Lỗi xử lý' };
    } finally {
      client.release();
    }
  },

  async adjustBalance(
    userId: string,
    amount: number,
    action: 'add' | 'subtract',
    note: string,
    adminId: string,
    req?: AuthRequest
  ) {
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
        [Math.abs(amount), userId]
      );

      await client.query(
        `INSERT INTO transactions (user_id, type, amount, status, reference, description, processed_by, processed_at)
         VALUES ($1, $2, $3, 'completed', $4, $5, $6, NOW())`,
        [userId, type, Math.abs(amount), reference, note, adminId]
      );

      await client.query('COMMIT');

      await auditLog({
        userId,
        action: 'balance_adjusted',
        entityId: userId,
        newData: { amount, action, note, adminId },
        req,
      });

      return { success: true, reference };
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
