// Cherokee Bank - Transactions API Route (Main)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAuth } from '@/src/server/auth/guards';
import { successResponse, errorResponse, validationErrorResponse } from '@/src/utils/api-response';
import { Prisma } from '@prisma/client';

// GET - List transactions (with pagination and filters)
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const currency = searchParams.get('currency');

    // Get user's wallet IDs
    const userWallets = await prisma.wallet.findMany({
      where: { userId: authResult.userId },
      select: { id: true },
    });
    const walletIds = userWallets.map((w) => w.id);

    // Build filter
    const where: any = {
      OR: [
        { fromWalletId: { in: walletIds } },
        { toWalletId: { in: walletIds } },
        { senderId: authResult.userId },
      ],
    };

    if (type) where.type = type;
    if (status) where.status = status;
    if (currency) where.currency = currency;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          type: true,
          amount: true,
          fee: true,
          currency: true,
          status: true,
          reference: true,
          description: true,
          createdAt: true,
          fromWalletId: true,
          toWalletId: true,
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return successResponse({
      transactions: transactions.map((t) => ({
        ...t,
        amount: t.amount.toString(),
        fee: t.fee.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Transactions list error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch transactions', 500);
  }
}

// POST - Create transaction
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

      if (!fromWallet) throw new Error('SOURCE_WALLET_NOT_FOUND');

      const decimalAmount = new Prisma.Decimal(amount);

      // Check balance
      if (fromWallet.availableBalance.lessThan(decimalAmount)) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      // Resolve destination wallet
      let destWalletId = toWalletId;
      if (!destWalletId && recipientEmail) {
        const recipient = await tx.user.findUnique({
          where: { email: recipientEmail.toLowerCase() },
          include: { wallets: { where: { currency: fromWallet.currency, status: 'ACTIVE' } } },
        });

        if (!recipient) throw new Error('RECIPIENT_NOT_FOUND');
        if (recipient.id === authResult.userId) throw new Error('CANNOT_TRANSFER_TO_YOURSELF');
        if (recipient.wallets.length === 0) throw new Error('RECIPIENT_NO_WALLET');

        destWalletId = recipient.wallets[0].id;
      }

      const toWallet = await tx.wallet.findFirst({
        where: { id: destWalletId, status: 'ACTIVE' },
      });

      if (!toWallet) throw new Error('DESTINATION_WALLET_NOT_FOUND');

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

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          senderId: authResult.userId,
          fromWalletId: fromWallet.id,
          toWalletId: toWallet.id,
          type,
          amount: decimalAmount,
          fee,
          currency: fromWallet.currency,
          status: 'COMPLETED',
          description: description || `${type} to ${recipientEmail || toWalletId}`,
          reference: `TXN-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
        },
      });

      return transaction;
    });

    return successResponse(
      {
        transaction: {
          id: result.id,
          reference: result.reference,
          status: result.status,
          amount: result.amount.toString(),
          fee: result.fee.toString(),
          createdAt: result.createdAt,
        },
      },
      201
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    if (errorMsg === 'SOURCE_WALLET_NOT_FOUND') {
      return errorResponse('NOT_FOUND', 'Source wallet not found', 404);
    }
    if (errorMsg === 'INSUFFICIENT_BALANCE') {
      return errorResponse('INSUFFICIENT_FUNDS', 'Insufficient balance in wallet', 400);
    }
    if (errorMsg === 'RECIPIENT_NOT_FOUND') {
      return errorResponse('NOT_FOUND', 'Recipient not found', 404);
    }
    if (errorMsg === 'CANNOT_TRANSFER_TO_YOURSELF') {
      return errorResponse('VALIDATION_ERROR', 'Cannot transfer to yourself', 400);
    }
    if (errorMsg === 'RECIPIENT_NO_WALLET') {
      return errorResponse('VALIDATION_ERROR', 'Recipient has no wallet in this currency', 400);
    }
    if (errorMsg === 'DESTINATION_WALLET_NOT_FOUND') {
      return errorResponse('NOT_FOUND', 'Destination wallet not found', 404);
    }

    console.error('Transaction creation error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to create transaction', 500);
  }
}
