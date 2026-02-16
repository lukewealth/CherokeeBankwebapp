// Cherokee Bank - Wallet Withdraw API Route
import { NextRequest } from 'next/server';
import { requireAuth } from '@/src/server/auth/guards';
import { WalletService } from '@/src/server/banking/wallet.service';
import { successResponse, errorResponse, validationErrorResponse } from '@/src/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const body = await request.json();
    const { walletId, amount, description } = body;

    // Validation
    const errors: Record<string, string[]> = {};
    if (!walletId) errors.walletId = ['Wallet ID is required'];
    if (!amount || isNaN(amount) || amount <= 0) errors.amount = ['Amount must be a positive number'];
    if (Object.keys(errors).length > 0) return validationErrorResponse(errors);

    const result = await WalletService.withdraw(walletId, authResult.userId, amount, description);

    return successResponse({
      transaction: {
        id: result.id,
        type: result.type,
        amount: result.amount.toString(),
        currency: result.currency,
        status: result.status,
        reference: result.reference,
        description: result.description,
        createdAt: result.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Insufficient')) {
        return errorResponse('INSUFFICIENT_BALANCE', error.message, 400);
      }
      if (error.message.includes('not found')) {
        return errorResponse('NOT_FOUND', error.message, 404);
      }
      if (error.message.includes('limit')) {
        return errorResponse('DAILY_LIMIT_EXCEEDED', error.message, 400);
      }
    }
    console.error('Withdraw error:', error);
    return errorResponse('INTERNAL_ERROR', 'Withdrawal failed', 500);
  }
}
