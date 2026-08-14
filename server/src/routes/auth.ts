/**
 * Auth Routes
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authService } from '../services/authService';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';
import { ok, badRequest, created, serverError } from '../utils/response';

const router = Router();

const validate = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return badRequest(res, 'Validation failed', errors.array());
  }
  next();
};

router.post(
  '/register',
  [
    body('phone').isMobilePhone('vi-VN').withMessage('Số điện thoại không hợp lệ'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('fullName').trim().notEmpty().withMessage('Họ tên không được trống'),
  ],
  validate,
  async (req: Request, res: Response) => {
    const { phone, password, fullName, referralCode } = req.body;
    const result = await authService.register(phone, password, fullName, referralCode);

    if (!result.success) {
      return badRequest(res, result.error!);
    }

    return created(res, {
      user: result.user,
      tokens: result.tokens,
    }, 'Đăng ký thành công');
  }
);

router.post(
  '/login',
  [
    body('phone').notEmpty().withMessage('Số điện thoại không được trống'),
    body('password').notEmpty().withMessage('Mật khẩu không được trống'),
  ],
  validate,
  async (req: Request, res: Response) => {
    const { phone, password } = req.body;
    const result = await authService.login(phone, password, req as AuthRequest);

    if (!result.success) {
      return badRequest(res, result.error!);
    }

    return ok(res, {
      user: result.user,
      tokens: result.tokens,
    }, 'Đăng nhập thành công');
  }
);

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await authService.getProfile(req.user!.userId);
  if (!user) return badRequest(res, 'Không tìm thấy người dùng');
  return ok(res, user);
});

router.put('/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await authService.updateProfile(req.user!.userId, req.body);
  if (!user) return badRequest(res, 'Cập nhật thất bại');
  return ok(res, user, 'Cập nhật thành công');
});

export default router;
