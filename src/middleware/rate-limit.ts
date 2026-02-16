// Cherokee Bank - Rate Limiter Middleware
import { cacheIncr, cacheGet } from '@/src/config/redis';
import { getClientIp } from '@/src/utils/helpers';

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;    // Max requests per window
  keyPrefix?: string;     // Redis key prefix
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

// Default limits for different endpoints
export const rateLimits = {
  general: { windowMs: 60000, maxRequests: 100, keyPrefix: 'rl:gen' },
  auth: { windowMs: 60000, maxRequests: 5, keyPrefix: 'rl:auth' },
  transfer: { windowMs: 60000, maxRequests: 10, keyPrefix: 'rl:txn' },
  ai: { windowMs: 3600000, maxRequests: 20, keyPrefix: 'rl:ai' },
  admin: { windowMs: 60000, maxRequests: 50, keyPrefix: 'rl:admin' },
} as const;

/**
 * Check rate limit for a given identifier
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = rateLimits.general
): Promise<RateLimitResult> {
  const windowSeconds = Math.ceil(config.windowMs / 1000);
  const key = `${config.keyPrefix || 'rl'}:${identifier}`;

  try {
    const count = await cacheIncr(key, windowSeconds);
    const allowed = count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - count);
    const resetAt = Date.now() + config.windowMs;

    return { allowed, remaining, resetAt };
  } catch {
    // If Redis is unavailable, allow the request (fail open)
    return { allowed: true, remaining: config.maxRequests, resetAt: Date.now() + config.windowMs };
  }
}

/**
 * Rate limit by IP address
 */
export async function rateLimitByIp(
  headers: Headers,
  config: RateLimitConfig = rateLimits.general
): Promise<RateLimitResult> {
  const ip = getClientIp(headers);
  return checkRateLimit(ip, config);
}

/**
 * Rate limit by user ID
 */
export async function rateLimitByUser(
  userId: string,
  config: RateLimitConfig = rateLimits.general
): Promise<RateLimitResult> {
  return checkRateLimit(`user:${userId}`, config);
}

/**
 * Combined rate limit (IP + user)
 */
export async function rateLimitCombined(
  headers: Headers,
  userId: string | null,
  config: RateLimitConfig = rateLimits.general
): Promise<RateLimitResult> {
  const ipResult = await rateLimitByIp(headers, config);
  if (!ipResult.allowed) return ipResult;

  if (userId) {
    return rateLimitByUser(userId, config);
  }

  return ipResult;
}
