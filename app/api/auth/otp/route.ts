// Cherokee Bank - OTP Verify / Generate API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { generateTokens } from '@/src/server/auth/jwt';
import { successResponse, errorResponse } from '@/src/utils/api-response';

/**
 * POST - Verify OTP code for 2FA login
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, code, type = 'LOGIN' } = body;

    if (!userId || !code) {
      return errorResponse('VALIDATION_ERROR', 'User ID and OTP code are required', 400);
    }

    // Find valid OTP
    const otp = await prisma.oTPCode.findFirst({
      where: {
        userId,
        code,
        type,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      return errorResponse('INVALID_OTP', 'Invalid or expired OTP code', 401);
    }

    // Mark OTP as used
    await prisma.oTPCode.update({
      where: { id: otp.id },
      data: { used: true },
    });

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        kycStatus: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      return errorResponse('NOT_FOUND', 'User not found', 404);
    }

    // Update last login
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    // Generate tokens
    const tokens = generateTokens(user.id, user.email, user.role);

    // Store refresh token
    const crypto = await import('crypto');
    const tokenHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        kycStatus: user.kycStatus,
      },
      tokens,
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return errorResponse('INTERNAL_ERROR', 'OTP verification failed', 500);
  }
}
