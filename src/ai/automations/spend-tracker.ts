// Cherokee Bank - Spend Tracker AI
import { prisma } from '@/src/config/db';

export class SpendTracker {
  /**
   * Get spending summary for a user
   */
  static async getSpendingSummary(userId: string, days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const walletIds = await prisma.wallet.findMany({
      where: { userId },
      select: { id: true },
    }).then(w => w.map(w => w.id));

    const transactions = await prisma.transaction.findMany({
      where: {
        fromWalletId: { in: walletIds },
        createdAt: { gte: startDate },
        status: 'COMPLETED',
        type: { in: ['TRANSFER', 'POS_PAYMENT', 'WITHDRAWAL', 'CRYPTO_BUY'] },
      },
      select: { amount: true, type: true, currency: true, createdAt: true, description: true },
    });

    // Group by type
    const byType: Record<string, number> = {};
    let totalSpent = 0;

    for (const tx of transactions) {
      const amount = Number(tx.amount);
      totalSpent += amount;
      byType[tx.type] = (byType[tx.type] || 0) + amount;
    }

    // Daily spending
    const dailySpending: Record<string, number> = {};
    for (const tx of transactions) {
      const day = tx.createdAt.toISOString().split('T')[0];
      dailySpending[day] = (dailySpending[day] || 0) + Number(tx.amount);
    }

    return {
      totalSpent,
      transactionCount: transactions.length,
      averageDaily: totalSpent / days,
      byType,
      dailySpending,
      period: `${days} days`,
    };
  }
}
