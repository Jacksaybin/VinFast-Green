/**
 * Chat Service - Support chat between users and admins
 */

import { query, queryOne, execute } from '../db';
import { notificationService } from './notificationService';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender: 'user' | 'admin';
  text: string;
  is_read: boolean;
  created_at: string;
}

export const chatService = {
  /**
   * Get or create a conversation for the given client_ref (guest) or user.
   */
  async getOrCreateConversation(
    clientRef: string,
    userId?: string | null,
    userName?: string
  ) {
    if (!clientRef) {
      return { success: false, error: 'Thiếu clientRef' };
    }

    let conversation = await queryOne<any>(
      'SELECT * FROM chat_conversations WHERE client_ref = $1',
      [clientRef]
    );

    if (!conversation) {
      const result = await queryOne<any>(
        `INSERT INTO chat_conversations (client_ref, user_id, user_name)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [clientRef, userId || null, userName || '']
      );
      conversation = result;
    } else if (userId && conversation.user_id !== userId) {
      conversation = await queryOne<any>(
        `UPDATE chat_conversations SET user_id = $1, user_name = $2, updated_at = NOW()
         WHERE client_ref = $3
         RETURNING *`,
        [userId, userName || '', clientRef]
      );
    }

    return { success: true, conversation };
  },

  /**
   * Get messages for a conversation (user side). Also marks admin->user messages as read.
   */
  async getMessages(clientRef: string, userId?: string | null) {
    const conv = await this.getConversationByRef(clientRef, userId);
    if (!conv) return { success: false, error: 'Không tìm thấy cuộc hội thoại' };

    const messages = await query<ChatMessage>(
      'SELECT * FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conv.id]
    );

    await execute(
      `UPDATE chat_messages SET is_read = true
       WHERE conversation_id = $1 AND sender = 'admin' AND is_read = false`,
      [conv.id]
    );

    return { success: true, messages };
  },

  /**
   * User sends a message.
   */
  async sendUserMessage(
    clientRef: string,
    text: string,
    userId?: string | null,
    userName?: string
  ) {
    const msg = (text || '').trim();
    if (!msg) return { success: false, error: 'Tin nhắn không được trống' };

    const conv = await this.getOrCreateConversation(clientRef, userId, userName);
    if (!conv.success) return conv;

    const result = await queryOne<ChatMessage>(
      `INSERT INTO chat_messages (conversation_id, sender, text)
       VALUES ($1, 'user', $2)
       RETURNING *`,
      [conv.conversation.id, msg]
    );

    await execute(
      `UPDATE chat_conversations
       SET last_message = $2, last_message_at = NOW(), unread_count = unread_count + 1, updated_at = NOW()
       WHERE id = $1`,
      [conv.conversation.id, msg]
    );

    return { success: true, message: result };
  },

  /**
   * Admin replies to a conversation.
   */
  async adminReply(conversationId: string, text: string) {
    const msg = (text || '').trim();
    if (!msg) return { success: false, error: 'Tin nhắn không được trống' };

    const conv = await queryOne<any>(
      'SELECT id, user_id FROM chat_conversations WHERE id = $1',
      [conversationId]
    );
    if (!conv) return { success: false, error: 'Không tìm thấy cuộc hội thoại' };

    const result = await queryOne<ChatMessage>(
      `INSERT INTO chat_messages (conversation_id, sender, text)
       VALUES ($1, 'admin', $2)
       RETURNING *`,
      [conv.id, msg]
    );

    await execute(
      `UPDATE chat_conversations
       SET last_message = $2, last_message_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [conv.id, msg]
    );

    if (conv.user_id) {
      await notificationService.createNotification(
        conv.user_id,
        'Tin nhắn mới từ hỗ trợ',
        msg,
        'info',
        '#/chat'
      );
    }

    return { success: true, message: result };
  },

  /**
   * Admin lists all conversations with last message info.
   */
  async adminListConversations() {
    const conversations = await query<any>(
      `SELECT c.*, u.full_name AS user_full_name, u.phone AS user_phone
       FROM chat_conversations c
       LEFT JOIN users u ON u.id = c.user_id
       ORDER BY c.last_message_at DESC NULLS LAST, c.updated_at DESC`
    );

    const totalUnread = conversations.reduce(
      (sum, c) => sum + (parseInt(c.unread_count) || 0),
      0
    );

    return { conversations, totalUnread };
  },

  async adminGetMessages(conversationId: string) {
    const conv = await queryOne<any>(
      'SELECT * FROM chat_conversations WHERE id = $1',
      [conversationId]
    );
    if (!conv) return { success: false, error: 'Không tìm thấy cuộc hội thoại' };

    const messages = await query<ChatMessage>(
      'SELECT * FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversationId]
    );

    await execute(
      `UPDATE chat_messages SET is_read = true
       WHERE conversation_id = $1 AND sender = 'user' AND is_read = false`,
      [conversationId]
    );
    await execute(
      `UPDATE chat_conversations SET unread_count = 0, updated_at = NOW()
       WHERE id = $1`,
      [conversationId]
    );

    return { success: true, conversation: conv, messages };
  },

  async adminCloseConversation(conversationId: string) {
    const result = await execute(
      `UPDATE chat_conversations SET status = 'closed', updated_at = NOW() WHERE id = $1`,
      [conversationId]
    );
    return result > 0;
  },

  async getConversationByRef(clientRef: string, userId?: string | null) {
    return queryOne<any>(
      'SELECT * FROM chat_conversations WHERE client_ref = $1 AND ($2::uuid IS NULL OR user_id = $2::uuid)',
      [clientRef, userId || null]
    );
  },
};