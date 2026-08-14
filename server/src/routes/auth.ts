/**
 * Auth Routes
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authService } from '../services/authService';
import { requireAuth, requireAdmin, AuthRequest, verifyRefreshToken, generateTokens } from '../middleware/auth';
import { ok, badRequest, created, serverError } from '../utils/response';
import { rateLimitMiddleware } from '../middleware/rateLimit';
import { auditLog } from '../middleware/audit';
import { query } from '../db';

const router = Router();

// Apply rate limit + brute force protection
const authLimiter = rateLimitMiddleware(20, 60_000, 'auth');
const loginLimiter = rateLimitMiddleware(5, 5 * 60_000, 'login');
router.use(authLimiter);

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
  loginLimiter,
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

router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Thiếu refresh token')],
  validate,
  async (req: Request, res: Response) => {
    const payload = verifyRefreshToken(req.body.refreshToken);
    if (!payload) {
      return badRequest(res, 'Refresh token không hợp lệ hoặc đã hết hạn');
    }

    const user = await authService.getProfile(payload.userId);
    if (!user) {
      return badRequest(res, 'Tài khoản không tồn tại');
    }

    const tokens = generateTokens({ id: user.id, phone: user.phone, role: user.role });
    return ok(res, { user, tokens }, 'Làm mới phiên thành công');
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

router.post(
  '/change-password',
  requireAuth,
  [
    body('currentPassword').notEmpty().withMessage('Vui lòng nhập mật khẩu hiện tại'),
    body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
  ],
  validate,
  async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user!.userId, currentPassword, newPassword);
    if (!result.success) return badRequest(res, result.error!);
    return ok(res, null, 'Đổi mật khẩu thành công');
  }
);

router.get('/referrals', requireAuth, async (req: AuthRequest, res: Response) => {
  const result = await authService.getReferrals(req.user!.userId);
  return ok(res, result);
});

/**
 * Logout - revokes a refresh token (if provided) and logs the action.
 * Stateless access tokens remain valid until their natural expiry.
 */
router.post(
  '/logout',
  [body('refreshToken').optional()],
  async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
      }
      // Optionally pull userId from access token if Authorization header present
      const auth = req.headers.authorization;
      if (auth && auth.startsWith('Bearer ')) {
        const { verifyAccessToken } = await import('../middleware/auth');
        const payload = verifyAccessToken(auth.slice(7));
        if (payload) {
          await query('DELETE FROM refresh_tokens WHERE user_id = $1', [payload.userId]);
          await auditLog({ userId: payload.userId, action: 'logout', req: req as any });
        }
      }
      return ok(res, null, 'Đã đăng xuất');
    } catch (err) {
      return ok(res, null, 'Đã đăng xuất');
    }
  }
);

export default router;
