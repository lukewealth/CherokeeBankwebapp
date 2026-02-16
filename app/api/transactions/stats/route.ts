// Cherokee Bank - Transaction Stats API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAuth } from '@/src/server/auth/guards';
import { successResponse, errorResponse } from '@/src/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || 'month') as 'week' | 'month' | 'year';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    // Get user's wallet IDs
    const userWallets = await prisma.wallet.findMany({
      where: { userId: authResult.userId },
      select: { id: true },
    });
    const walletIds = userWallets.map((w) => w.id);

    // Fetch transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: { gte: startDate },
        OR: [
          { fromWalletId: { in: walletIds } },
          { toWalletId: { in: walletIds } },
          { senderId: authResult.userId },
        ],
      },
      select: {
        type: true,
        status: true,
        amount: true,
        currency: true,
        createdAt: true,
      },
    });

    // Calculate stats
    const stats = {
      totalCount: transactions.length,
      totalAmount: transactions.reduce((sum, t) => sum + Number(t.amount), 0).toFixed(2),
      byType: {} as Record<string, { count: number; amount: string }>,
      byStatus: {} as Record<string, number>,
      byDay: {} as Record<string, number>,
    };

    // Group by type
    transactions.forEach((t) => {
      if (!stats.byType[t.type]) {
        stats.byType[t.type] = { count: 0, amount: '0' };
      }
      stats.byType[t.type].count += 1;
      stats.byType[t.type].amount = (Number(stats.byType[t.type].amount) + Number(t.amount)).toFixed(2);
    });

    // Group by status
    transactions.forEach((t) => {
      stats.byStatus[t.status] = (stats.byStatus[t.status] || 0) + 1;
    });

    // Group by day
    transactions.forEach((t) => {
      const day = t.createdAt.toISOString().split('T')[0];
      stats.byDay[day] = (stats.byDay[day] || 0) + 1;
    });

    return successResponse({
      period,
      dateRange: {
        start: startDate,
        end: now,
      },
      stats,
    });
  } catch (error) {
    console.error('Transaction stats error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch transaction stats', 500);
  }
}
