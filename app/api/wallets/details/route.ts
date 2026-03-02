// Cherokee Bank - Wallet Details API Route
import { NextRequest } from 'next/server';
import { requireAuth } from '@/src/server/auth/guards';
import { WalletService } from '@/src/server/banking/wallet.service';
import { successResponse, errorResponse } from '@/src/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get('walletId');

    if (!walletId) {
      return errorResponse('VALIDATION_ERROR', 'walletId query parameter is required', 400);
    }

    const wallet = await WalletService.getWalletDetails(walletId, authResult.userId);

    if (!wallet) {
      return errorResponse('NOT_FOUND', 'Wallet not found', 404);
    }

    return successResponse({
      wallet: {
        id: wallet.id,
        currency: wallet.currency,
        balance: wallet.balance.toString(),
        availableBalance: wallet.availableBalance.toString(),
        isDefault: wallet.isDefault,
        status: wallet.status,
        dailyLimit: wallet.dailyLimit.toString(),
        monthlyLimit: wallet.monthlyLimit.toString(),
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
        recentTransactions: [
          ...wallet.outgoingTransactions.map((t) => ({ ...t, direction: 'outgoing' as const })),
          ...wallet.incomingTransactions.map((t) => ({ ...t, direction: 'incoming' as const })),
        ]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10),
      },
    });
  } catch (error) {
    console.error('Wallet details error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch wallet details', 500);
  }
}
