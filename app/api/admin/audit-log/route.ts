// Cherokee Bank - Admin Audit Log API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAdmin } from '@/src/server/auth/guards';
import { successResponse, errorResponse } from '@/src/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if ('status' in authResult) return authResult;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'));
    const action = searchParams.get('action');
    const actorId = searchParams.get('actorId');
    const targetType = searchParams.get('targetType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = {};
    if (action) where.action = action;
    if (actorId) where.actorId = actorId;
    if (targetType) where.targetType = targetType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.createdAt as Record<string, unknown>).lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: where as never,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          actor: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        },
      }),
      prisma.auditLog.count({ where: where as never }),
    ]);

    return successResponse(
      { logs },
      200,
      { page, limit, total, totalPages: Math.ceil(total / limit) },
    );
  } catch (error) {
    console.error('Audit log error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch audit logs', 500);
  }
}
