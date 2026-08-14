/**
 * Investment Routes
 */

import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { investmentService } from '../services/investmentService';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';
import { ok, badRequest, paginated } from '../utils/response';

const router = Router();

const validate = (req: any, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return badRequest(res, 'Validation failed', errors.array());
  next();
};

// Public routes
router.get('/packages', async (req: Response) => {
  const { category } = req.query;
  const packages = await investmentService.getPackages(category as string);
  return ok(res, packages);
});

router.get('/stats', async (req: Response) => {
  const stats = await investmentService.getPackageStats();
  return ok(res, stats);
});

// User routes
router.get('/my-investments', requireAuth, async (req: AuthRequest, res: Response) => {
  const { status } = req.query;
  const investments = await investmentService.getUserInvestments(req.user!.userId, status as string);
  return ok(res, investments);
});

router.get('/my-stats', requireAuth, async (req: AuthRequest, res: Response) => {
  const stats = await investmentService.getInvestmentStats(req.user!.userId);
  return ok(res, stats);
});

router.post(
  '/invest',
  requireAuth,
  [
    body('packageId').notEmpty().withMessage('packageId is required'),
    body('amount').isFloat({ min: 1000000 }).withMessage('Số tiền đầu tư tối thiểu 1 triệu ₫'),
  ],
  validate,
  async (req: AuthRequest, res: Response) => {
    const { packageId, amount } = req.body;
    const result = await investmentService.createInvestment(req.user!.userId, packageId, amount, req);
    if (!result.success) return badRequest(res, result.error!);
    return ok(res, result, 'Đầu tư thành công');
  }
);

// Admin routes
router.get('/admin/all', requireAdmin, async (req: AuthRequest, res: Response) => {
  const investments = await investmentService.getPackageStats();
  return ok(res, investments);
});

router.put('/admin/package/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const result = await investmentService.updatePackage(id, req.body);
  if (!result) return badRequest(res, 'Cập nhật thất bại');
  return ok(res, null, 'Cập nhật thành công');
});

export default router;
