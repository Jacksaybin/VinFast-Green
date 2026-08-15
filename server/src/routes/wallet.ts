/**
 * Wallet Routes
 */

import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { walletService } from '../services/walletService';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';
import { userRateLimitMiddleware } from '../middleware/rateLimit';
import { ok, badRequest, paginated } from '../utils/response';

const router = Router();

const validate = (req: any, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return badRequest(res, 'Validation failed', errors.array());
  }
  next();
};

// Rate limit cho thao tác tiền (per user):
//   - Read (GET wallet, GET transactions): 60 req / phút
//   - Write (deposit, withdraw): 10 req / phút — chống spam yêu cầu
const readLimiter = userRateLimitMiddleware(60, 60_000, 'wallet-read');
const writeLimiter = userRateLimitMiddleware(10, 60_000, 'wallet-write');

router.get('/', requireAuth, readLimiter, async (req: AuthRequest, res: Response) => {
  const wallet = await walletService.getWallet(req.user!.userId);
  return ok(res, {
    balance: parseFloat(wallet?.balance || '0'),
    lockedBalance: parseFloat(wallet?.locked_balance || '0'),
  });
});

router.post(
  '/deposit',
  requireAuth,
  writeLimiter,
  [body('amount').isFloat({ min: 100000 }).withMessage('Số tiền nạp tối thiểu 100.000 ₫')],
  validate,
  async (req: AuthRequest, res: Response) => {
    const { amount, description } = req.body;
    const result = await walletService.requestDeposit(req.user!.userId, amount, description, req);
    if (!result.success) return badRequest(res, result.error!);
    return ok(res, result);
  }
);

router.post(
  '/withdraw',
  requireAuth,
  writeLimiter,
  [body('amount').isFloat({ min: 100000 }).withMessage('Số tiền rút tối thiểu 100.000 ₫')],
  validate,
  async (req: AuthRequest, res: Response) => {
    const { amount, description } = req.body;
    const result = await walletService.requestWithdraw(req.user!.userId, amount, description, req);
    if (!result.success) return badRequest(res, result.error!);
    return ok(res, result);
  }
);

router.get('/transactions', requireAuth, readLimiter, async (req: AuthRequest, res: Response) => {
  const { type, page = '1', limit = '20' } = req.query;
  const result = await walletService.getTransactions(
    req.user!.userId,
    type as string,
    parseInt(page as string),
    parseInt(limit as string)
  );
  return paginated(
    res,
    result.transactions,
    result.total,
    parseInt(page as string),
    parseInt(limit as string)
  );
});

export default router;
