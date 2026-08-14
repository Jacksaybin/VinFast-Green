/**
 * Referral Routes - API endpoints for referral system
 */

import { Router, Request, Response } from 'express';
import { query, queryOne } from '../db';
import { authMiddleware } from '../middleware/auth';
import { success, error } from '../utils/response';

const router = Router();

// Referral bonus settings (could be stored in settings table)
const REFERRAL_SIGNUP_BONUS = 10000; // 10,000 VND
const REFERRAL_INVESTMENT_BONUS_PERCENT = 0.01; // 1%
const REFERRAL_INVESTMENT_BONUS_MAX = 500000; // Max 500,000 VND
const REFERRAL_MILESTONE_AMOUNT = 10000000; // Every 10M invested
const REFERRAL_MILESTONE_BONUS = 50000; // 50,000 VND per milestone

// GET /api/referrals/stats - Get referral statistics for current user
router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    // Get referral count
    const referralCountResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM users WHERE referred_by = $1',
      [userId]
    );
    const referralCount = parseInt(referralCountResult?.count || '0');

    // Get total referral earnings
    const earningsResult = await queryOne<{ total: string }>(
      `SELECT COALESCE(SUM(bonus_amount), 0) as total 
       FROM referral_bonuses 
       WHERE referrer_id = $1 AND status = 'credited'`,
      [userId]
    );
    const totalEarnings = parseFloat(earningsResult?.total || '0');

    // Get pending bonuses count
    const pendingResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM referral_bonuses 
       WHERE referrer_id = $1 AND status = 'pending'`,
      [userId]
    );
    const pendingCount = parseInt(pendingResult?.count || '0');

    // Get pending bonus amount
    const pendingAmountResult = await queryOne<{ total: string }>(
      `SELECT COALESCE(SUM(bonus_amount), 0) as total 
       FROM referral_bonuses 
       WHERE referrer_id = $1 AND status = 'pending'`,
      [userId]
    );
    const pendingAmount = parseFloat(pendingAmountResult?.total || '0');

    // Get user's referral code
    const user = await queryOne<{ referral_code: string; full_name: string }>(
      'SELECT referral_code, full_name FROM users WHERE id = $1',
      [userId]
    );

    // Get list of referred users
    const referredUsers = await query<any>(
      `SELECT u.id, u.full_name, u.phone, u.created_at,
              COALESCE(SUM(CASE WHEN rb.status = 'credited' THEN rb.bonus_amount ELSE 0 END), 0) as total_bonus,
              COUNT(rb.id) as bonus_count
       FROM users u
       LEFT JOIN referral_bonuses rb ON rb.referred_id = u.id
       WHERE u.referred_by = $1
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json(success({
      referralCode: user?.referral_code || '',
      referralCount,
      totalEarnings,
      pendingCount,
      pendingAmount,
      referredUsers: referredUsers || [],
    }));
  } catch (err) {
    console.error('Get referral stats error:', err);
    res.status(500).json(error('Failed to get referral stats'));
  }
});

// GET /api/referrals/bonuses - Get bonus history
router.get('/bonuses', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const bonuses = await query<any>(
      `SELECT rb.*, u.full_name as referred_user_name, u.phone as referred_user_phone
       FROM referral_bonuses rb
       LEFT JOIN users u ON u.id = rb.referred_id
       WHERE rb.referrer_id = $1
       ORDER BY rb.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM referral_bonuses WHERE referrer_id = $1',
      [userId]
    );

    res.json(success({
      bonuses: bonuses || [],
      total: parseInt(countResult?.count || '0'),
      page,
      limit,
    }));
  } catch (err) {
    console.error('Get bonus history error:', err);
    res.status(500).json(error('Failed to get bonus history'));
  }
});

// POST /api/referrals/claim-bonus/:id - Claim a pending bonus
router.post('/claim-bonus/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const bonusId = req.params.id;

    // Get the bonus
    const bonus = await queryOne<any>(
      'SELECT * FROM referral_bonuses WHERE id = $1 AND referrer_id = $2 AND status = $3',
      [bonusId, userId, 'pending']
    );

    if (!bonus) {
      return res.status(404).json(error('Bonus not found or already claimed'));
    }

    // Credit the bonus to wallet
    await query(
      'UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE user_id = $2',
      [bonus.bonus_amount, userId]
    );

    // Update bonus status
    await query(
      `UPDATE referral_bonuses 
       SET status = 'credited', credited_at = NOW() 
       WHERE id = $1`,
      [bonusId]
    );

    // Create transaction record
    const txRef = `REF${Date.now().toString(36).toUpperCase()}`;
    await query(
      `INSERT INTO transactions (user_id, type, amount, status, reference, description)
       VALUES ($1, 'referral', $2, 'completed', $3, $4)`,
      [userId, bonus.bonus_amount, txRef, bonus.description || `Referral bonus - ${bonus.bonus_type}`]
    );

    // Update user's referral earnings
    await query(
      'UPDATE users SET referral_total_earnings = referral_total_earnings + $1 WHERE id = $2',
      [bonus.bonus_amount, userId]
    );

    // Create notification
    await query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, 'Nhận thưởng giới thiệu', $2, 'success')`,
      [userId, `Bạn đã nhận được ${bonus.bonus_amount.toLocaleString('vi-VN')} VNĐ từ tiền thưởng giới thiệu!`]
    );

    res.json(success({ message: 'Bonus claimed successfully' }));
  } catch (err) {
    console.error('Claim bonus error:', err);
    res.status(500).json(error('Failed to claim bonus'));
  }
});

// GET /api/referrals/referred-users - Get list of referred users
router.get('/referred-users', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const users = await query<any>(
      `SELECT u.id, u.full_name, u.phone, u.email, u.created_at,
              COALESCE(SUM(CASE WHEN rb.status = 'credited' THEN rb.bonus_amount ELSE 0 END), 0) as total_bonus,
              COUNT(DISTINCT rb.id) as bonus_count,
              COALESCE(SUM(CASE WHEN i.status = 'active' THEN i.amount ELSE 0 END), 0) as total_investment,
              COUNT(DISTINCT i.id) as investment_count
       FROM users u
       LEFT JOIN referral_bonuses rb ON rb.referred_id = u.id
       LEFT JOIN investments i ON i.user_id = u.id
       WHERE u.referred_by = $1
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM users WHERE referred_by = $1',
      [userId]
    );

    res.json(success({
      users: users || [],
      total: parseInt(countResult?.count || '0'),
      page,
      limit,
    }));
  } catch (err) {
    console.error('Get referred users error:', err);
    res.status(500).json(error('Failed to get referred users'));
  }
});

// POST /api/referrals/validate-code - Validate a referral code
router.post('/validate-code', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json(error('Referral code is required'));
    }

    // Check if user already has a referrer
    const user = await queryOne<{ referred_by: string }>(
      'SELECT referred_by FROM users WHERE id = $1',
      [userId]
    );

    if (user?.referred_by) {
      return res.status(400).json(error('You already have a referrer'));
    }

    // Find the referrer
    const referrer = await queryOne<any>(
      'SELECT id, full_name, phone FROM users WHERE referral_code = $1 AND id != $2',
      [code.toUpperCase(), userId]
    );

    if (!referrer) {
      return res.status(404).json(error('Invalid referral code'));
    }

    res.json(success({
      valid: true,
      referrerName: referrer.full_name || referrer.phone,
    }));
  } catch (err) {
    console.error('Validate code error:', err);
    res.status(500).json(error('Failed to validate code'));
  }
});

// Internal function to award signup bonus (called during user registration)
export async function awardSignupBonus(referrerId: string, referredId: string): Promise<void> {
  try {
    // Check if referrer exists
    const referrer = await queryOne<any>(
      'SELECT id FROM users WHERE id = $1',
      [referrerId]
    );

    if (!referrer) return;

    // Create pending bonus
    await query(
      `INSERT INTO referral_bonuses (referrer_id, referred_id, bonus_amount, bonus_type, description)
       VALUES ($1, $2, $3, 'signup', 'Bonus đăng ký thành viên mới')`,
      [referrerId, referredId, REFERRAL_SIGNUP_BONUS]
    );

    // Update referred user's referral_signup_bonus_claimed
    await query(
      'UPDATE users SET referral_signup_bonus_claimed = true WHERE id = $1',
      [referredId]
    );

    // Update referral count
    await query(
      'UPDATE users SET referral_count = referral_count + 1 WHERE id = $1',
      [referrerId]
    );

    // Notify referrer
    await query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, 'Thưởng giới thiệu!', $2, 'success')`,
      [referrerId, `Bạn có bonus 10,000 VNĐ chờ nhận! Người bạn giới thiệu đã đăng ký thành công.`]
    );
  } catch (err) {
    console.error('Award signup bonus error:', err);
  }
}

// Internal function to award investment bonus (called after investment)
export async function awardInvestmentBonus(
  referrerId: string, 
  referredId: string, 
  investmentAmount: number,
  investmentId: string
): Promise<void> {
  try {
    // Calculate bonus (1% of investment, max 500,000)
    let bonusAmount = Math.min(investmentAmount * REFERRAL_INVESTMENT_BONUS_PERCENT, REFERRAL_INVESTMENT_BONUS_MAX);
    
    // Round to nearest 1000
    bonusAmount = Math.floor(bonusAmount / 1000) * 1000;

    if (bonusAmount <= 0) return;

    // Create pending bonus
    await query(
      `INSERT INTO referral_bonuses (referrer_id, referred_id, investment_id, bonus_amount, bonus_type, description)
       VALUES ($1, $2, $3, $4, 'first_investment', $5)`,
      [
        referrerId, 
        referredId, 
        investmentId,
        bonusAmount, 
        `Bonus 1% từ đầu tư ${investmentAmount.toLocaleString('vi-VN')} VNĐ`
      ]
    );

    // Check for milestone bonus
    const totalInvestment = await queryOne<{ total: string }>(
      `SELECT COALESCE(SUM(amount), 0) as total FROM investments WHERE user_id = $1 AND status != 'cancelled'`,
      [referredId]
    );

    const total = parseFloat(totalInvestment?.total || '0');
    const milestoneCount = Math.floor(total / REFERRAL_MILESTONE_AMOUNT);

    if (milestoneCount > 0) {
      // Check if milestone bonus already awarded for this level
      const existingMilestones = await queryOne<{ count: string }>(
        `SELECT COUNT(*) as count FROM referral_bonuses 
         WHERE referrer_id = $1 AND referred_id = $2 AND bonus_type = 'milestone'`,
        [referrerId, referredId]
      );

      const existingCount = parseInt(existingMilestones?.count || '0');
      if (milestoneCount > existingCount) {
        // Award new milestone bonus
        await query(
          `INSERT INTO referral_bonuses (referrer_id, referred_id, investment_id, bonus_amount, bonus_type, description)
           VALUES ($1, $2, $3, $4, 'milestone', $5)`,
          [
            referrerId,
            referredId,
            investmentId,
            REFERRAL_MILESTONE_BONUS,
            `Thưởng mốc ${(milestoneCount * REFERRAL_MILESTONE_AMOUNT / 1000000).toFixed(0)}M đầu tư`
          ]
        );

        // Notify referrer
        await query(
          `INSERT INTO notifications (user_id, title, message, type)
           VALUES ($1, 'Thưởng mốc giới thiệu!', $2, 'success')`,
          [referrerId, `Bạn nhận thêm 50,000 VNĐ thưởng mốc ${(milestoneCount * REFERRAL_MILESTONE_AMOUNT / 1000000).toFixed(0)}M từ người bạn giới thiệu!`]
        );
      }
    }

    // Notify referrer
    await query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, 'Thưởng đầu tư!', $2, 'success')`,
      [referrerId, `Bạn có bonus ${bonusAmount.toLocaleString('vi-VN')} VNĐ chờ nhận từ đầu tư của bạn bè!`]
    );
  } catch (err) {
    console.error('Award investment bonus error:', err);
  }
}

export default router;
