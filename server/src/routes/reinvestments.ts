/**
 * Reinvestment Routes - API endpoints for reinvestment functionality
 */

import { Router, Request, Response } from 'express';
import { query, queryOne } from '../db';
import { authMiddleware } from '../middleware/auth';
import { success, error } from '../utils/response';

const router = Router();

// GET /api/reinvestments/my-investments - Get user's active investments eligible for reinvestment
router.get('/my-investments', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const investments = await query<any>(
      `SELECT i.*, p.name as package_name, p.type as package_type, p.image_url,
              p.investment_amount as package_default_amount,
              p.min_investment, p.max_investment
       FROM investments i
       JOIN packages p ON p.id = i.package_id
       WHERE i.user_id = $1 AND i.status IN ('active', 'completed')
       ORDER BY i.end_date ASC`,
      [userId]
    );

    // Calculate days remaining and reinvestment eligibility
    const enrichedInvestments = (investments || []).map((inv: any) => {
      const now = new Date();
      const endDate = new Date(inv.end_date);
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const canReinvest = inv.status === 'active' && daysRemaining <= 7;
      const isMatured = inv.status === 'completed' || daysRemaining <= 0;

      return {
        ...inv,
        daysRemaining: Math.max(0, daysRemaining),
        canReinvest,
        isMatured,
        availableProfit: parseFloat(inv.accumulated_profit || '0'),
      };
    });

    res.json(success({ investments: enrichedInvestments }));
  } catch (err) {
    console.error('Get reinvestment investments error:', err);
    res.status(500).json(error('Failed to get investments'));
  }
});

// GET /api/reinvestments/options/:investmentId - Get reinvestment options for an investment
router.get('/options/:investmentId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const investmentId = req.params.investmentId;

    // Get the investment
    const investment = await queryOne<any>(
      `SELECT i.*, p.name as package_name, p.type as package_type
       FROM investments i
       JOIN packages p ON p.id = i.package_id
       WHERE i.id = $1 AND i.user_id = $2`,
      [investmentId, userId]
    );

    if (!investment) {
      return res.status(404).json(error('Investment not found'));
    }

    // Get available packages for reinvestment
    const packages = await query<any>(
      `SELECT * FROM packages 
       WHERE status = 'active' 
       ORDER BY sort_order ASC, investment_amount ASC`,
      []
    );

    // Calculate available profit
    const availableProfit = parseFloat(investment.accumulated_profit || '0');

    res.json(success({
      investment,
      packages,
      availableProfit,
      canUseFullProfit: availableProfit > 0,
    }));
  } catch (err) {
    console.error('Get reinvestment options error:', err);
    res.status(500).json(error('Failed to get options'));
  }
});

// POST /api/reinvestments/preview - Preview reinvestment calculation
router.post('/preview', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { investmentId, packageId, profitToUse, cashToAdd } = req.body;

    if (!investmentId || !packageId) {
      return res.status(400).json(error('Investment ID and Package ID are required'));
    }

    // Get the investment
    const investment = await queryOne<any>(
      `SELECT i.*, p.name as package_name
       FROM investments i
       JOIN packages p ON p.id = i.package_id
       WHERE i.id = $1 AND i.user_id = $2`,
      [investmentId, userId]
    );

    if (!investment) {
      return res.status(404).json(error('Investment not found'));
    }

    // Get the package
    const pkg = await queryOne<any>(
      'SELECT * FROM packages WHERE id = $1 AND status = $2',
      [packageId, 'active']
    );

    if (!pkg) {
      return res.status(404).json(error('Package not found or inactive'));
    }

    const profitAmount = parseFloat(profitToUse || '0');
    const cashAmount = parseFloat(cashToAdd || '0');
    const availableProfit = parseFloat(investment.accumulated_profit || '0');
    const totalAmount = profitAmount + cashAmount;

    // Validate amounts
    if (profitAmount < 0 || cashAmount < 0) {
      return res.status(400).json(error('Invalid amounts'));
    }

    if (profitAmount > availableProfit) {
      return res.status(400).json(error('Profit amount exceeds available profit'));
    }

    if (pkg.min_investment && totalAmount < pkg.min_investment) {
      return res.status(400).json(error(`Minimum investment is ${pkg.min_investment.toLocaleString('vi-VN')} VNĐ`));
    }

    if (pkg.max_investment && totalAmount > pkg.max_investment) {
      return res.status(400).json(error(`Maximum investment is ${pkg.max_investment.toLocaleString('vi-VN')} VNĐ`));
    }

    // Calculate expected returns
    const dailyProfit = (totalAmount * parseFloat(pkg.daily_profit)) / 100;
    const totalProfit = dailyProfit * pkg.investment_period;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + pkg.investment_period);

    res.json(success({
      originalInvestment: {
        id: investment.id,
        amount: parseFloat(investment.amount),
        accumulatedProfit: availableProfit,
      },
      newInvestment: {
        packageId: pkg.id,
        packageName: pkg.name,
        totalAmount,
        profitUsed: profitAmount,
        cashAdded: cashAmount,
        dailyProfit: dailyProfit.toFixed(0),
        investmentPeriod: pkg.investment_period,
        totalProfit: totalProfit.toFixed(0),
        startDate: new Date().toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        profitRemaining: availableProfit - profitAmount,
        expectedROI: ((totalProfit / totalAmount) * 100).toFixed(2),
        dailyProfitRate: pkg.daily_profit,
      },
    }));
  } catch (err) {
    console.error('Preview reinvestment error:', err);
    res.status(500).json(error('Failed to preview reinvestment'));
  }
});

// POST /api/reinvestments/execute - Execute reinvestment
router.post('/execute', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { investmentId, packageId, profitToUse, cashToAdd } = req.body;

    if (!investmentId || !packageId) {
      return res.status(400).json(error('Investment ID and Package ID are required'));
    }

    // Get the investment
    const investment = await queryOne<any>(
      `SELECT i.*, p.name as package_name
       FROM investments i
       JOIN packages p ON p.id = i.package_id
       WHERE i.id = $1 AND i.user_id = $2`,
      [investmentId, userId]
    );

    if (!investment) {
      return res.status(404).json(error('Investment not found'));
    }

    // Get the package
    const pkg = await queryOne<any>(
      'SELECT * FROM packages WHERE id = $1 AND status = $2',
      [packageId, 'active']
    );

    if (!pkg) {
      return res.status(404).json(error('Package not found or inactive'));
    }

    const profitAmount = parseFloat(profitToUse || '0');
    const cashAmount = parseFloat(cashToAdd || '0');
    const availableProfit = parseFloat(investment.accumulated_profit || '0');
    const totalAmount = profitAmount + cashAmount;

    // Validate amounts
    if (profitAmount < 0 || cashAmount < 0) {
      return res.status(400).json(error('Invalid amounts'));
    }

    if (profitAmount > availableProfit) {
      return res.status(400).json(error('Profit amount exceeds available profit'));
    }

    if (pkg.min_investment && totalAmount < pkg.min_investment) {
      return res.status(400).json(error(`Minimum investment is ${pkg.min_investment.toLocaleString('vi-VN')} VNĐ`));
    }

    if (pkg.max_investment && totalAmount > pkg.max_investment) {
      return res.status(400).json(error(`Maximum investment is ${pkg.max_investment.toLocaleString('vi-VN')} VNĐ`));
    }

    // Check wallet balance for cash addition
    if (cashAmount > 0) {
      const wallet = await queryOne<{ balance: string }>(
        'SELECT balance FROM wallets WHERE user_id = $1',
        [userId]
      );
      if (!wallet || parseFloat(wallet.balance) < cashAmount) {
        return res.status(400).json(error('Insufficient wallet balance'));
      }
    }

    // Generate reference
    const reference = `RI${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + pkg.investment_period);

    // Calculate cycle count
    const cycleCountResult = await queryOne<{ max_cycles: string }>(
      'SELECT COALESCE(MAX(total_cycles), 0) as max_cycles FROM investments WHERE user_id = $1',
      [userId]
    );
    const cycleCount = (parseInt(cycleCountResult?.max_cycles || '0') || 0) + 1;

    // Start transaction
    await query('BEGIN');

    try {
      // Deduct cash from wallet if needed
      if (cashAmount > 0) {
        await query(
          'UPDATE wallets SET balance = balance - $1, updated_at = NOW() WHERE user_id = $2',
          [cashAmount, userId]
        );

        // Create transaction for cash deduction
        await query(
          `INSERT INTO transactions (user_id, type, amount, status, reference, description)
           VALUES ($1, 'reinvestment', $2, 'completed', $3, $4)`,
          [userId, cashAmount, `RI${reference}`, `Trừ ví cho tái đầu tư: ${pkg.name}`]
        );
      }

      // Deduct profit from investment
      if (profitAmount > 0) {
        await query(
          `UPDATE investments 
           SET accumulated_profit = accumulated_profit - $1, updated_at = NOW() 
           WHERE id = $2`,
          [profitAmount, investmentId]
        );

        // Create transaction for profit used
        await query(
          `INSERT INTO transactions (user_id, type, amount, status, reference, description)
           VALUES ($1, 'profit', $2, 'completed', $3, $4)`,
          [userId, -profitAmount, `RFP${reference}`, `Sử dụng lợi nhuận cho tái đầu tư: ${pkg.name}`]
        );
      }

      // Mark original investment as rolled over
      await query(
        `UPDATE investments 
         SET status = 'completed', updated_at = NOW() 
         WHERE id = $1`,
        [investmentId]
      );

      // Create new investment
      const newInvestmentResult = await queryOne<{ id: string }>(
        `INSERT INTO investments 
         (user_id, package_id, amount, daily_profit, accumulated_profit, start_date, end_date, 
          status, reference, reinvested_from, total_cycles)
         VALUES ($1, $2, $3, $4, 0, $5, $6, 'active', $7, $8, $9)
         RETURNING id`,
        [
          userId,
          packageId,
          totalAmount,
          pkg.daily_profit,
          startDate,
          endDate,
          reference,
          investmentId,
          cycleCount,
        ]
      );

      // Create reinvestment record
      await query(
        `INSERT INTO reinvestments 
         (user_id, original_investment_id, new_investment_id, amount, profit_used, cash_added, package_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, investmentId, newInvestmentResult!.id, totalAmount, profitAmount, cashAmount, packageId]
      );

      // Create transaction for new investment
      await query(
        `INSERT INTO transactions (user_id, type, amount, status, reference, description)
         VALUES ($1, 'investment', $2, 'completed', $3, $4)`,
        [userId, totalAmount, reference, `Tái đầu tư: ${pkg.name}`]
      );

      // Create notification
      await query(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES ($1, 'Tái đầu tư thành công!', $2, 'success', $3)`,
        [
          userId,
          `Bạn đã tái đầu tư ${totalAmount.toLocaleString('vi-VN')} VNĐ vào gói ${pkg.name}. Lợi nhuận hàng ngày: ${((totalAmount * parseFloat(pkg.daily_profit)) / 100).toLocaleString('vi-VN')} VNĐ/ngày.`,
          `/my-account`,
        ]
      );

      await query('COMMIT');

      res.json(success({
        message: 'Reinvestment successful',
        newInvestmentId: newInvestmentResult!.id,
        newInvestment: {
          id: newInvestmentResult!.id,
          reference,
          amount: totalAmount,
          dailyProfit: (totalAmount * parseFloat(pkg.daily_profit)) / 100,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          packageName: pkg.name,
        },
      }));
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('Execute reinvestment error:', err);
    res.status(500).json(error('Failed to execute reinvestment'));
  }
});

// GET /api/reinvestments/history - Get reinvestment history
router.get('/history', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const history = await query<any>(
      `SELECT r.*, 
              p.name as package_name, p.type as package_type,
              oi.reference as original_reference, oi.amount as original_amount,
              ni.reference as new_reference, ni.amount as new_amount
       FROM reinvestments r
       LEFT JOIN packages p ON p.id = r.package_id
       LEFT JOIN investments oi ON oi.id = r.original_investment_id
       LEFT JOIN investments ni ON ni.id = r.new_investment_id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM reinvestments WHERE user_id = $1',
      [userId]
    );

    // Get summary stats
    const stats = await queryOne<any>(
      `SELECT 
         COUNT(*) as total_reinvestments,
         COALESCE(SUM(amount), 0) as total_amount,
         COALESCE(SUM(profit_used), 0) as total_profit_used,
         COALESCE(SUM(cash_added), 0) as total_cash_added
       FROM reinvestments WHERE user_id = $1`,
      [userId]
    );

    res.json(success({
      history: history || [],
      total: parseInt(countResult?.count || '0'),
      page,
      limit,
      stats: {
        totalReinvestments: parseInt(stats?.total_reinvestments || '0'),
        totalAmount: parseFloat(stats?.total_amount || '0'),
        totalProfitUsed: parseFloat(stats?.total_profit_used || '0'),
        totalCashAdded: parseFloat(stats?.total_cash_added || '0'),
      },
    }));
  } catch (err) {
    console.error('Get reinvestment history error:', err);
    res.status(500).json(error('Failed to get history'));
  }
});

// GET /api/reinvestments/packages - Get available packages for reinvestment
router.get('/packages', authMiddleware, async (req: Request, res: Response) => {
  try {
    const packages = await query<any>(
      `SELECT * FROM packages 
       WHERE status = 'active' 
       ORDER BY sort_order ASC, investment_amount ASC`,
      []
    );

    res.json(success({ packages: packages || [] }));
  } catch (err) {
    console.error('Get packages error:', err);
    res.status(500).json(error('Failed to get packages'));
  }
});

export default router;
