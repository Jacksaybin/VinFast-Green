/**
 * Investment Service
 */

import { query, queryOne, execute, pool } from '../db';
import { auditLog } from '../middleware/audit';
import { AuthRequest } from '../middleware/auth';
import { awardInvestmentBonus } from '../routes/referrals';

/**
 * Distributed lock helpers (PostgreSQL session-level advisory locks).
 * Không cần Redis — hoạt động trên bất kỳ PostgreSQL nào (Neon hỗ trợ).
 *
 * pg_try_advisory_lock(key) trả về true nếu lock acquired; false nếu lock
 * đang được giữ bởi session khác. Lock tự động release khi session kết thúc
 * hoặc khi gọi pg_advisory_unlock(key).
 *
 * Lưu ý: phải gọi trên CÙNG một pg client để giữ lock xuyên suốt job.
 */
const LOCK_DAILY_PROFIT = 0x56475244; // 'VGRD' hex → unique key for this app

async function tryAcquireJobLock(client: any, key: number): Promise<boolean> {
  const r = await client.query(
    'SELECT pg_try_advisory_lock($1) AS locked',
    [key]
  );
  return r.rows[0]?.locked === true;
}

async function releaseJobLock(client: any, key: number): Promise<void> {
  try {
    await client.query('SELECT pg_advisory_unlock($1)', [key]);
  } catch {
    // ignore - lock will be released when connection closes
  }
}

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

      // Guard against race condition: only deduct if balance is still sufficient.
      // Without this clause, two concurrent investments could both succeed and
      // drive the balance negative (the CHECK constraint would then throw).
      const deductRes = await client.query(
        `UPDATE wallets SET balance = balance - $1, locked_balance = locked_balance + $1, updated_at = NOW()
         WHERE user_id = $2 AND balance >= $1
         RETURNING balance`,
        [amount, userId]
      );
      if (deductRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return { success: false, error: 'Số dư không đủ hoặc đã thay đổi trong lúc xử lý' };
      }

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

      // Referral commission: credit level 1/2/3 referrers based on settings
      await this.creditReferralCommissions(client, userId, amount, reference);

      // Award referral signup bonus to referrer (if first investment)
      const user = await queryOne<any>('SELECT referred_by FROM users WHERE id = $1', [userId]);
      if (user?.referred_by) {
        // Get the investment ID
        const newInv = await queryOne<{ id: string }>(
          'SELECT id FROM investments WHERE reference = $1',
          [reference]
        );
        if (newInv) {
          await awardInvestmentBonus(user.referred_by, userId, amount, newInv.id);
        }
      }

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
    let sql = `SELECT i.*, p.name as package_name, p.slug as package_slug, p.image_url, p.investment_period
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
      investmentPeriod: parseInt(inv.investment_period) || 30,
      accumulatedProfit: parseFloat(inv.accumulated_profit),
      startDate: inv.start_date,
      endDate: inv.end_date,
      status: inv.status,
      reference: inv.reference,
    }));
  },

  async getAllInvestments(status?: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const params: any[] = [];
    let where = '';

    if (status) {
      params.push(status);
      where = `WHERE i.status = $${params.length}`;
    }

    const total = (await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM investments i ${where}`, params
    ))?.count || '0';

    params.push(limit, offset);
    const investments = await query(
      `SELECT i.*, p.name as package_name, p.slug as package_slug, u.full_name, u.phone
       FROM investments i
       JOIN packages p ON i.package_id = p.id
       JOIN users u ON i.user_id = u.id
       ${where}
       ORDER BY i.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return {
      investments: investments.map((inv: any) => ({
        id: inv.id,
        userId: inv.user_id,
        userName: inv.full_name,
        userPhone: inv.phone,
        packageId: inv.package_id,
        packageName: inv.package_name,
        packageCode: inv.package_slug,
        amount: parseFloat(inv.amount),
        dailyProfit: parseFloat(inv.daily_profit),
        investmentPeriod: parseInt(inv.investment_period) || 30,
        accumulatedProfit: parseFloat(inv.accumulated_profit),
        startDate: inv.start_date,
        endDate: inv.end_date,
        status: inv.status,
        reference: inv.reference,
      })),
      total: parseInt(total),
    };
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
      minInvestment: pkg.min_investment ? parseFloat(pkg.min_investment) : parseFloat(pkg.investment_amount),
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

  /**
   * Credit referral commission to level 1/2/3 referrers when a user invests or makes their first deposit.
   * Rates come from the `referral_commission` settings row: { level1, level2, level3 } (percent).
   * Uses the passed-in client so it participates in the caller's transaction.
   */
  async creditReferralCommissions(client: any, userId: string, amount: number, sourceReference: string, context: 'investment' | 'deposit' = 'investment') {
    const setting = await queryOne<any>('SELECT value FROM settings WHERE id = $1', ['referral_commission']);
    let rates: any = { level1: 5, level2: 2, level3: 1 };
    try { rates = setting?.value ? JSON.parse(setting.value) : rates; } catch { /* keep defaults */ }

    // Walk the referral chain: level1 = my referrer, level2 = referrer's referrer, etc.
    let currentId = userId;
    const levels = [1, 2, 3].map((l) => ({
      level: l,
      rate: parseFloat(rates[`level${l}`]) || 0,
    }));
    const successCopy =
      context === 'deposit'
        ? 'hoa hồng cấp %s khi bạn bè nạp tiền lần đầu tiên.'
        : 'hoa hồng cấp %s từ nhà đầu tư được giới thiệu.';

    for (const { level, rate } of levels) {
      if (rate <= 0) continue;

      const referrer = await queryOne<any>(
        'SELECT u.id, u.referred_by, u.full_name FROM users u WHERE u.id = $1',
        [currentId]
      );
      if (!referrer || !referrer.referred_by) break;
      currentId = referrer.referred_by;

      const commission = Math.round(amount * (rate / 100) * 100) / 100;
      if (commission <= 0) continue;

      await client.query(
        `UPDATE wallets SET balance = balance + $1, updated_at = NOW()
         WHERE user_id = $2`,
        [commission, currentId]
      );

      await client.query(
        `INSERT INTO transactions (user_id, type, amount, status, reference, description, metadata)
         VALUES ($1, 'referral', $2, 'completed', $3, $4, $5)`,
        [
          currentId,
          commission,
          `RF${sourceReference.slice(0, 16)}L${level}${Date.now().toString(36).toUpperCase()}`,
          context === 'deposit' ? `Hoa hồng giới thiệu nạp lần đầu - cấp ${level}` : `Hoa hồng giới thiệu cấp ${level}`,
          JSON.stringify({ fromUser: userId, sourceRef: sourceReference, level, context }),
        ]
      );

      await client.query(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES ($1, $2, $3, 'success', $4)`,
        [
          currentId,
          'Hoa hồng giới thiệu',
          `Bạn nhận được ${commission.toLocaleString('vi-VN')} ₫ ${successCopy.replace('%s', String(level))}`,
          context === 'deposit' ? '/benefits' : '/benefits',
        ]
      );
    }
  },

  /**
   * Credit daily profit to all active investments.
   * Idempotent: uses last_profit_date so each investment is credited once per day.
   * Also completes investments past their end_date and releases principal.
   *
   * Performance: chạy trong MỘT transaction với batch UPDATE/INSERT để tránh
   * cạn kiệt connection pool khi số lượng active investments lớn.
   *
   * Concurrency: dùng pg_try_advisory_lock để đảm bảo chỉ 1 instance chạy
   * job này tại 1 thời điểm (an toàn cho multi-instance deployment).
   */
  async addDailyProfits(): Promise<{ credited: number; completed: number; checked: number; skipped?: string }> {
    const today = new Date().toISOString().slice(0, 10);

    // Acquire dedicated client for the whole job (lock + batch ops)
    const client = await pool.connect();
    let lockHeld = false;
    try {
      // ===== Distributed lock =====
      lockHeld = await tryAcquireJobLock(client, LOCK_DAILY_PROFIT);
      if (!lockHeld) {
        return { credited: 0, completed: 0, checked: 0, skipped: 'lock_held_by_other_instance' };
      }

      await client.query('BEGIN');

      // ===== Phase 1: credit daily profit (batch) =====
      // 1a) Lock + compute profit trong 1 CTE
      const profitResult = await client.query<{
        id: string;
        user_id: string;
        amount: string;
        daily_profit: string;
        reference: string;
        profit: string;
      }>(`
        WITH due AS (
          SELECT id, user_id, amount, daily_profit, reference
          FROM investments
          WHERE status = 'active'
            AND (last_profit_date IS NULL OR last_profit_date < $1)
          FOR UPDATE SKIP LOCKED
        )
        SELECT
          id, user_id, amount, daily_profit, reference,
          ROUND((amount * daily_profit / 100)::numeric, 2) AS profit
        FROM due
      `, [today]);

      const dueRows = profitResult.rows;
      let credited = 0;

      if (dueRows.length > 0) {
        // 1b) Single UPDATE cho tất cả rows (PG tối ưu hơn N updates)
        // Tận dụng VALUES clause + UPDATE ... FROM
        const ids = dueRows.map((r) => r.id);
        const profits = dueRows.map((r) => parseFloat(r.profit));
        await client.query(
          `UPDATE investments i SET
              accumulated_profit = i.accumulated_profit + v.profit,
              last_profit_date = $1,
              updated_at = NOW()
           FROM unnest($2::uuid[], $3::numeric[]) AS v(id, profit)
           WHERE i.id = v.id`,
          [today, ids, profits]
        );

        // 1c) Bulk INSERT transactions
        const refBase = `PF${Date.now().toString(36).toUpperCase()}`;
        const txValues: string[] = [];
        const txParams: any[] = [];
        let p = 1;
        for (let i = 0; i < dueRows.length; i++) {
          const r = dueRows[i];
          const ref = `${refBase}${i.toString(36).toUpperCase().padStart(4, '0')}`;
          txValues.push(`($${p++}, $${p++}, $${p++}, 'completed', $${p++}, $${p++}, $${p++}::jsonb)`);
          txParams.push(
            r.user_id,
            parseFloat(r.profit),
            ref,
            ref,
            `Lãi đầu tư ${parseFloat(r.amount).toLocaleString('vi-VN')} ₫`,
            JSON.stringify({ investmentId: r.id, reference: r.reference })
          );
        }
        await client.query(
          `INSERT INTO transactions (user_id, amount, status, reference, description, metadata)
           VALUES ${txValues.join(', ')}`,
          txParams
        );

        // 1d) Bulk INSERT notifications
        const notiValues: string[] = [];
        const notiParams: any[] = [];
        p = 1;
        for (const r of dueRows) {
          const profit = parseFloat(r.profit);
          const amount = parseFloat(r.amount);
          notiValues.push(`($${p++}, $${p++}, $${p++}, 'transaction', $${p++})`);
          notiParams.push(
            r.user_id,
            'Lãi đầu tư hàng ngày',
            `Bạn nhận ${profit.toLocaleString('vi-VN')} ₫ lãi từ khoản đầu tư ${amount.toLocaleString('vi-VN')} ₫.`,
            '/my-account'
          );
        }
        await client.query(
          `INSERT INTO notifications (user_id, title, message, type, link)
           VALUES ${notiValues.join(', ')}`,
          notiParams
        );

        credited = dueRows.length;
      }

      // ===== Phase 2: complete matured investments (batch) =====
      const maturedResult = await client.query<{
        id: string;
        user_id: string;
        amount: string;
        accumulated_profit: string;
      }>(`
        SELECT id, user_id, amount, accumulated_profit
        FROM investments
        WHERE status = 'active' AND end_date <= NOW()
        FOR UPDATE SKIP LOCKED
      `);

      const matured = maturedResult.rows;
      let completed = 0;

      if (matured.length > 0) {
        // 2a) Mark matured investments completed (bulk)
        const matIds = matured.map((r) => r.id);
        await client.query(
          `UPDATE investments SET status = 'completed', updated_at = NOW()
           WHERE id = ANY($1::uuid[]) AND status = 'active'`,
          [matIds]
        );

        // 2b) Release principal + profit back to balance
        // Group by user_id để 1 user có thể có nhiều matured investments
        const byUser = new Map<string, { principal: number; profit: number }>();
        for (const r of matured) {
          const principal = parseFloat(r.amount);
          const profit = parseFloat(r.accumulated_profit || '0');
          const cur = byUser.get(r.user_id) || { principal: 0, profit: 0 };
          cur.principal += principal;
          cur.profit += profit;
          byUser.set(r.user_id, cur);
        }

        for (const [userId, sums] of byUser) {
          await client.query(
            `UPDATE wallets
                SET locked_balance = GREATEST(0, locked_balance - $1),
                    balance = balance + $2,
                    updated_at = NOW()
              WHERE user_id = $3`,
            [sums.principal, sums.principal + sums.profit, userId]
          );
        }

        // 2c) Bulk INSERT notifications cho mỗi matured investment
        const refBase = `MT${Date.now().toString(36).toUpperCase()}`;
        const notiValues: string[] = [];
        const notiParams: any[] = [];
        let p = 1;
        matured.forEach((r, i) => {
          const amount = parseFloat(r.amount);
          const profit = parseFloat(r.accumulated_profit || '0');
          notiValues.push(`($${p++}, $${p++}, $${p++}, 'transaction', $${p++}, $${p++}::jsonb)`);
          notiParams.push(
            r.user_id,
            'Đầu tư hoàn tất',
            `Gói đầu tư ${amount.toLocaleString('vi-VN')} ₫ đã đáo hạn. Gốc ${amount.toLocaleString('vi-VN')} ₫ + lãi ${profit.toLocaleString('vi-VN')} ₫ đã về tài khoản.`,
            '/my-account',
            JSON.stringify({ investmentId: r.id, principal: amount, profit })
          );
        });
        await client.query(
          `INSERT INTO notifications (user_id, title, message, type, link, metadata)
           VALUES ${notiValues.join(', ')}`,
          notiParams
        );

        completed = matured.length;
      }

      await client.query('COMMIT');

      return {
        credited,
        completed,
        checked: dueRows.length + matured.length,
      };
    } catch (err) {
      try { await client.query('ROLLBACK'); } catch {}
      throw err;
    } finally {
      if (lockHeld) await releaseJobLock(client, LOCK_DAILY_PROFIT);
      client.release();
    }
  },
};
