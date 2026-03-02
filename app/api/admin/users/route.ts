// Cherokee Bank - Admin Users API Route
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
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const role = searchParams.get('role');
    const kycStatus = searchParams.get('kycStatus');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (role) where.role = role;
    if (kycStatus) where.kycStatus = kycStatus;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: where as never,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          kycStatus: true,
          twoFactorEnabled: true,
          lastLoginAt: true,
          createdAt: true,
          _count: { select: { wallets: true, sentTransactions: true } },
        },
      }),
      prisma.user.count({ where: where as never }),
    ]);

    return successResponse(
      { users },
      200,
      { page, limit, total, totalPages: Math.ceil(total / limit) },
    );
  } catch (error) {
    console.error('Admin users error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch users', 500);
  }
}
