/**
 * Admin Routes
 */

import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authService } from '../services/authService';
import { walletService } from '../services/walletService';
import { investmentService } from '../services/investmentService';
import { notificationService } from '../services/notificationService';
import { newsService } from '../services/newsService';
import { chatService } from '../services/chatService';
import { requireAdmin, requireAuth, requireSuperAdmin, requirePermission, PERMISSIONS, AuthRequest } from '../middleware/auth';
import { ok, badRequest, paginated } from '../utils/response';

const router = Router();

const num = (v: any, d = 1) => {
  const n = parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : d;
};

router.use(requireAuth, requireAdmin);

router.get('/stats', requireAdmin, async (_req: AuthRequest, res: Response) => {
  const stats = await authService.getStats();
  return ok(res, stats);
});

router.get('/users', requireAdmin, async (req: AuthRequest, res: Response) => {
  const page = num(req.query.page, 1);
  const limit = num(req.query.limit, 20);
  const result = await authService.getAllUsers(page, limit);
  return paginated(res, result.users, result.total, page, limit);
});

router.put(
  '/users/:id/status',
  requireAdmin,
  requirePermission(PERMISSIONS.USERS_SUSPEND),
  async (req: AuthRequest, res: Response) => {
    const id = String(req.params.id);
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return badRequest(res, 'Trạng thái không hợp lệ');
    }
    const result = await authService.updateUserStatus(id, status);
    if (!result) return badRequest(res, 'Cập nhật thất bại');
    return ok(res, null, 'Cập nhật trạng thái thành công');
  }
);

router.post(
  '/wallet/adjust',
  requireAdmin,
  requirePermission(PERMISSIONS.WALLET_ADJUST),
  [
    body('userId').notEmpty().withMessage('userId là bắt buộc'),
    body('amount')
      .isFloat({ min: 1000, max: 50_000_000 })
      .withMessage('Số tiền phải từ 1.000 đến 50.000.000 VNĐ'),
    body('action').isIn(['add', 'subtract']).withMessage('Hành động không hợp lệ'),
    body('note').trim().isLength({ min: 10, max: 500 }).withMessage('Lý do phải có từ 10 đến 500 ký tự'),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return badRequest(res, errors.array()[0].msg);
    const { userId, amount, action, note } = req.body;
    const result = await walletService.adjustBalance(userId, amount, action, note, req.user!.userId, req);
    if (!result.success) return badRequest(res, result.error!);
    return ok(
      res,
      {
        reference: result.reference,
        newBalance: result.newBalance,
        oldBalance: result.oldBalance,
      },
      'Điều chỉnh số dư thành công'
    );
  }
);

router.get('/deposits', requireAdmin, async (req: AuthRequest, res: Response) => {
  const page = num(req.query.page, 1);
  const limit = num(req.query.limit, 20);
  const result = await walletService.getAllPendingDeposits(page, limit);
  return paginated(res, result.deposits, result.total, page, limit);
});

router.post(
  '/deposits/:id/approve',
  requireAdmin,
  requirePermission(PERMISSIONS.DEPOSITS_APPROVE),
  [body('reason').trim().isLength({ min: 5, max: 500 }).withMessage('Lý do phải có ít nhất 5 ký tự')],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return badRequest(res, errors.array()[0].msg);
    const reason = String(req.body.reason).trim();
    const result = await walletService.approveDeposit(String(req.params.id), req.user!.userId, reason, req);
    if (!result.success) return badRequest(res, result.error!);
    return ok(res, null, result.message);
  }
);

router.post(
  '/deposits/:id/reject',
  requireAdmin,
  requirePermission(PERMISSIONS.DEPOSITS_REJECT),
  [body('reason').trim().isLength({ min: 5, max: 500 }).withMessage('Lý do phải có ít nhất 5 ký tự')],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return badRequest(res, errors.array()[0].msg);
    const reason = String(req.body.reason).trim();
    const result = await walletService.rejectDeposit(String(req.params.id), req.user!.userId, reason, req);
    if (!result.success) return badRequest(res, result.error!);
    return ok(res, null, result.message);
  }
);

// =============================================
// BULK ACTIONS (Phase 3)
// =============================================

router.post(
  '/deposits/bulk-approve',
  requireAdmin,
  requirePermission(PERMISSIONS.DEPOSITS_APPROVE),
  [body('ids').isArray({ min: 1 }).withMessage('Chọn ít nhất 1 giao dịch'), body('reason').optional().isString()],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return badRequest(res, errors.array()[0].msg);
    const result = await walletService.bulkApproveDeposits(
      (req.body.ids as string[]).map(String),
      req.user!.userId,
      String(req.body.reason || ''),
      req
    );
    return ok(res, result, 'Xử lý hàng loạt hoàn tất');
  }
);

router.post(
  '/deposits/bulk-reject',
  requireAdmin,
  requirePermission(PERMISSIONS.DEPOSITS_REJECT),
  [body('ids').isArray({ min: 1 }).withMessage('Chọn ít nhất 1 giao dịch'), body('reason').optional().isString()],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return badRequest(res, errors.array()[0].msg);
    const result = await walletService.bulkRejectDeposits(
      (req.body.ids as string[]).map(String),
      req.user!.userId,
      String(req.body.reason || ''),
      req
    );
    return ok(res, result, 'Xử lý hàng loạt hoàn tất');
  }
);

router.get('/withdrawals', requireAdmin, async (req: AuthRequest, res: Response) => {
  const page = num(req.query.page, 1);
  const limit = num(req.query.limit, 20);
  const result = await walletService.getAllPendingWithdrawals(page, limit);
  return paginated(res, result.withdrawals, result.total, page, limit);
});

router.post(
  '/withdrawals/:id/approve',
  requireAdmin,
  requirePermission(PERMISSIONS.WITHDRAWALS_APPROVE),
  [body('reason').trim().isLength({ min: 5, max: 500 }).withMessage('Lý do phải có ít nhất 5 ký tự')],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return badRequest(res, errors.array()[0].msg);
    const reason = String(req.body.reason).trim();
    const result = await walletService.approveWithdraw(String(req.params.id), req.user!.userId, reason, req);
    if (!result.success) return badRequest(res, result.error!);
    return ok(res, null, result.message);
  }
);

router.post(
  '/withdrawals/:id/reject',
  requireAdmin,
  requirePermission(PERMISSIONS.WITHDRAWALS_REJECT),
  [body('reason').trim().isLength({ min: 5, max: 500 }).withMessage('Lý do phải có ít nhất 5 ký tự')],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return badRequest(res, errors.array()[0].msg);
    const reason = String(req.body.reason).trim();
    const result = await walletService.rejectWithdraw(String(req.params.id), req.user!.userId, reason, req);
    if (!result.success) return badRequest(res, result.error!);
    return ok(res, null, result.message);
  }
);

router.post(
  '/withdrawals/bulk-approve',
  requireAdmin,
  requirePermission(PERMISSIONS.WITHDRAWALS_APPROVE),
  [body('ids').isArray({ min: 1 }).withMessage('Chọn ít nhất 1 giao dịch'), body('reason').optional().isString()],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return badRequest(res, errors.array()[0].msg);
    const result = await walletService.bulkApproveWithdrawals(
      (req.body.ids as string[]).map(String),
      req.user!.userId,
      String(req.body.reason || ''),
      req
    );
    return ok(res, result, 'Xử lý hàng loạt hoàn tất');
  }
);

router.post(
  '/withdrawals/bulk-reject',
  requireAdmin,
  requirePermission(PERMISSIONS.WITHDRAWALS_REJECT),
  [body('ids').isArray({ min: 1 }).withMessage('Chọn ít nhất 1 giao dịch'), body('reason').optional().isString()],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return badRequest(res, errors.array()[0].msg);
    const result = await walletService.bulkRejectWithdrawals(
      (req.body.ids as string[]).map(String),
      req.user!.userId,
      String(req.body.reason || ''),
      req
    );
    return ok(res, result, 'Xử lý hàng loạt hoàn tất');
  }
);

router.get('/transactions', requireAdmin, async (req: AuthRequest, res: Response) => {
  const page = num(req.query.page, 1);
  const limit = num(req.query.limit, 20);
  const type = req.query.type ? String(req.query.type) : undefined;
  const result = await walletService.getAllTransactions(page, limit, type);
  return paginated(res, result.transactions, result.total, page, limit);
});

router.get('/packages', requireAdmin, async (_req: AuthRequest, res: Response) => {
  const packages = await investmentService.getPackageStats();
  return ok(res, packages);
});

router.put(
  '/packages/:id',
  requireAdmin,
  requirePermission(PERMISSIONS.PACKAGES_EDIT),
  async (req: AuthRequest, res: Response) => {
    const result = await investmentService.updatePackage(String(req.params.id), req.body);
    if (!result) return badRequest(res, 'Cập nhật thất bại');
    return ok(res, null, 'Cập nhật thành công');
  }
);

router.get('/news', requireAdmin, async (req: AuthRequest, res: Response) => {
  const page = num(req.query.page, 1);
  const limit = num(req.query.limit, 20);
  const category = req.query.category ? String(req.query.category) : undefined;
  const result = await newsService.getNews(category, page, limit);
  return paginated(res, result.news, result.total, page, limit);
});

router.post(
  '/news',
  requireAdmin,
  requirePermission(PERMISSIONS.NEWS_EDIT),
  async (req: AuthRequest, res: Response) => {
    const id = await newsService.createNews(req.body);
    if (!id) return badRequest(res, 'Tạo bài viết thất bại');
    return ok(res, { id }, 'Tạo bài viết thành công');
  }
);

router.put(
  '/news/:id',
  requireAdmin,
  requirePermission(PERMISSIONS.NEWS_EDIT),
  async (req: AuthRequest, res: Response) => {
    const result = await newsService.updateNews(String(req.params.id), req.body);
    if (!result) return badRequest(res, 'Cập nhật thất bại');
    return ok(res, null, 'Cập nhật thành công');
  }
);

router.delete(
  '/news/:id',
  requireAdmin,
  requirePermission(PERMISSIONS.NEWS_EDIT),
  async (req: AuthRequest, res: Response) => {
    const result = await newsService.deleteNews(String(req.params.id));
    if (!result) return badRequest(res, 'Xóa bài viết thất bại');
    return ok(res, null, 'Xóa bài viết thành công');
  }
);

// =============================================
// ADMIN MANAGEMENT (RBAC, super admin only)
// =============================================

router.get('/admins', requireSuperAdmin, async (_req: AuthRequest, res: Response) => {
  const result = await authService.getAdmins();
  return ok(res, result);
});

router.put(
  '/admins/:id',
  requireSuperAdmin,
  [body('role').optional().isIn(['admin', 'super_admin']), body('permissions').optional().isObject()],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return badRequest(res, errors.array()[0].msg);
    const result = await authService.updateAdmin(String(req.params.id), {
      role: req.body.role,
      permissions: req.body.permissions,
    });
    if (!result) return badRequest(res, 'Cập nhật thất bại');
    return ok(res, null, 'Cập nhật admin thành công');
  }
);

// =============================================
// MANUAL CRON TRIGGER (Phase 3: daily profit run on demand)
// =============================================

router.post('/cron/daily-profit', requireAdmin, async (_req: AuthRequest, res: Response) => {
  const result = await investmentService.addDailyProfits();
  return ok(res, result, 'Đã chạy job lợi nhuận hàng ngày');
});

// =============================================
// BROADCAST NOTIFICATION (Phase 3)
// =============================================

router.post(
  '/notifications/broadcast',
  requireAdmin,
  [
    body('title').trim().notEmpty().withMessage('Tiêu đề không được trống'),
    body('message').trim().notEmpty().withMessage('Nội dung không được trống'),
    body('type').optional().isIn(['info', 'success', 'warning', 'error', 'transaction']),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return badRequest(res, errors.array()[0].msg);
    const { title, message, type = 'info', link, targetFilter } = req.body;
    const count = await notificationService.broadcastNotification(
      String(title),
      String(message),
      String(type),
      link ? String(link) : undefined,
      targetFilter
    );
    return ok(res, { recipients: count }, `Đã gửi tới ${count} người`);
  }
);

// =============================================
// CHAT SUPPORT MANAGEMENT
// =============================================

router.get('/chat/conversations', requireAdmin, async (_req: AuthRequest, res: Response) => {
  const result = await chatService.adminListConversations();
  return ok(res, result);
});

router.get('/chat/conversations/:id/messages', requireAdmin, async (req: AuthRequest, res: Response) => {
  const result = await chatService.adminGetMessages(String(req.params.id));
  if (!result.success) return badRequest(res, result.error!);
  return ok(res, result);
});

router.post(
  '/chat/conversations/:id/reply',
  requireAdmin,
  [body('text').trim().notEmpty().withMessage('Tin nhắn không được trống')],
  async (req: AuthRequest, res: Response) => {
    const result = await chatService.adminReply(String(req.params.id), String(req.body.text));
    if (!result.success) return badRequest(res, result.error!);
    return ok(res, (result as any).message, 'Đã gửi trả lời');
  }
);

router.post('/chat/conversations/:id/close', requireAdmin, async (req: AuthRequest, res: Response) => {
  const result = await chatService.adminCloseConversation(String(req.params.id));
  if (!result) return badRequest(res, 'Đóng hội thoại thất bại');
  return ok(res, null, 'Đã đóng hội thoại');
});

export default router;
