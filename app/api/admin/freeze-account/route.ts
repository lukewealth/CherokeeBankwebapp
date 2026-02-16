// Cherokee Bank - Admin Freeze Account API Route
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
    if (!reason) return errorResponse('VALIDATION_ERROR', 'Reason is required', 400);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return errorResponse('NOT_FOUND', 'User not found', 404);
    if (user.status === 'FROZEN') return errorResponse('CONFLICT', 'Account is already frozen', 409);
    if (user.role === 'SUPERADMIN') return errorResponse('FORBIDDEN', 'Cannot freeze a superadmin', 403);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { status: 'FROZEN' },
      }),
      prisma.wallet.updateMany({
        where: { userId },
        data: { status: 'FROZEN' },
      }),
      prisma.securityEvent.create({
        data: {
          userId,
          type: 'ACCOUNT_FROZEN',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: { frozenBy: authResult.userId, reason },
        },
      }),
      prisma.auditLog.create({
        data: {
          actorId: authResult.userId,
          action: 'FREEZE_ACCOUNT',
          targetType: 'USER',
          targetId: userId,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || null,
          metadata: { reason },
        },
      }),
    ]);

    return successResponse({ message: 'Account frozen successfully', userId });
  } catch (error) {
    console.error('Freeze account error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to freeze account', 500);
  }
}
