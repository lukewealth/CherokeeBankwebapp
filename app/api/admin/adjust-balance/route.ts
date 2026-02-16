// Cherokee Bank - Admin Adjust Balance API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAdmin } from '@/src/server/auth/guards';
import { successResponse, errorResponse, validationErrorResponse } from '@/src/utils/api-response';
import { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if ('status' in authResult) return authResult;

    const body = await request.json();
    const { walletId, amount, type, reason } = body;

    const errors: Record<string, string[]> = {};
    if (!walletId) errors.walletId = ['Wallet ID is required'];
    if (!amount || isNaN(amount) || amount <= 0) errors.amount = ['Amount must be positive'];
    if (!type || !['CREDIT', 'DEBIT'].includes(type)) errors.type = ['Type must be CREDIT or DEBIT'];
    if (!reason || reason.trim().length < 5) errors.reason = ['Reason must be at least 5 characters'];
    if (Object.keys(errors).length > 0) return validationErrorResponse(errors);

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet) throw new Error('Wallet not found');

      const decimalAmount = new Prisma.Decimal(amount);
      let newBalance: Prisma.Decimal;
      let newAvailable: Prisma.Decimal;

      if (type === 'CREDIT') {
        newBalance = wallet.balance.add(decimalAmount);
        newAvailable = wallet.availableBalance.add(decimalAmount);
      } else {
        if (wallet.balance.lessThan(decimalAmount)) {
          throw new Error('Insufficient balance for debit');
        }
        newBalance = wallet.balance.sub(decimalAmount);
        newAvailable = wallet.availableBalance.sub(decimalAmount);
      }

      const updated = await tx.wallet.update({
        where: { id: walletId },
        data: { balance: newBalance, availableBalance: newAvailable },
      });

      const transaction = await tx.transaction.create({
        data: {
          ...(type === 'CREDIT' ? { toWalletId: walletId } : { fromWalletId: walletId }),
          type: 'ADJUSTMENT',
          amount: decimalAmount,
          fee: 0,
          currency: wallet.currency,
          status: 'COMPLETED',
          description: `Admin ${type.toLowerCase()}: ${reason}`,
          metadata: { adminId: authResult.userId, type, reason },
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          actorId: authResult.userId,
          action: `BALANCE_${type}`,
          targetType: 'WALLET',
          targetId: walletId,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || null,
          metadata: {
            amount: amount.toString(),
            currency: wallet.currency,
            reason,
            previousBalance: wallet.balance.toString(),
            newBalance: newBalance.toString(),
          },
        },
      });

      return { wallet: updated, transaction };
    });

    return successResponse({
      wallet: {
        id: result.wallet.id,
        currency: result.wallet.currency,
        balance: result.wallet.balance.toString(),
        availableBalance: result.wallet.availableBalance.toString(),
      },
      transactionId: result.transaction.id,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return errorResponse('NOT_FOUND', error.message, 404);
    }
    console.error('Adjust balance error:', error);
    return errorResponse('INTERNAL_ERROR', 'Balance adjustment failed', 500);
  }
}
