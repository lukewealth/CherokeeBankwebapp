// Cherokee Bank - Session Management
import { prisma } from '@/src/config/db';
import { hashPassword } from './bcrypt';
import crypto from 'crypto';

/**
 * Store refresh token in database
 */
export async function storeRefreshToken(
  userId: string,
  refreshToken: string,
  deviceInfo?: string,
  ipAddress?: string
): Promise<void> {
  const tokenHash = hashTokenForStorage(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      deviceInfo,
      ipAddress,
      expiresAt,
    },
  });
}

/**
 * Validate and consume refresh token
 */
export async function validateRefreshToken(refreshToken: string): Promise<{ valid: boolean; userId?: string }> {
  const tokenHash = hashTokenForStorage(refreshToken);

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    return { valid: false };
  }

  // Revoke the old token (rotation)
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revoked: true },
  });

  return { valid: true, userId: stored.userId };
}

/**
 * Revoke all refresh tokens for a user
 */
export async function revokeAllTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}

/**
 * Revoke a specific refresh token
 */
export async function revokeToken(refreshToken: string): Promise<void> {
  const tokenHash = hashTokenForStorage(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revoked: false },
    data: { revoked: true },
  });
}

/**
 * Clean up expired tokens
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { revoked: true, createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      ],
    },
  });
  return result.count;
}

/**
 * Hash token for secure storage
 */
function hashTokenForStorage(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
