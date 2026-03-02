// Cherokee Bank - Currency Conversion API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAuth } from '@/src/server/auth/guards';
import { successResponse, errorResponse, validationErrorResponse } from '@/src/utils/api-response';
import { Prisma } from '@prisma/client';

// Simplified exchange rates (production would use live feed)
const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  USD: { EUR: 0.92, GBP: 0.79, CHERO: 100.0 },
  EUR: { USD: 1.09, GBP: 0.86, CHERO: 108.7 },
  GBP: { USD: 1.27, EUR: 1.16, CHERO: 126.5 },
  CHERO: { USD: 0.01, EUR: 0.0092, GBP: 0.0079 },
};

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const body = await request.json();
    const { fromWalletId, toWalletId, amount } = body;

    const errors: Record<string, string[]> = {};
    if (!fromWalletId) errors.fromWalletId = ['Source wallet ID is required'];
    if (!toWalletId) errors.toWalletId = ['Target wallet ID is required'];
    if (!amount || isNaN(amount) || amount <= 0) errors.amount = ['Amount must be positive'];
    if (Object.keys(errors).length > 0) return validationErrorResponse(errors);

    const result = await prisma.$transaction(async (tx) => {
      const fromWallet = await tx.wallet.findFirst({
        where: { id: fromWalletId, userId: authResult.userId, status: 'ACTIVE' },
      });
      const toWallet = await tx.wallet.findFirst({
        where: { id: toWalletId, userId: authResult.userId, status: 'ACTIVE' },
      });

      if (!fromWallet) throw new Error('Source wallet not found or inactive');
      if (!toWallet) throw new Error('Target wallet not found or inactive');
      if (fromWallet.currency === toWallet.currency) throw new Error('Cannot convert to the same currency');

      const decimalAmount = new Prisma.Decimal(amount);
      if (fromWallet.availableBalance.lessThan(decimalAmount)) {
        throw new Error('Insufficient balance');
      }

      const rate = EXCHANGE_RATES[fromWallet.currency]?.[toWallet.currency];
      if (!rate) throw new Error('Exchange rate not available for this pair');

      const convertedAmount = new Prisma.Decimal(amount * rate);
      const fee = new Prisma.Decimal(amount * 0.005); // 0.5% fee

      // Debit source wallet
      await tx.wallet.update({
        where: { id: fromWallet.id },
        data: {
          balance: fromWallet.balance.sub(decimalAmount),
          availableBalance: fromWallet.availableBalance.sub(decimalAmount),
        },
      });

      // Credit target wallet
      await tx.wallet.update({
        where: { id: toWallet.id },
        data: {
          balance: toWallet.balance.add(convertedAmount),
          availableBalance: toWallet.availableBalance.add(convertedAmount),
        },
      });

      // Create transaction record
      const txRecord = await tx.transaction.create({
        data: {
          fromWalletId: fromWallet.id,
          toWalletId: toWallet.id,
          senderId: authResult.userId,
          type: 'CONVERSION',
          amount: decimalAmount,
          fee,
          currency: fromWallet.currency,
          targetCurrency: toWallet.currency,
          exchangeRate: new Prisma.Decimal(rate),
          convertedAmount,
          status: 'COMPLETED',
          description: `Convert ${fromWallet.currency} to ${toWallet.currency}`,
        },
      });

      return { txRecord, rate, convertedAmount: convertedAmount.toString() };
    });

    return successResponse({
      transaction: {
        id: result.txRecord.id,
        type: result.txRecord.type,
        amount: result.txRecord.amount.toString(),
        convertedAmount: result.convertedAmount,
        exchangeRate: result.rate,
        currency: result.txRecord.currency,
        targetCurrency: result.txRecord.targetCurrency,
        fee: result.txRecord.fee.toString(),
        status: result.txRecord.status,
        reference: result.txRecord.reference,
        createdAt: result.txRecord.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Insufficient')) return errorResponse('INSUFFICIENT_BALANCE', error.message, 400);
      if (error.message.includes('not found')) return errorResponse('NOT_FOUND', error.message, 404);
      if (error.message.includes('same currency')) return errorResponse('INVALID_INPUT', error.message, 400);
    }
    console.error('Conversion error:', error);
    return errorResponse('INTERNAL_ERROR', 'Currency conversion failed', 500);
  }
}
