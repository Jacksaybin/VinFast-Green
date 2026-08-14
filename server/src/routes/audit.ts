/**
 * Audit Log Routes - Admin only
 */

import { Router, Response } from 'express';
import { auditService } from '../services/auditService';
import { requireAdmin, requirePermission, PERMISSIONS, AuthRequest } from '../middleware/auth';
import { ok, paginated } from '../utils/response';

const router = Router();

router.use(requireAdmin, requirePermission(PERMISSIONS.AUDIT_VIEW));

router.get('/', async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '50', action, userId } = req.query;
  const result = await auditService.getLogs(
    parseInt(page as string),
    parseInt(limit as string),
    action as string,
    userId as string
  );
  return paginated(res, result.logs, result.total, parseInt(page as string), parseInt(limit as string));
});

router.get('/stats', async (req: AuthRequest, res: Response) => {
  const stats = await auditService.getStats();
  return ok(res, stats);
});

export default router;
