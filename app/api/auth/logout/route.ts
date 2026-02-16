// Cherokee Bank - Logout API Route
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAuth } from '@/src/server/auth/guards';
import { successResponse, errorResponse } from '@/src/utils/api-response';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const body = await request.json().catch(() => ({}));
    const { refreshToken } = body;

    // Revoke specific refresh token if provided
    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await prisma.refreshToken.updateMany({
        where: { tokenHash, userId: authResult.userId },
        data: { revoked: true },
      });
    } else {
      // Revoke ALL refresh tokens for this user (full logout)
      await prisma.refreshToken.updateMany({
        where: { userId: authResult.userId, revoked: false },
        data: { revoked: true },
      });
    }

    // Log security event
    await prisma.securityEvent.create({
      data: {
        userId: authResult.userId,
        type: 'LOGOUT',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // Create response
    const response = successResponse({ message: 'Logged out successfully' });

    // Clear auth cookies
    response.cookies.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse('INTERNAL_ERROR', 'Logout failed', 500);
  }
}
