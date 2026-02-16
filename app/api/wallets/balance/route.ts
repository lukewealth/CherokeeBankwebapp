// Cherokee Bank - Wallet Balance API Route
import { NextRequest } from 'next/server';
import { requireAuth } from '@/src/server/auth/guards';
import { WalletService } from '@/src/server/banking/wallet.service';
import { successResponse, errorResponse } from '@/src/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const wallets = await WalletService.getWallets(authResult.userId);

    const balances = wallets.map((w) => ({
      id: w.id,
      currency: w.currency,
      balance: w.balance.toString(),
      availableBalance: w.availableBalance.toString(),
      isDefault: w.isDefault,
      status: w.status,
    }));

    const totalUSD = wallets.reduce((sum, w) => {
      // Simplified: treat all as USD equivalent for total
      return sum + parseFloat(w.balance.toString());
    }, 0);

    return successResponse({ wallets: balances, totalBalanceUSD: totalUSD.toFixed(2) });
  } catch (error) {
    console.error('Balance fetch error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch balances', 500);
  }
}
