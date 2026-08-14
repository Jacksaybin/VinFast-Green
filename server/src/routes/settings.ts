/**
 * Settings Routes - Public read, admin read/write
 */

import { Router, Response } from 'express';
import { settingsService } from '../services/settingsService';
import { requireAdmin, requirePermission, PERMISSIONS, optionalAuth, AuthRequest } from '../middleware/auth';
import { ok, badRequest } from '../utils/response';

const router = Router();

router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  // Only admins see descriptions
  if (req.user && req.user.role === 'admin') {
    return ok(res, await settingsService.getAll());
  }
  return ok(res, (await settingsService.getAll()).map((s: any) => ({ id: s.id, value: s.value })));
});

router.get('/:id', async (req, res) => {
  const setting = await settingsService.get(String(req.params.id));
  if (!setting) return badRequest(res, 'Không tìm thấy cài đặt');
  return ok(res, setting);
});

router.put(
  '/:id',
  requireAdmin,
  requirePermission(PERMISSIONS.SETTINGS_EDIT),
  async (req, res) => {
    const { value, description } = req.body;
    if (value === undefined) return badRequest(res, 'Vui lòng cung cấp giá trị');
    await settingsService.upsert(String(req.params.id), value, description);
    return ok(res, null, 'Đã cập nhật cài đặt');
  }
);

router.delete(
  '/:id',
  requireAdmin,
  requirePermission(PERMISSIONS.SETTINGS_EDIT),
  async (req, res) => {
    const result = await settingsService.delete(String(req.params.id));
    if (!result) return badRequest(res, 'Không tìm thấy cài đặt');
    return ok(res, null, 'Đã xóa');
  }
);

export default router;
