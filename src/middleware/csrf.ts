// Cherokee Bank - CSRF Protection Middleware
import crypto from 'crypto';
import { cacheGet, cacheSet } from '@/src/config/redis';

const CSRF_TOKEN_TTL = 3600; // 1 hour

/**
 * Generate a CSRF token for a session
 */
export async function generateCsrfToken(sessionId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  await cacheSet(`csrf:${sessionId}`, token, CSRF_TOKEN_TTL);
  return token;
}

/**
 * Validate a CSRF token
 */
export async function validateCsrfToken(sessionId: string, token: string): Promise<boolean> {
  const stored = await cacheGet(`csrf:${sessionId}`);
  if (!stored || stored !== token) return false;
  return true;
}
