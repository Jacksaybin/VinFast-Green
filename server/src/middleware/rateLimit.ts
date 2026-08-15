/**
 * Rate-limit middleware - in-memory token bucket
 * For production use Redis. This is a simple per-process implementation.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Returns true if request is allowed, false if rate-limited.
 * Default: 10 requests per 60-second window per key.
 */
export function rateLimit(key: string, maxRequests = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= maxRequests) {
    return false;
  }

  bucket.count++;
  return true;
}

/**
 * Express middleware factory.
 * Identifies the client by ip + optional route prefix.
 */
export function rateLimitMiddleware(maxRequests: number, windowMs: number, prefix = 'rl') {
  return (req: any, res: any, next: any) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const key = `${prefix}:${ip}:${req.method}:${req.path}`;
    if (!rateLimit(key, maxRequests, windowMs)) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json({
        success: false,
        error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
      });
    }
    next();
  };
}

/**
 * Express middleware factory — rate limit theo authenticated userId.
 * Phải dùng SAU requireAuth. Hiệu quả hơn IP-based khi user dùng 4G/IP động.
 */
export function userRateLimitMiddleware(maxRequests: number, windowMs: number, prefix = 'rl-user') {
  return (req: any, res: any, next: any) => {
    const userId = req.user?.userId;
    if (!userId) {
      // Không có userId → fallback IP (hoặc next nếu bạn muốn fail-closed)
      const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      const key = `${prefix}:ip:${ip}:${req.method}:${req.path}`;
      if (!rateLimit(key, maxRequests, windowMs)) {
        res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
        return res.status(429).json({ success: false, error: 'Quá nhiều yêu cầu.' });
      }
      return next();
    }
    const key = `${prefix}:${userId}:${req.method}:${req.baseUrl}${req.path}`;
    if (!rateLimit(key, maxRequests, windowMs)) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json({
        success: false,
        error: 'Quá nhiều yêu cầu từ tài khoản của bạn. Vui lòng thử lại sau.',
      });
    }
    next();
  };
}

/**
 * Periodically clean up expired buckets to avoid memory leak.
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 5 * 60_000).unref();
