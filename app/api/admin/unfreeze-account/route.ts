// Cherokee Bank - Admin Unfreeze Account API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAdmin } from '@/src/server/auth/guards';
import { successResponse, errorResponse } from '@/src/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if ('status' in authResult) return authResult;

    const body = await request.json();
    const { userId, reason } = body;

    if (!userId) return errorResponse('VALIDATION_ERROR', 'User ID is required', 400);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return errorResponse('NOT_FOUND', 'User not found', 404);
    if (user.status !== 'FROZEN') return errorResponse('CONFLICT', 'Account is not frozen', 409);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { status: 'ACTIVE' },
      }),
      prisma.wallet.updateMany({
        where: { userId },
        data: { status: 'ACTIVE' },
      }),
      prisma.securityEvent.create({
        data: {
          userId,
          type: 'ACCOUNT_UNFROZEN',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: { unfrozenBy: authResult.userId, reason },
        },
      }),
      prisma.auditLog.create({
        data: {
          actorId: authResult.userId,
          action: 'UNFREEZE_ACCOUNT',
          targetType: 'USER',
          targetId: userId,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || null,
          metadata: { reason },
        },
      }),
    ]);

    return successResponse({ message: 'Account unfrozen successfully', userId });
  } catch (error) {
    console.error('Unfreeze account error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to unfreeze account', 500);
  }
}
