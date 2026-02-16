// Cherokee Bank - Transaction Detail API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAuth } from '@/src/server/auth/guards';
import { successResponse, errorResponse, notFoundResponse } from '@/src/utils/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const { id } = await params;

    // Get user's wallet IDs to verify access
    const userWallets = await prisma.wallet.findMany({
      where: { userId: authResult.userId },
      select: { id: true },
    });
    const walletIds = userWallets.map((w) => w.id);

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        OR: [
          { fromWalletId: { in: walletIds } },
          { toWalletId: { in: walletIds } },
          { senderId: authResult.userId },
        ],
      },
      include: {
        fromWallet: { select: { id: true, currency: true, userId: true } },
        toWallet: { select: { id: true, currency: true, userId: true } },
        sender: { select: { id: true, firstName: true, lastName: true, email: true } },
        ledgerEntries: { orderBy: { createdAt: 'asc' } },
        fraudReport: { select: { riskScore: true, riskLevel: true, flags: true, status: true } },
      },
    });

    if (!transaction) {
      return notFoundResponse('Transaction');
    }

    return successResponse({
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount.toString(),
        fee: transaction.fee.toString(),
        currency: transaction.currency,
        targetCurrency: transaction.targetCurrency,
        status: transaction.status,
        reference: transaction.reference,
        description: transaction.description,
        blockchainTxHash: transaction.blockchainTxHash,
        riskScore: transaction.riskScore,
        exchangeRate: transaction.exchangeRate?.toString(),
        convertedAmount: transaction.convertedAmount?.toString(),
        metadata: transaction.metadata,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        fromWallet: transaction.fromWallet,
        toWallet: transaction.toWallet,
        sender: transaction.sender,
        ledgerEntries: transaction.ledgerEntries.map((e) => ({
          id: e.id,
          amount: e.amount.toString(),
          balanceAfter: e.balanceAfter.toString(),
          description: e.description,
          createdAt: e.createdAt,
        })),
        fraudReport: transaction.fraudReport,
      },
    });
  } catch (error) {
    console.error('Transaction detail error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch transaction', 500);
  }
}
