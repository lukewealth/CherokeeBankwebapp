// Cherokee Bank - List Transactions API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAuth } from '@/src/server/auth/guards';
import { successResponse, errorResponse } from '@/src/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const currency = searchParams.get('currency');
    const walletId = searchParams.get('walletId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');

    // Get user's wallet IDs
    const userWallets = await prisma.wallet.findMany({
      where: { userId: authResult.userId },
      select: { id: true },
    });
    const walletIds = userWallets.map((w) => w.id);

    // Build filter
    const where: Record<string, unknown> = {
      OR: [
        { fromWalletId: { in: walletIds } },
        { toWalletId: { in: walletIds } },
        { senderId: authResult.userId },
      ],
    };

    if (type) where.type = type;
    if (status) where.status = status;
    if (currency) where.currency = currency;
    if (walletId && walletIds.includes(walletId)) {
      where.OR = [{ fromWalletId: walletId }, { toWalletId: walletId }];
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.createdAt as Record<string, unknown>).lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { reference: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: where as never,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          type: true,
          amount: true,
          fee: true,
          currency: true,
          targetCurrency: true,
          status: true,
          reference: true,
          description: true,
          riskScore: true,
          exchangeRate: true,
          convertedAmount: true,
          createdAt: true,
          fromWalletId: true,
          toWalletId: true,
          senderId: true,
        },
      }),
      prisma.transaction.count({ where: where as never }),
    ]);

    const formattedTxs = transactions.map((tx) => ({
      ...tx,
      amount: tx.amount.toString(),
      fee: tx.fee.toString(),
      exchangeRate: tx.exchangeRate?.toString() || null,
      convertedAmount: tx.convertedAmount?.toString() || null,
      direction: tx.senderId === authResult.userId || walletIds.includes(tx.fromWalletId || '')
        ? ('outgoing' as const)
        : ('incoming' as const),
    }));

    return successResponse(
      { transactions: formattedTxs },
      200,
      { page, limit, total, totalPages: Math.ceil(total / limit) },
    );
  } catch (error) {
    console.error('Transaction list error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch transactions', 500);
  }
}
