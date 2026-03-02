// Cherokee Bank - Get All Wallets API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAuth } from '@/src/server/auth/guards';
import { successResponse, errorResponse } from '@/src/utils/api-response';
import crypto from 'crypto';

// Helper function to generate deterministic bank account number
function generateBankAccountNumber(walletId: string, currency: string): string {
  const hash = crypto.createHash('sha256').update(walletId + currency).digest('hex');
  // Format: CBxxx-yyyyyyyy-zzzzzz (Cherokee Bank format)
  const part1 = hash.substring(0, 3).toUpperCase();
  const part2 = hash.substring(3, 11);
  const part3 = hash.substring(11, 17);
  return `CB${part1}-${part2}-${part3}`;
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const wallets = await prisma.wallet.findMany({
      where: { userId: authResult.userId },
      select: {
        id: true,
        currency: true,
        balance: true,
        availableBalance: true,
        isDefault: true,
        status: true,
        dailyLimit: true,
        monthlyLimit: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({
      wallets: wallets.map((wallet) => ({
        id: wallet.id,
        currency: wallet.currency,
        balance: wallet.balance.toString(),
        availableBalance: wallet.availableBalance.toString(),
        isDefault: wallet.isDefault,
        status: wallet.status,
        dailyLimit: wallet.dailyLimit.toString(),
        monthlyLimit: wallet.monthlyLimit.toString(),
        bankAccountNumber: generateBankAccountNumber(wallet.id, wallet.currency),
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Wallets fetch error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch wallets', 500);
  }
}
