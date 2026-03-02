// Cherokee Bank - Merchant Dispute API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAuth } from '@/src/server/auth/guards';
import { successResponse, errorResponse, validationErrorResponse } from '@/src/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const body = await request.json();
    const { transactionId, reason } = body;

    const errors: Record<string, string[]> = {};
    if (!transactionId) errors.transactionId = ['Transaction ID is required'];
    if (!reason || reason.trim().length < 10) errors.reason = ['Reason must be at least 10 characters'];
    if (Object.keys(errors).length > 0) return validationErrorResponse(errors);

    // Verify transaction exists and belongs to user
    const userWallets = await prisma.wallet.findMany({
      where: { userId: authResult.userId },
      select: { id: true },
    });
    const walletIds = userWallets.map((w) => w.id);

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        type: 'POS_PAYMENT',
        fromWalletId: { in: walletIds },
      },
    });

    if (!transaction) {
      return errorResponse('NOT_FOUND', 'POS transaction not found', 404);
    }

    // Check if dispute already exists
    const existingDispute = await prisma.dispute.findUnique({
      where: { transactionId },
    });
    if (existingDispute) {
      return errorResponse('ALREADY_EXISTS', 'A dispute already exists for this transaction', 409);
    }

    // Find merchant from transaction metadata
    const metadata = transaction.metadata as Record<string, string> | null;
    const merchantId = metadata?.merchantId;

    if (!merchantId) {
      return errorResponse('INTERNAL_ERROR', 'Cannot determine merchant for this transaction', 500);
    }

    const dispute = await prisma.dispute.create({
      data: {
        transactionId,
        merchantId,
        customerId: authResult.userId,
        reason: reason.trim(),
        amount: transaction.amount,
        status: 'OPEN',
      },
    });

    return successResponse({
      dispute: {
        id: dispute.id,
        transactionId: dispute.transactionId,
        reason: dispute.reason,
        amount: dispute.amount.toString(),
        status: dispute.status,
        createdAt: dispute.createdAt,
      },
    }, 201);
  } catch (error) {
    console.error('Dispute error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to create dispute', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const disputes = await prisma.dispute.findMany({
      where: { customerId: authResult.userId },
      include: {
        transaction: {
          select: { id: true, amount: true, currency: true, createdAt: true, description: true },
        },
        merchant: {
          select: { businessName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({
      disputes: disputes.map((d) => ({
        id: d.id,
        reason: d.reason,
        status: d.status,
        amount: d.amount.toString(),
        resolution: d.resolution,
        merchantName: d.merchant.businessName,
        transaction: {
          id: d.transaction.id,
          amount: d.transaction.amount.toString(),
          currency: d.transaction.currency,
          description: d.transaction.description,
          createdAt: d.transaction.createdAt,
        },
        createdAt: d.createdAt,
        resolvedAt: d.resolvedAt,
      })),
    });
  } catch (error) {
    console.error('Dispute list error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch disputes', 500);
  }
}
