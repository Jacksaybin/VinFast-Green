/**
 * Chat Routes - User support chat (works for guests and logged-in users)
 */

import { Router, Response } from 'express';
import { body } from 'express-validator';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { chatService } from '../services/chatService';
import { ok, badRequest } from '../utils/response';

const router = Router();

function getClientRef(req: AuthRequest): string {
  return (req.headers['x-client-ref'] as string) || '';
}

router.get(
  '/conversation',
  optionalAuth,
  async (req: AuthRequest, res: Response) => {
    const clientRef = getClientRef(req);
    if (!clientRef) return badRequest(res, 'Thiếu clientRef');

    const conv = await chatService.getOrCreateConversation(
      clientRef,
      req.user?.userId,
      req.user?.phone
    );
    if (!conv.success) return badRequest(res, conv.error!);

    const result = await chatService.getMessages(clientRef, req.user?.userId);
    if (!result.success) return badRequest(res, result.error!);

    return ok(res, {
      conversation: conv.conversation,
      messages: result.messages,
    });
  }
);

router.post(
  '/messages',
  optionalAuth,
  [body('text').trim().notEmpty().withMessage('Tin nhắn không được trống')],
  async (req: AuthRequest, res: Response) => {
    const clientRef = getClientRef(req);
    const { text } = req.body;

    const result = await chatService.sendUserMessage(
      clientRef,
      text,
      req.user?.userId,
      req.user?.phone
    );
    if (!result.success) return badRequest(res, result.error!);

    return ok(res, result.message, 'Gửi tin nhắn thành công');
  }
);

export default router;