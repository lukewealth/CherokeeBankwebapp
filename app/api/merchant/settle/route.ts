// Cherokee Bank - Merchant Settlement API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAuth } from '@/src/server/auth/guards';
import { successResponse, errorResponse } from '@/src/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    // Verify user is a merchant
    const merchant = await prisma.merchant.findUnique({
      where: { userId: authResult.userId },
    });

    if (!merchant || merchant.status !== 'ACTIVE') {
      return errorResponse('FORBIDDEN', 'Active merchant account required', 403);
    }

    // Get pending transactions for settlement
    const pendingTxs = await prisma.transaction.findMany({
      where: {
        toWalletId: merchant.settlementWalletId,
        type: 'POS_PAYMENT',
        status: 'COMPLETED',
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalSettlement = pendingTxs.reduce(
      (sum, tx) => sum + parseFloat(tx.amount.toString()) - parseFloat(tx.fee.toString()),
      0,
    );

    return successResponse({
      merchantId: merchant.id,
      businessName: merchant.businessName,
      posId: merchant.posId,
      settlementWalletId: merchant.settlementWalletId,
      transactionCount: pendingTxs.length,
      totalSettlement: totalSettlement.toFixed(2),
      transactions: pendingTxs.slice(0, 50).map((tx) => ({
        id: tx.id,
        amount: tx.amount.toString(),
        fee: tx.fee.toString(),
        status: tx.status,
        reference: tx.reference,
        createdAt: tx.createdAt,
      })),
    });
  } catch (error) {
    console.error('Settlement error:', error);
    return errorResponse('INTERNAL_ERROR', 'Settlement fetch failed', 500);
  }
}
