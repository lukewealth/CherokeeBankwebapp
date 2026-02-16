// Cherokee Bank - Wallet Deposit API Route
import { NextRequest } from 'next/server';
import { requireAuth } from '@/src/server/auth/guards';
import { WalletService } from '@/src/server/banking/wallet.service';
import { successResponse, errorResponse, validationErrorResponse } from '@/src/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const body = await request.json();
    const { walletId, amount, reference } = body;

    // Validation
    const errors: Record<string, string[]> = {};
    if (!walletId) errors.walletId = ['Wallet ID is required'];
    if (!amount || isNaN(amount) || amount <= 0) errors.amount = ['Amount must be a positive number'];
    if (amount > 1000000) errors.amount = ['Maximum deposit amount is $1,000,000'];
    if (Object.keys(errors).length > 0) return validationErrorResponse(errors);

    const result = await WalletService.deposit(walletId, authResult.userId, amount, reference);

    return successResponse({
      transaction: {
        id: result.transaction.id,
        type: result.transaction.type,
        amount: result.transaction.amount.toString(),
        currency: result.transaction.currency,
        status: result.transaction.status,
        reference: result.transaction.reference,
        createdAt: result.transaction.createdAt,
      },
    }, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return errorResponse('NOT_FOUND', error.message, 404);
      }
      if (error.message.includes('frozen') || error.message.includes('inactive')) {
        return errorResponse('WALLET_FROZEN', error.message, 403);
      }
    }
    console.error('Deposit error:', error);
    return errorResponse('INTERNAL_ERROR', 'Deposit failed', 500);
  }
}
