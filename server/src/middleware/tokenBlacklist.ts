/**
 * JWT Token Blacklist (in-memory)
 *
 * Mục đích:
 *   - Cho phép logout vô hiệu hoá access token ngay lập tức (mặc định JWT stateless).
 *   - Cho phép admin force-revoke một session cụ thể.
 *
 * Lưu ý production:
 *   - In-memory chỉ hoạt động trong 1 process → với multi-instance cần Redis hoặc PG table.
 *   - Dùng `jti` (JWT ID) làm key để tìm kiếm O(1).
 *   - Tự động cleanup entry hết hạn để tránh memory leak.
 */

interface BlacklistEntry {
  jti: string;
  userId: string;
  reason: 'logout' | 'admin_revoke' | 'security';
  expiresAt: number; // unix ms
  revokedAt: number;
}

const blacklist = new Map<string, BlacklistEntry>();

export const tokenBlacklist = {
  /**
   * Thêm jti vào blacklist. Auto-revoke khi đã expire (token hết hạn tự nhiên).
   */
  add(jti: string, userId: string, expSec: number, reason: BlacklistEntry['reason'] = 'logout') {
    if (!jti) return;
    const expiresAt = expSec * 1000;
    // Nếu token đã hết hạn thì không cần track (JWT verify sẽ reject)
    if (expiresAt <= Date.now()) return;
    blacklist.set(jti, { jti, userId, reason, expiresAt, revokedAt: Date.now() });
  },

  has(jti: string): boolean {
    if (!jti) return false;
    const entry = blacklist.get(jti);
    if (!entry) return false;
    if (entry.expiresAt <= Date.now()) {
      blacklist.delete(jti);
      return false;
    }
    return true;
  },

  /**
   * Revoke tất cả token của một user (dùng khi admin suspend, đổi password, etc.)
   * Lưu ý: chỉ revoke được token CÓ jti; token cũ (không có jti) vẫn còn hiệu lực
   * tới khi hết hạn tự nhiên. Khuyến nghị rotate JWT_SECRET khi cần force-revoke toàn bộ.
   */
  revokeAllForUser(userId: string, reason: BlacklistEntry['reason'] = 'admin_revoke'): number {
    let count = 0;
    const now = Date.now();
    // Không thể liệt kê token chưa-có trong DB (stateless), nên hàm này chỉ
    // dùng để đánh dấu "user này bị block". Check user-level block riêng:
    blacklistedUsers.set(userId, { userId, reason: 'admin_revoke', blockedAt: now });
    return count + 1;
  },

  /**
   * Cleanup entry đã hết hạn định kỳ (chạy trong setInterval).
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;
    for (const [jti, entry] of blacklist.entries()) {
      if (entry.expiresAt <= now) {
        blacklist.delete(jti);
        removed++;
      }
    }
    return removed;
  },

  size(): number {
    return blacklist.size;
  },
};

/**
 * User-level block (khi admin suspend user, force logout all sessions).
 * Khác với jti blacklist vì stateless JWT không cho liệt kê tất cả jti của user.
 */
interface UserBlock {
  userId: string;
  reason: 'admin_revoke' | 'security';
  blockedAt: number;
}

const blacklistedUsers = new Map<string, UserBlock>();

export const userBlacklist = {
  isBlocked(userId: string): boolean {
    return blacklistedUsers.has(userId);
  },

  block(userId: string, reason: UserBlock['reason'] = 'admin_revoke') {
    blacklistedUsers.set(userId, { userId, reason, blockedAt: Date.now() });
  },

  unblock(userId: string) {
    blacklistedUsers.delete(userId);
  },

  size(): number {
    return blacklistedUsers.size;
  },
};

// Auto cleanup mỗi 5 phút
setInterval(() => {
  const removed = tokenBlacklist.cleanup();
  if (removed > 0) {
    // Chỉ log khi có cleanup, tránh spam
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[tokenBlacklist] Cleaned up ${removed} expired entries`);
    }
  }
}, 5 * 60_000).unref();
