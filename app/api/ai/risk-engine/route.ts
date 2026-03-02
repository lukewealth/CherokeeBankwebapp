// Cherokee Bank - AI Risk Engine API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAdmin } from '@/src/server/auth/guards';
import { successResponse, errorResponse } from '@/src/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if ('status' in authResult) return authResult;

    const body = await request.json();
    const { transactionId } = body;

    if (!transactionId) {
      return errorResponse('VALIDATION_ERROR', 'Transaction ID is required', 400);
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        sender: { select: { id: true, createdAt: true, kycStatus: true, status: true } },
        fromWallet: true,
        toWallet: true,
      },
    });

    if (!transaction) {
      return errorResponse('NOT_FOUND', 'Transaction not found', 404);
    }

    // Compute risk factors
    const riskFactors: string[] = [];
    let riskScore = 0;

    const amount = parseFloat(transaction.amount.toString());

    // High amount
    if (amount > 10000) { riskScore += 0.2; riskFactors.push('HIGH_AMOUNT'); }
    if (amount > 50000) { riskScore += 0.15; riskFactors.push('VERY_HIGH_AMOUNT'); }

    // New account
    if (transaction.sender) {
      const accountAge = (Date.now() - new Date(transaction.sender.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (accountAge < 7) { riskScore += 0.2; riskFactors.push('NEW_ACCOUNT'); }
      if (transaction.sender.kycStatus !== 'VERIFIED') { riskScore += 0.15; riskFactors.push('UNVERIFIED_KYC'); }
    }

    // Cross-currency
    if (transaction.targetCurrency && transaction.currency !== transaction.targetCurrency) {
      riskScore += 0.05;
      riskFactors.push('CROSS_CURRENCY');
    }

    // Rapid transactions check
    if (transaction.senderId) {
      const recentCount = await prisma.transaction.count({
        where: {
          senderId: transaction.senderId,
          createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
        },
      });
      if (recentCount > 10) { riskScore += 0.2; riskFactors.push('RAPID_TRANSACTIONS'); }
    }

    // Crypto transactions
    if (['CRYPTO_BUY', 'CRYPTO_SELL'].includes(transaction.type)) {
      riskScore += 0.05;
      riskFactors.push('CRYPTO_TRANSACTION');
    }

    riskScore = Math.min(1, riskScore);
    const riskLevel = riskScore >= 0.7 ? 'HIGH' : riskScore >= 0.4 ? 'MEDIUM' : 'LOW';

    // Update transaction risk score
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { riskScore },
    });

    // Create fraud report if high risk
    if (riskScore >= 0.7) {
      await prisma.fraudReport.upsert({
        where: { transactionId },
        create: {
          transactionId,
          riskScore,
          riskLevel,
          flags: riskFactors,
          analysis: `Automated risk analysis flagged ${riskFactors.length} risk factors`,
          status: 'OPEN',
        },
        update: {
          riskScore,
          riskLevel,
          flags: riskFactors,
          analysis: `Re-analyzed: ${riskFactors.length} risk factors`,
        },
      });

      // Flag the transaction
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'FLAGGED' },
      });
    }

    return successResponse({
      transactionId,
      riskScore: riskScore.toFixed(3),
      riskLevel,
      riskFactors,
      flagged: riskScore >= 0.7,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Risk engine error:', error);
    return errorResponse('INTERNAL_ERROR', 'Risk analysis failed', 500);
  }
}
