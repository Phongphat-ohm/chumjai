interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * In-memory rate limiter helper
 * @param key Unique key (e.g. IP address or username)
 * @param maxHits Maximum allowed attempts in window
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(
  key: string,
  maxHits: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { success: boolean; remaining: number; resetTimeMs: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: maxHits - 1, resetTimeMs: now + windowMs };
  }

  if (entry.count >= maxHits) {
    return { success: false, remaining: 0, resetTimeMs: entry.resetTime };
  }

  entry.count += 1;
  return {
    success: true,
    remaining: maxHits - entry.count,
    resetTimeMs: entry.resetTime,
  };
}
