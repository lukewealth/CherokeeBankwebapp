// Cherokee Bank - Create Transaction API Route
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
    const { fromWalletId, toWalletId, recipientEmail, amount, currency, description, type = 'TRANSFER' } = body;

    // Validation
    const errors: Record<string, string[]> = {};
    if (!fromWalletId) errors.fromWalletId = ['Source wallet ID is required'];
    if (!amount || isNaN(amount) || amount <= 0) errors.amount = ['Amount must be a positive number'];
    if (!toWalletId && !recipientEmail) errors.recipient = ['Either toWalletId or recipientEmail is required'];
    if (Object.keys(errors).length > 0) return validationErrorResponse(errors);

    const result = await prisma.$transaction(async (tx) => {
      // Get source wallet
      const fromWallet = await tx.wallet.findFirst({
        where: { id: fromWalletId, userId: authResult.userId, status: 'ACTIVE' },
      });

      if (!fromWallet) throw new Error('Source wallet not found or inactive');

      const decimalAmount = new Prisma.Decimal(amount);

      // Check balance
      if (fromWallet.availableBalance.lessThan(decimalAmount)) {
        throw new Error('Insufficient balance');
      }

      // Resolve destination wallet
      let destWalletId = toWalletId;
      if (!destWalletId && recipientEmail) {
        const recipient = await tx.user.findUnique({
          where: { email: recipientEmail.toLowerCase() },
          include: { wallets: { where: { currency: fromWallet.currency, status: 'ACTIVE' } } },
        });

        if (!recipient) throw new Error('Recipient not found');
        if (recipient.id === authResult.userId) throw new Error('Cannot transfer to yourself');
        if (recipient.wallets.length === 0) throw new Error(`Recipient has no ${fromWallet.currency} wallet`);

        destWalletId = recipient.wallets[0].id;
      }

      const toWallet = await tx.wallet.findFirst({
        where: { id: destWalletId, status: 'ACTIVE' },
      });

      if (!toWallet) throw new Error('Destination wallet not found or inactive');

      // Calculate fee (0.1% for transfers)
      const feeRate = type === 'TRANSFER' ? 0.001 : 0;
      const fee = new Prisma.Decimal(amount * feeRate);

      // Debit source
      await tx.wallet.update({
        where: { id: fromWallet.id },
        data: {
          balance: fromWallet.balance.sub(decimalAmount).sub(fee),
          availableBalance: fromWallet.availableBalance.sub(decimalAmount).sub(fee),
        },
      });

      // Credit destination
      await tx.wallet.update({
        where: { id: toWallet.id },
        data: {
          balance: toWallet.balance.add(decimalAmount),
          availableBalance: toWallet.availableBalance.add(decimalAmount),
        },
      });

      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          fromWalletId: fromWallet.id,
          toWalletId: toWallet.id,
          senderId: authResult.userId,
          type: type as 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL',
          amount: decimalAmount,
          fee,
          currency: fromWallet.currency,
          status: 'COMPLETED',
          description: description || `Transfer to wallet`,
        },
      });

      // Create ledger entries
      await tx.ledgerEntry.createMany({
        data: [
          {
            transactionId: transaction.id,
            walletId: fromWallet.id,
            amount: decimalAmount.neg(),
            balanceAfter: fromWallet.balance.sub(decimalAmount).sub(fee),
            description: `Debit: ${description || 'Transfer'}`,
          },
          {
            transactionId: transaction.id,
            walletId: toWallet.id,
            amount: decimalAmount,
            balanceAfter: toWallet.balance.add(decimalAmount),
            description: `Credit: ${description || 'Transfer'}`,
          },
        ],
      });

      return transaction;
    });

    return successResponse({
      transaction: {
        id: result.id,
        type: result.type,
        amount: result.amount.toString(),
        fee: result.fee.toString(),
        currency: result.currency,
        status: result.status,
        reference: result.reference,
        description: result.description,
        createdAt: result.createdAt,
      },
    }, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Insufficient')) return errorResponse('INSUFFICIENT_BALANCE', error.message, 400);
      if (error.message.includes('not found')) return errorResponse('NOT_FOUND', error.message, 404);
      if (error.message.includes('yourself')) return errorResponse('INVALID_INPUT', error.message, 400);
    }
    console.error('Transaction error:', error);
    return errorResponse('INTERNAL_ERROR', 'Transaction failed', 500);
  }
}
