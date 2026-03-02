// Cherokee Bank - Dashboard Stats API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAuth } from '@/src/server/auth/guards';
import { successResponse, errorResponse } from '@/src/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const [wallets, cryptoWallets, transactions, user] = await Promise.all([
      prisma.wallet.findMany({
        where: { userId: authResult.userId },
        select: { balance: true },
      }),
      prisma.cryptoWallet.findMany({
        where: { userId: authResult.userId },
        select: { balance: true, currency: true },
      }),
      prisma.transaction.findMany({
        where: {
          OR: [
            { senderId: authResult.userId },
            { fromWallet: { userId: authResult.userId } },
            { toWallet: { userId: authResult.userId } },
          ],
        },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { id: authResult.userId },
        select: { kycStatus: true, status: true },
      }),
    ]);

    // Calculate total balance (convert crypto to USD equivalent - mock rates)
    const mockCryptoRates: Record<string, number> = {
      BTC: 43500,
      ETH: 2300,
      USDT: 1,
    };

    const fiatBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    const cryptoBalanceUSD = cryptoWallets.reduce((sum, w) => {
      const rate = mockCryptoRates[w.currency] || 1;
      return sum + Number(w.balance) * rate;
    }, 0);

    return successResponse({
      stats: {
        totalBalance: (fiatBalance + cryptoBalanceUSD).toFixed(2),
        fiatBalance: fiatBalance.toFixed(2),
        cryptoBalanceUSD: cryptoBalanceUSD.toFixed(2),
        walletCount: wallets.length,
        cryptoWalletCount: cryptoWallets.length,
        transactionCount: transactions.length,
        kycStatus: user?.kycStatus || 'NOT_SUBMITTED',
        accountStatus: user?.status || 'PENDING',
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch dashboard stats', 500);
  }
}
