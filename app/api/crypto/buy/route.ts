// Cherokee Bank - Crypto Buy API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAuth } from '@/src/server/auth/guards';
import { successResponse, errorResponse, validationErrorResponse } from '@/src/utils/api-response';
import { Prisma } from '@prisma/client';

// Mock crypto prices (production would use live market data)
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
    const { fiatWalletId, cryptoCurrency, fiatAmount } = body;

    const errors: Record<string, string[]> = {};
    if (!fiatWalletId) errors.fiatWalletId = ['Fiat wallet ID is required'];
    if (!cryptoCurrency || !CRYPTO_PRICES[cryptoCurrency]) errors.cryptoCurrency = ['Valid crypto currency required'];
    if (!fiatAmount || fiatAmount <= 0) errors.fiatAmount = ['Amount must be positive'];
    if (Object.keys(errors).length > 0) return validationErrorResponse(errors);

    const price = CRYPTO_PRICES[cryptoCurrency];
    const cryptoAmount = fiatAmount / price;
    const fee = fiatAmount * 0.015; // 1.5% fee

    const result = await prisma.$transaction(async (tx) => {
      // Get fiat wallet
      const fiatWallet = await tx.wallet.findFirst({
        where: { id: fiatWalletId, userId: authResult.userId, status: 'ACTIVE' },
      });
      if (!fiatWallet) throw new Error('Fiat wallet not found');

      const totalDebit = new Prisma.Decimal(fiatAmount + fee);
      if (fiatWallet.availableBalance.lessThan(totalDebit)) {
        throw new Error('Insufficient balance');
      }

      // Get or create crypto wallet
      let cryptoWallet = await tx.cryptoWallet.findUnique({
        where: { userId_currency: { userId: authResult.userId, currency: cryptoCurrency } },
      });

      if (!cryptoWallet) {
        const crypto = await import('crypto');
        cryptoWallet = await tx.cryptoWallet.create({
          data: {
            userId: authResult.userId,
            currency: cryptoCurrency,
            balance: 0,
            address: `0x${crypto.randomBytes(20).toString('hex')}`,
          },
        });
      }

      // Debit fiat wallet
      await tx.wallet.update({
        where: { id: fiatWallet.id },
        data: {
          balance: fiatWallet.balance.sub(totalDebit),
          availableBalance: fiatWallet.availableBalance.sub(totalDebit),
        },
      });

      // Credit crypto wallet
      const cryptoDecimal = new Prisma.Decimal(cryptoAmount);
      await tx.cryptoWallet.update({
        where: { id: cryptoWallet.id },
        data: { balance: cryptoWallet.balance.add(cryptoDecimal) },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          fromWalletId: fiatWallet.id,
          senderId: authResult.userId,
          type: 'CRYPTO_BUY',
          amount: new Prisma.Decimal(fiatAmount),
          fee: new Prisma.Decimal(fee),
          currency: fiatWallet.currency,
          targetCurrency: cryptoCurrency,
          exchangeRate: new Prisma.Decimal(price),
          convertedAmount: cryptoDecimal,
          status: 'COMPLETED',
          description: `Buy ${cryptoAmount.toFixed(8)} ${cryptoCurrency}`,
          metadata: { cryptoWalletId: cryptoWallet.id },
        },
      });

      return { transaction, cryptoAmount, price };
    });

    return successResponse({
      transaction: {
        id: result.transaction.id,
        type: result.transaction.type,
        fiatAmount: result.transaction.amount.toString(),
        cryptoAmount: result.cryptoAmount.toFixed(8),
        cryptoCurrency,
        price: result.price,
        fee: result.transaction.fee.toString(),
        status: result.transaction.status,
        reference: result.transaction.reference,
        createdAt: result.transaction.createdAt,
      },
    }, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Insufficient')) {
      return errorResponse('INSUFFICIENT_BALANCE', error.message, 400);
    }
    console.error('Crypto buy error:', error);
    return errorResponse('INTERNAL_ERROR', 'Crypto purchase failed', 500);
  }
}
