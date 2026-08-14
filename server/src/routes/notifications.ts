/**
 * Notification Routes
 */

import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { notificationService } from '../services/notificationService';
import { ok, paginated } from '../utils/response';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20' } = req.query;
  const p = parseInt(String(page));
  const l = parseInt(String(limit));
  const result = await notificationService.getNotifications(
    req.user!.userId,
    p,
    l
  );
  return paginated(res, result.notifications, result.total, p, l);
});

router.get('/unread-count', requireAuth, async (req: AuthRequest, res: Response) => {
  const count = await notificationService.getUnreadCount(req.user!.userId);
  return ok(res, { count });
});

router.put('/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
  await notificationService.markAsRead(String(req.params.id), req.user!.userId);
  return ok(res, null, 'Đã đánh dấu đã đọc');
});

router.put('/read-all', requireAuth, async (req: AuthRequest, res: Response) => {
  const count = await notificationService.markAllAsRead(req.user!.userId);
  return ok(res, { count });
});

export default router;
