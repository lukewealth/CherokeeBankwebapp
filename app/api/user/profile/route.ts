// Cherokee Bank - User Profile API Route
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
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        kycStatus: true,
        twoFactorEnabled: true,
        avatarUrl: true,
        dateOfBirth: true,
        street: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: { wallets: true, cryptoWallets: true, sentTransactions: true },
        },
      },
    });

    if (!user) {
      return errorResponse('NOT_FOUND', 'User not found', 404);
    }

    return successResponse({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch profile', 500);
  }
}
