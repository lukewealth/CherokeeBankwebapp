// Cherokee Bank - Token Refresh API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { verifyRefreshToken, generateTokens } from '@/src/server/auth/jwt';
import { successResponse, errorResponse } from '@/src/utils/api-response';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return errorResponse('VALIDATION_ERROR', 'Refresh token is required', 400);
    }

    // Verify the refresh token
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return errorResponse('TOKEN_INVALID', 'Invalid or expired refresh token', 401);
    }

    if (payload.type !== 'refresh') {
      return errorResponse('TOKEN_INVALID', 'Invalid token type', 401);
    }

    // Check if refresh token exists in DB and isn't revoked
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!storedToken || storedToken.revoked || new Date(storedToken.expiresAt) < new Date()) {
      return errorResponse('TOKEN_INVALID', 'Refresh token has been revoked or expired', 401);
    }

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      // Revoke the token
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true },
      });
      return errorResponse('UNAUTHORIZED', 'User account is not active', 401);
    }

    // Revoke old refresh token (rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    // Generate new token pair
    const tokens = generateTokens(user.id, user.email, user.role);

    // Store new refresh token
    const newTokenHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newTokenHash,
        deviceInfo: request.headers.get('user-agent') || null,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return successResponse({ tokens });
  } catch (error) {
    console.error('Token refresh error:', error);
    return errorResponse('INTERNAL_ERROR', 'Token refresh failed', 500);
  }
}
