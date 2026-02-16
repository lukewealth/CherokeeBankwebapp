// Cherokee Bank - Admin Risk Analysis API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAdmin } from '@/src/server/auth/guards';
import { successResponse, errorResponse } from '@/src/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if ('status' in authResult) return authResult;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // System-wide risk metrics
    const [
      totalFlagged,
      highRiskTransactions,
      openFraudReports,
      frozenAccounts,
      recentSecurityEvents,
    ] = await Promise.all([
      prisma.transaction.count({ where: { status: 'FLAGGED' } }),
      prisma.transaction.count({ where: { riskScore: { gte: 0.7 } } }),
      prisma.fraudReport.count({ where: { status: 'OPEN' } }),
      prisma.user.count({ where: { status: 'FROZEN' } }),
      prisma.securityEvent.findMany({
        where: { type: { in: ['FAILED_LOGIN', 'ACCOUNT_FROZEN'] } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
      }),
    ]);

    // Per-user risk analysis if userId is provided
    let userRisk = null;
    if (userId) {
      const [userTxs, userFraud, userEvents] = await Promise.all([
        prisma.transaction.findMany({
          where: { senderId: userId, riskScore: { not: null } },
          orderBy: { riskScore: 'desc' },
          take: 10,
          select: { id: true, amount: true, currency: true, riskScore: true, status: true, type: true, createdAt: true },
        }),
        prisma.fraudReport.findMany({
          where: { transaction: { senderId: userId } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        prisma.securityEvent.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 20,
        }),
      ]);

      const avgRiskScore = userTxs.length > 0
        ? userTxs.reduce((sum, t) => sum + (t.riskScore || 0), 0) / userTxs.length
        : 0;

      userRisk = {
        userId,
        averageRiskScore: avgRiskScore.toFixed(3),
        highRiskTransactions: userTxs.filter((t) => (t.riskScore || 0) >= 0.7).length,
        fraudReports: userFraud.length,
        securityEvents: userEvents,
        recentTransactions: userTxs,
      };
    }

    return successResponse({
      systemMetrics: {
        totalFlaggedTransactions: totalFlagged,
        highRiskTransactions,
        openFraudReports,
        frozenAccounts,
        recentSecurityEvents: recentSecurityEvents.map((e) => ({
          id: e.id,
          type: e.type,
          userEmail: e.user.email,
          userName: `${e.user.firstName} ${e.user.lastName}`,
          ipAddress: e.ipAddress,
          createdAt: e.createdAt,
        })),
      },
      userRisk,
    });
  } catch (error) {
    console.error('Risk analysis error:', error);
    return errorResponse('INTERNAL_ERROR', 'Risk analysis failed', 500);
  }
}
