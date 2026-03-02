// Cherokee Bank - JWT Token Management
import jwt from 'jsonwebtoken';
import type { JWTPayload, UserRole } from '@/src/types/user';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production-32chars!';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-prod-32!';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Generate access + refresh token pair
 */
export function generateTokens(userId: string, email: string, role: UserRole): TokenPair {
  const accessExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
  const refreshExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';

  const accessToken = jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: accessExpiry as any, issuer: 'cherokee-bank', audience: 'cherokee-bank-api' }
  );

  const refreshToken = jwt.sign(
    { userId, email, role, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: refreshExpiry as any, issuer: 'cherokee-bank' }
  );

  // Parse expiry to seconds
  const expiresIn = parseExpiry(accessExpiry);

  return { accessToken, refreshToken, expiresIn };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET, {
    issuer: 'cherokee-bank',
    audience: 'cherokee-bank-api',
  }) as JWTPayload;
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload & { type: string } {
  return jwt.verify(token, JWT_REFRESH_SECRET, {
    issuer: 'cherokee-bank',
  }) as JWTPayload & { type: string };
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

/**
 * Parse expiry string to seconds (e.g., "15m" -> 900)
 */
function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // default 15min
  const [, num, unit] = match;
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return parseInt(num) * (multipliers[unit] || 60);
}
