/**
 * Investment Service
 */

import { query, queryOne, execute, pool } from '../db';
import { auditLog } from '../middleware/audit';
import { AuthRequest } from '../middleware/auth';

function ref(prefix: string): string {
  return `${prefix}${Date.now().toString(36).toUpperCase()}`;
}

export const investmentService = {
  async getPackages(category?: string) {
    let sql = 'SELECT * FROM packages WHERE status = $1';
    const params: any[] = ['active'];

    if (category) {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    sql += ' ORDER BY sort_order ASC, created_at ASC';

    const packages = await query(sql, params);

    return packages.map((pkg: any) => ({
      id: pkg.id,
      slug: pkg.slug,
      name: pkg.name,
      type: pkg.type,
      power: pkg.power,
      category: pkg.category,
      dailyProfit: parseFloat(pkg.daily_profit),
      investmentPeriod: pkg.investment_period,
      investmentAmount: parseFloat(pkg.investment_amount),
      minInvestment: pkg.min_investment ? parseFloat(pkg.min_investment) : parseFloat(pkg.investment_amount),
      maxInvestment: pkg.max_investment ? parseFloat(pkg.max_investment) : null,
      projectScale: parseFloat(pkg.project_scale || '0'),
      progress: pkg.progress,
      image: pkg.image_url,
      description: pkg.description,
      details: pkg.details,
      status: pkg.status,
      showOnHome: pkg.show_on_home,
    }));
  },

  async createInvestment(
    userId: string,
    packageId: string,
    amount: number,
    req?: AuthRequest
  ) {
    const pkg = await queryOne<any>('SELECT * FROM packages WHERE id = $1 AND status = $2', [packageId, 'active']);
    if (!pkg) return { success: false, error: 'Không tìm thấy gói đầu tư' };

    const minAmt = pkg.min_investment ? parseFloat(pkg.min_investment) : parseFloat(pkg.investment_amount);
    if (amount < minAmt) {
      return { success: false, error: `Số tiền tối thiểu là ${minAmt.toLocaleString('vi-VN')} ₫` };
    }

    const wallet = await queryOne<{ balance: string }>('SELECT balance FROM wallets WHERE user_id = $1', [userId]);
    const balance = parseFloat(wallet?.balance || '0');

    if (amount > balance) {
      return { success: false, error: `Số dư không đủ. Bạn cần thêm ${(amount - balance).toLocaleString('vi-VN')} ₫` };
    }

    const reference = ref('INV');
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + pkg.investment_period * 24 * 60 * 60 * 1000);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE wallets SET balance = balance - $1, locked_balance = locked_balance + $1, updated_at = NOW()
         WHERE user_id = $2`,
        [amount, userId]
      );

      await client.query(
        `INSERT INTO investments (user_id, package_id, amount, daily_profit, start_date, end_date, status, reference)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, packageId, amount, pkg.daily_profit, startDate.toISOString(), endDate.toISOString(), 'active', reference]
      );

      await client.query(
        `INSERT INTO transactions (user_id, type, amount, status, reference, description)
         VALUES ($1, 'investment', $2, 'completed', $3, $4)`,
        [userId, amount, reference, `Đầu tư gói ${pkg.name}`]
      );

      await client.query(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES ($1, $2, $3, 'transaction', $4)`,
        [
          userId,
          'Đầu tư thành công',
          `Bạn đã đầu tư ${amount.toLocaleString('vi-VN')} ₫ vào gói ${pkg.name}. Ngày đáo hạn: ${endDate.toLocaleDateString('vi-VN')}`,
          '/my-account',
        ]
      );

      await client.query('COMMIT');

      await auditLog({
        userId,
        action: 'investment_created',
        entityId: reference,
        newData: { packageId, packageName: pkg.name, amount },
        req,
      });

      return { success: true, reference, endDate: endDate.toISOString() };
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Investment error:', err);
      return { success: false, error: 'Lỗi xử lý, vui lòng thử lại' };
    } finally {
      client.release();
    }
  },

  async getUserInvestments(userId: string, status?: string) {
    let sql = `SELECT i.*, p.name as package_name, p.slug as package_slug, p.image_url
               FROM investments i
               JOIN packages p ON i.package_id = p.id
               WHERE i.user_id = $1`;
    const params: any[] = [userId];

    if (status) {
      params.push(status);
      sql += ` AND i.status = $${params.length}`;
    }

    sql += ' ORDER BY i.created_at DESC';

    const investments = await query(sql, params);

    return investments.map((inv: any) => ({
      id: inv.id,
      packageId: inv.package_id,
      packageName: inv.package_name,
      packageCode: inv.package_slug,
      amount: parseFloat(inv.amount),
      dailyProfit: parseFloat(inv.daily_profit),
      investmentPeriod: pkg => {
        const pkg2 = queryOne<any>('SELECT investment_period FROM packages WHERE id = $1', [inv.package_id]);
        return pkg2 ? pkg2.investment_period : 30;
      },
      accumulatedProfit: parseFloat(inv.accumulated_profit),
      startDate: inv.start_date,
      endDate: inv.end_date,
      status: inv.status,
      reference: inv.reference,
    }));
  },

  async getActiveInvestments(userId: string) {
    return this.getUserInvestments(userId, 'active');
  },

  async getInvestmentStats(userId: string) {
    const [active, completed, totalInvested, totalProfit] = await Promise.all([
      queryOne<{ count: string }>(
        'SELECT COUNT(*) as count FROM investments WHERE user_id = $1 AND status = $2',
        [userId, 'active']
      ),
      queryOne<{ count: string }>(
        'SELECT COUNT(*) as count FROM investments WHERE user_id = $1 AND status = $2',
        [userId, 'completed']
      ),
      queryOne<{ total: string }>(
        'SELECT COALESCE(SUM(amount), 0) as total FROM investments WHERE user_id = $1',
        [userId]
      ),
      queryOne<{ total: string }>(
        'SELECT COALESCE(SUM(accumulated_profit), 0) as total FROM investments WHERE user_id = $1',
        [userId]
      ),
    ]);

    return {
      activeCount: parseInt(active?.count || '0'),
      completedCount: parseInt(completed?.count || '0'),
      totalInvested: parseFloat(totalInvested?.total || '0'),
      totalProfit: parseFloat(totalProfit?.total || '0'),
    };
  },

  async getPackageStats() {
    const packages = await query(`
      SELECT p.*,
             COUNT(i.id)::int as investor_count,
             COALESCE(SUM(i.amount), 0)::float as total_invested
      FROM packages p
      LEFT JOIN investments i ON p.id = i.package_id AND i.status = 'active'
      GROUP BY p.id
      ORDER BY p.sort_order
    `);

    return packages.map((pkg: any) => ({
      id: pkg.id,
      name: pkg.name,
      slug: pkg.slug,
      dailyProfit: parseFloat(pkg.daily_profit),
      investmentPeriod: pkg.investment_period,
      minInvestment: parseFloat(pkg.investment_amount),
      investorCount: pkg.investor_count,
      totalInvested: pkg.total_invested,
      status: pkg.status,
    }));
  },

  async updatePackage(
    packageId: string,
    data: {
      name?: string;
      dailyProfit?: number;
      investmentPeriod?: number;
      investmentAmount?: number;
      minInvestment?: number;
      maxInvestment?: number;
      status?: string;
      details?: any;
    }
  ): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name); }
    if (data.dailyProfit !== undefined) { fields.push(`daily_profit = $${idx++}`); values.push(data.dailyProfit); }
    if (data.investmentPeriod !== undefined) { fields.push(`investment_period = $${idx++}`); values.push(data.investmentPeriod); }
    if (data.investmentAmount !== undefined) { fields.push(`investment_amount = $${idx++}`); values.push(data.investmentAmount); }
    if (data.minInvestment !== undefined) { fields.push(`min_investment = $${idx++}`); values.push(data.minInvestment); }
    if (data.maxInvestment !== undefined) { fields.push(`max_investment = $${idx++}`); values.push(data.maxInvestment); }
    if (data.status !== undefined) { fields.push(`status = $${idx++}`); values.push(data.status); }
    if (data.details !== undefined) { fields.push(`details = $${idx++}`); values.push(JSON.stringify(data.details)); }

    if (fields.length === 0) return true;

    values.push(packageId);
    const count = await execute(
      `UPDATE packages SET ${fields.join(', ')} WHERE id = $${idx}`,
      values
    );
    return count > 0;
  },
};
