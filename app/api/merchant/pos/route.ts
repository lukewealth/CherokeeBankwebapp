// Cherokee Bank - Merchant POS Payment API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAuth } from '@/src/server/auth/guards';
import { successResponse, errorResponse, validationErrorResponse } from '@/src/utils/api-response';
import { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const body = await request.json();
    const { merchantPosId, walletId, amount, currency = 'USD', description } = body;

    const errors: Record<string, string[]> = {};
    if (!merchantPosId) errors.merchantPosId = ['Merchant POS ID is required'];
    if (!walletId) errors.walletId = ['Wallet ID is required'];
    if (!amount || amount <= 0) errors.amount = ['Amount must be positive'];
    if (Object.keys(errors).length > 0) return validationErrorResponse(errors);

    const result = await prisma.$transaction(async (tx) => {
      // Verify merchant
      const merchant = await tx.merchant.findUnique({
        where: { posId: merchantPosId },
        include: { user: { select: { firstName: true, lastName: true } } },
      });
      if (!merchant || merchant.status !== 'ACTIVE') {
        throw new Error('Merchant not found or not active');
      }

      // Get customer wallet
      const customerWallet = await tx.wallet.findFirst({
        where: { id: walletId, userId: authResult.userId, status: 'ACTIVE' },
      });
      if (!customerWallet) throw new Error('Customer wallet not found');

      const decimalAmount = new Prisma.Decimal(amount);
      const fee = new Prisma.Decimal(amount * 0.025); // 2.5% merchant fee

      if (customerWallet.availableBalance.lessThan(decimalAmount)) {
        throw new Error('Insufficient balance');
      }

      // Debit customer
      await tx.wallet.update({
        where: { id: customerWallet.id },
        data: {
          balance: customerWallet.balance.sub(decimalAmount),
          availableBalance: customerWallet.availableBalance.sub(decimalAmount),
        },
      });

      // Credit merchant settlement wallet (minus fee)
      const merchantCredit = decimalAmount.sub(fee);
      const settlementWallet = await tx.wallet.findUnique({
        where: { id: merchant.settlementWalletId },
      });
      if (!settlementWallet) throw new Error('Merchant settlement wallet not found');

      await tx.wallet.update({
        where: { id: settlementWallet.id },
        data: {
          balance: settlementWallet.balance.add(merchantCredit),
          availableBalance: settlementWallet.availableBalance.add(merchantCredit),
        },
      });

      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          fromWalletId: customerWallet.id,
          toWalletId: settlementWallet.id,
          senderId: authResult.userId,
          type: 'POS_PAYMENT',
          amount: decimalAmount,
          fee,
          currency: customerWallet.currency,
          status: 'COMPLETED',
          description: description || `POS payment to ${merchant.businessName}`,
          metadata: {
            merchantId: merchant.id,
            merchantName: merchant.businessName,
            posId: merchant.posId,
          },
        },
      });

      return { transaction, merchantName: merchant.businessName };
    });

    return successResponse({
      transaction: {
        id: result.transaction.id,
        type: result.transaction.type,
        amount: result.transaction.amount.toString(),
        fee: result.transaction.fee.toString(),
        currency: result.transaction.currency,
        status: result.transaction.status,
        reference: result.transaction.reference,
        merchantName: result.merchantName,
        createdAt: result.transaction.createdAt,
      },
    }, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Insufficient')) return errorResponse('INSUFFICIENT_BALANCE', error.message, 400);
      if (error.message.includes('not found')) return errorResponse('NOT_FOUND', error.message, 404);
    }
    console.error('POS payment error:', error);
    return errorResponse('INTERNAL_ERROR', 'POS payment failed', 500);
  }
}
