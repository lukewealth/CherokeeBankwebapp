// Cherokee Bank - Compliance: AML Service
import { prisma } from '@/src/config/db';

export class AMLService {
  /**
   * Check transaction against AML rules
   * Returns risk flags
   */
  static async checkTransaction(
    userId: string,
    amount: number,
    currency: string,
    type: string
  ): Promise<{ flags: string[]; riskLevel: string }> {
    const flags: string[] = [];

    // Rule 1: High-value transaction threshold  
    if (amount > 10000) {
      flags.push('HIGH_VALUE_TRANSACTION');
    }

    // Rule 2: Check transaction velocity (>10 transactions in last hour)
    const oneHourAgo = new Date(Date.now() - 3600000);
    const recentCount = await prisma.transaction.count({
      where: {
        senderId: userId,
        createdAt: { gte: oneHourAgo },
      },
    });
    if (recentCount > 10) {
      flags.push('HIGH_VELOCITY');
    }

    // Rule 3: Check daily volume
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyTransactions = await prisma.transaction.aggregate({
      where: {
        senderId: userId,
        createdAt: { gte: today },
        status: { in: ['COMPLETED', 'PENDING'] },
      },
      _sum: { amount: true },
    });
    const dailyVolume = Number(dailyTransactions._sum.amount || 0);
    if (dailyVolume + amount > 50000) {
      flags.push('DAILY_LIMIT_APPROACHING');
    }

    // Rule 4: New account with large transaction
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true, kycStatus: true },
    });
    if (user) {
      const accountAge = Date.now() - user.createdAt.getTime();
      const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24);
      if (daysSinceCreation < 7 && amount > 5000) {
        flags.push('NEW_ACCOUNT_HIGH_VALUE');
      }
      if (user.kycStatus !== 'VERIFIED' && amount > 1000) {
        flags.push('UNVERIFIED_HIGH_VALUE');
      }
    }

    // Determine risk level
    let riskLevel = 'LOW';
    if (flags.length >= 3) riskLevel = 'CRITICAL';
    else if (flags.length === 2) riskLevel = 'HIGH';
    else if (flags.length === 1) riskLevel = 'MEDIUM';

    return { flags, riskLevel };
  }
}
