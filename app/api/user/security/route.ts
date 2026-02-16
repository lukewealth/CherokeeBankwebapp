// Cherokee Bank - User Security Settings API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAuth } from '@/src/server/auth/guards';
import { successResponse, errorResponse } from '@/src/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: {
        twoFactorEnabled: true,
        lastLoginAt: true,
        lastLoginIp: true,
        failedLoginCount: true,
      },
    });

    if (!user) {
      return errorResponse('NOT_FOUND', 'User not found', 404);
    }

    return successResponse({
      twoFactorEnabled: user.twoFactorEnabled,
      lastLoginAt: user.lastLoginAt,
      lastLoginIp: user.lastLoginIp,
      failedLoginCount: user.failedLoginCount,
    });
  } catch (error) {
    console.error('Security settings fetch error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch security settings', 500);
  }
}
