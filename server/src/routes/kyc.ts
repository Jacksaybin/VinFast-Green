/**
 * KYC Routes - User submission + admin review
 */

import { Router, Response } from 'express';
import { body } from 'express-validator';
import { kycService } from '../services/kycService';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';
import { ok, badRequest, paginated } from '../utils/response';

const router = Router();

router.get('/status', requireAuth, async (req: AuthRequest, res: Response) => {
  const status = await kycService.getKycStatus(req.user!.userId);
  if (!status) return badRequest(res, 'Không tìm thấy người dùng');
  return ok(res, status);
});

router.post(
  '/submit',
  requireAuth,
  [body('frontImage').notEmpty(), body('backImage').notEmpty()],
  async (req: AuthRequest, res: Response) => {
    const result = await kycService.submitKyc(req.user!.userId, req.body, req);
    if (!result.success) return badRequest(res, result.error!);
    return ok(res, null, result.message);
  }
);

// Admin
router.get('/admin/pending', requireAdmin, async (req: AuthRequest, res: Response) => {
  const page = parseInt(String(req.query.page || '1'), 10);
  const limit = parseInt(String(req.query.limit || '20'), 10);
  const result = await kycService.getPendingKyc(page, limit);
  return paginated(res, result.users, result.total, page, limit);
});

router.post('/admin/:id/approve', requireAdmin, async (req: AuthRequest, res: Response) => {
  const result = await kycService.approveKyc(String(req.params.id), req.user!.userId, req);
  if (!result.success) return badRequest(res, result.error!);
  return ok(res, null, result.message);
});

router.post(
  '/admin/:id/reject',
  requireAdmin,
  [body('reason').trim().notEmpty().withMessage('Vui lòng nhập lý do')],
  async (req: AuthRequest, res: Response) => {
    const result = await kycService.rejectKyc(String(req.params.id), String(req.body.reason), req.user!.userId, req);
    if (!result.success) return badRequest(res, result.error!);
    return ok(res, null, result.message);
  }
);

export default router;
