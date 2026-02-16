// Cherokee Bank - Logout API Route
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAuth } from '@/src/server/auth/guards';
import { successResponse, errorResponse } from '@/src/utils/api-response';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Attempt auth — but don't block logout if token is expired/missing
    const authResult = await requireAuth(request).catch(() => null);
    const userId = authResult && !('status' in authResult) ? authResult.userId : null;

    if (userId) {
      const body = await request.json().catch(() => ({}));
      const { refreshToken } = body;

      // Revoke specific refresh token if provided
      if (refreshToken) {
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        await prisma.refreshToken.updateMany({
          where: { tokenHash, userId },
          data: { revoked: true },
        });
      } else {
        // Revoke ALL refresh tokens for this user (full logout)
        await prisma.refreshToken.updateMany({
          where: { userId, revoked: false },
          data: { revoked: true },
        });
      }

      // Log security event
      await prisma.securityEvent.create({
        data: {
          userId,
          type: 'LOGOUT',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });
    }

    // Always create response and clear cookies — even if auth failed
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
