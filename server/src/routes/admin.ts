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
import { requireAdmin, requireAuth, AuthRequest } from '../middleware/auth';
import { ok, badRequest, paginated } from '../utils/response';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/stats', requireAdmin, async (req: AuthRequest, res: Response) => {
  const stats = await authService.getStats();
  return ok(res, stats);
});

router.get('/users', requireAdmin, async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20' } = req.query;
  const result = await authService.getAllUsers(parseInt(page as string), parseInt(limit as string));
  return paginated(res, result.users, result.total, parseInt(page as string), parseInt(limit as string));
});

router.put('/users/:id/status', requireAdmin, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['active', 'suspended'].includes(status)) {
    return badRequest(res, 'Trạng thái không hợp lệ');
  }
  const result = await authService.updateUserStatus(id, status);
  if (!result) return badRequest(res, 'Cập nhật thất bại');
  return ok(res, null, 'Cập nhật trạng thái thành công');
});

router.post('/wallet/adjust', requireAdmin,
  [body('userId').notEmpty(), body('amount').isFloat(), body('action').isIn(['add', 'subtract']), body('note').notEmpty()],
  async (req: AuthRequest, res: Response) => {
    const { userId, amount, action, note } = req.body;
    const result = await walletService.adjustBalance(userId, amount, action, note, req.user!.userId, req);
    if (!result.success) return badRequest(res, result.error!);
    return ok(res, { reference: result.reference });
  }
);

router.get('/deposits', requireAdmin, async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20' } = req.query;
  const result = await walletService.getAllPendingDeposits(parseInt(page as string), parseInt(limit as string));
  return paginated(res, result.deposits, result.total, parseInt(page as string), parseInt(limit as string));
});

router.post('/deposits/:id/approve', requireAdmin, async (req: AuthRequest, res: Response) => {
  const result = await walletService.approveDeposit(req.params.id, req.user!.userId, req);
  if (!result.success) return badRequest(res, result.error!);
  return ok(res, null, result.message);
});

router.post('/deposits/:id/reject', requireAdmin, async (req: AuthRequest, res: Response) => {
  const result = await walletService.rejectDeposit(req.params.id, req.user!.userId, req);
  if (!result.success) return badRequest(res, result.error!);
  return ok(res, null, result.message);
});

router.get('/withdrawals', requireAdmin, async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20' } = req.query;
  const result = await walletService.getAllPendingWithdrawals(parseInt(page as string), parseInt(limit as string));
  return paginated(res, result.withdrawals, result.total, parseInt(page as string), parseInt(limit as string));
});

router.post('/withdrawals/:id/approve', requireAdmin, async (req: AuthRequest, res: Response) => {
  const result = await walletService.approveWithdraw(req.params.id, req.user!.userId, req);
  if (!result.success) return badRequest(res, result.error!);
  return ok(res, null, result.message);
});

router.post('/withdrawals/:id/reject', requireAdmin, async (req: AuthRequest, res: Response) => {
  const result = await walletService.rejectWithdraw(req.params.id, req.user!.userId, req);
  if (!result.success) return badRequest(res, result.error!);
  return ok(res, null, result.message);
});

router.get('/transactions', requireAdmin, async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20', type } = req.query;
  const result = await walletService.getAllTransactions(parseInt(page as string), parseInt(limit as string), type as string);
  return paginated(res, result.transactions, result.total, parseInt(page as string), parseInt(limit as string));
});

router.get('/packages', requireAdmin, async (req: AuthRequest, res: Response) => {
  const packages = await investmentService.getPackageStats();
  return ok(res, packages);
});

router.put('/packages/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  const result = await investmentService.updatePackage(req.params.id, req.body);
  if (!result) return badRequest(res, 'Cập nhật thất bại');
  return ok(res, null, 'Cập nhật thành công');
});

router.get('/news', requireAdmin, async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20', category } = req.query;
  const result = await newsService.getNews(category as string, parseInt(page as string), parseInt(limit as string));
  return paginated(res, result.news, result.total, parseInt(page as string), parseInt(limit as string));
});

router.post('/news', requireAdmin, async (req: AuthRequest, res: Response) => {
  const id = await newsService.createNews(req.body);
  if (!id) return badRequest(res, 'Tạo bài viết thất bại');
  return ok(res, { id }, 'Tạo bài viết thành công');
});

router.put('/news/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  const result = await newsService.updateNews(req.params.id, req.body);
  if (!result) return badRequest(res, 'Cập nhật thất bại');
  return ok(res, null, 'Cập nhật thành công');
});

router.delete('/news/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  const result = await newsService.deleteNews(req.params.id);
  if (!result) return badRequest(res, 'Xóa bài viết thất bại');
  return ok(res, null, 'Xóa bài viết thành công');
});

// =============================================
// CHAT SUPPORT MANAGEMENT
// =============================================

router.get('/chat/conversations', requireAdmin, async (req: AuthRequest, res: Response) => {
  const result = await chatService.adminListConversations();
  return ok(res, result);
});

router.get('/chat/conversations/:id/messages', requireAdmin, async (req: AuthRequest, res: Response) => {
  const result = await chatService.adminGetMessages(req.params.id);
  if (!result.success) return badRequest(res, result.error!);
  return ok(res, result);
});

router.post(
  '/chat/conversations/:id/reply',
  requireAdmin,
  [body('text').trim().notEmpty().withMessage('Tin nhắn không được trống')],
  async (req: AuthRequest, res: Response) => {
    const result = await chatService.adminReply(req.params.id, req.body.text);
    if (!result.success) return badRequest(res, result.error!);
    return ok(res, result.message, 'Đã gửi trả lời');
  }
);

router.post('/chat/conversations/:id/close', requireAdmin, async (req: AuthRequest, res: Response) => {
  const result = await chatService.adminCloseConversation(req.params.id);
  if (!result) return badRequest(res, 'Đóng hội thoại thất bại');
  return ok(res, null, 'Đã đóng hội thoại');
});

export default router;
