// Cherokee Bank - Compliance: Fraud Engine
import { prisma } from '@/src/config/db';

export class FraudEngine {
  /**
   * Calculate risk score for a transaction (0-100)
   */
  static async calculateRiskScore(
    userId: string,
    amount: number,
    type: string,
    metadata?: Record<string, unknown>
  ): Promise<{ score: number; factors: string[] }> {
    const factors: string[] = [];
    let score = 0;

    // Factor 1: Amount anomaly (compare to user's average)
    const avgResult = await prisma.transaction.aggregate({
      where: { senderId: userId, status: 'COMPLETED' },
      _avg: { amount: true },
      _count: true,
    });
    const avgAmount = Number(avgResult._avg.amount || 0);
    const txCount = avgResult._count;

    if (txCount > 5 && amount > avgAmount * 3) {
      score += 25;
      factors.push(`Amount ${(amount / avgAmount).toFixed(1)}x above average`);
    }

    // Factor 2: Transaction velocity
    const lastHour = new Date(Date.now() - 3600000);
    const hourlyCount = await prisma.transaction.count({
      where: { senderId: userId, createdAt: { gte: lastHour } },
    });
    if (hourlyCount > 5) {
      score += 20;
      factors.push(`${hourlyCount} transactions in last hour`);
    }

    // Factor 3: Off-hours transaction (between 1am-5am user local time)
    const hour = new Date().getUTCHours();
    if (hour >= 1 && hour <= 5) {
      score += 10;
      factors.push('Off-hours transaction');
    }

    // Factor 4: Account age
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true, kycStatus: true, failedLoginCount: true },
    });
    if (user) {
      const daysOld = (Date.now() - user.createdAt.getTime()) / 86400000;
      if (daysOld < 3) {
        score += 15;
        factors.push('Account less than 3 days old');
      }
      if (user.kycStatus !== 'VERIFIED') {
        score += 10;
        factors.push('Unverified KYC');
      }
      if (user.failedLoginCount > 3) {
        score += 10;
        factors.push('Recent failed login attempts');
      }
    }

    // Factor 5: High-value transaction
    if (amount > 25000) {
      score += 15;
      factors.push('High-value transaction (>$25,000)');
    } else if (amount > 10000) {
      score += 8;
      factors.push('Elevated transaction amount (>$10,000)');
    }

    // Cap at 100
    score = Math.min(score, 100);

    return { score, factors };
  }

  /**
   * Create a fraud report for a flagged transaction
   */
  static async createFraudReport(
    transactionId: string,
    riskScore: number,
    riskLevel: string,
    flags: string[],
    analysis?: string
  ) {
    return prisma.fraudReport.create({
      data: {
        transactionId,
        riskScore,
        riskLevel,
        flags,
        analysis,
        status: 'OPEN',
      },
    });
  }

  /**
   * Get fraud dashboard stats
   */
  static async getStats() {
    const [total, open, high, critical] = await Promise.all([
      prisma.fraudReport.count(),
      prisma.fraudReport.count({ where: { status: 'OPEN' } }),
      prisma.fraudReport.count({ where: { riskLevel: 'HIGH' } }),
      prisma.fraudReport.count({ where: { riskLevel: 'CRITICAL' } }),
    ]);

    const avgScore = await prisma.fraudReport.aggregate({
      _avg: { riskScore: true },
    });

    return {
      total,
      open,
      high,
      critical,
      averageScore: avgScore._avg.riskScore || 0,
    };
  }
}
