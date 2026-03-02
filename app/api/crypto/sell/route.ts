// Cherokee Bank - Crypto Sell API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAuth } from '@/src/server/auth/guards';
import { successResponse, errorResponse, validationErrorResponse } from '@/src/utils/api-response';
import { Prisma } from '@prisma/client';

const CRYPTO_PRICES: Record<string, number> = {
  BTC: 67500.00,
  ETH: 3450.00,
  USDT: 1.00,
};

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const body = await request.json();
    const { fiatWalletId, cryptoCurrency, cryptoAmount } = body;

    const errors: Record<string, string[]> = {};
    if (!fiatWalletId) errors.fiatWalletId = ['Fiat wallet ID is required'];
    if (!cryptoCurrency || !CRYPTO_PRICES[cryptoCurrency]) errors.cryptoCurrency = ['Valid crypto currency required'];
    if (!cryptoAmount || cryptoAmount <= 0) errors.cryptoAmount = ['Amount must be positive'];
    if (Object.keys(errors).length > 0) return validationErrorResponse(errors);

    const price = CRYPTO_PRICES[cryptoCurrency];
    const fiatAmount = cryptoAmount * price;
    const fee = fiatAmount * 0.015; // 1.5% fee

    const result = await prisma.$transaction(async (tx) => {
      // Get crypto wallet
      const cryptoWallet = await tx.cryptoWallet.findUnique({
        where: { userId_currency: { userId: authResult.userId, currency: cryptoCurrency } },
      });
      if (!cryptoWallet) throw new Error('Crypto wallet not found');

      const cryptoDecimal = new Prisma.Decimal(cryptoAmount);
      if (cryptoWallet.balance.lessThan(cryptoDecimal)) {
        throw new Error('Insufficient crypto balance');
      }

      // Get fiat wallet
      const fiatWallet = await tx.wallet.findFirst({
        where: { id: fiatWalletId, userId: authResult.userId, status: 'ACTIVE' },
      });
      if (!fiatWallet) throw new Error('Fiat wallet not found');

      // Debit crypto wallet
      await tx.cryptoWallet.update({
        where: { id: cryptoWallet.id },
        data: { balance: cryptoWallet.balance.sub(cryptoDecimal) },
      });

      // Credit fiat wallet (minus fee)
      const fiatCredit = new Prisma.Decimal(fiatAmount - fee);
      await tx.wallet.update({
        where: { id: fiatWallet.id },
        data: {
          balance: fiatWallet.balance.add(fiatCredit),
          availableBalance: fiatWallet.availableBalance.add(fiatCredit),
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          toWalletId: fiatWallet.id,
          senderId: authResult.userId,
          type: 'CRYPTO_SELL',
          amount: cryptoDecimal,
          fee: new Prisma.Decimal(fee),
          currency: cryptoCurrency,
          targetCurrency: fiatWallet.currency,
          exchangeRate: new Prisma.Decimal(price),
          convertedAmount: fiatCredit,
          status: 'COMPLETED',
          description: `Sell ${cryptoAmount.toFixed(8)} ${cryptoCurrency}`,
        },
      });

      return { transaction, fiatAmount, fee };
    });

    return successResponse({
      transaction: {
        id: result.transaction.id,
        type: result.transaction.type,
        cryptoAmount: result.transaction.amount.toString(),
        fiatAmount: result.fiatAmount.toFixed(2),
        fee: result.fee.toFixed(2),
        cryptoCurrency,
        price,
        status: result.transaction.status,
        reference: result.transaction.reference,
        createdAt: result.transaction.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Insufficient')) {
      return errorResponse('INSUFFICIENT_BALANCE', error.message, 400);
    }
    console.error('Crypto sell error:', error);
    return errorResponse('INTERNAL_ERROR', 'Crypto sale failed', 500);
  }
}
