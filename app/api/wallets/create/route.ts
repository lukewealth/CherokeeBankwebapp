// Cherokee Bank - Create Wallet API Route
import { NextRequest } from 'next/server';
import { requireAuth } from '@/src/server/auth/guards';
import { WalletService } from '@/src/server/banking/wallet.service';
import { successResponse, errorResponse, validationErrorResponse } from '@/src/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const body = await request.json();
    const { currency } = body;

    const validCurrencies = ['USD', 'EUR', 'GBP', 'CHERO'];
    if (!currency || !validCurrencies.includes(currency)) {
      return validationErrorResponse({ currency: [`Currency must be one of: ${validCurrencies.join(', ')}`] });
    }

    const wallet = await WalletService.createWallet(authResult.userId, currency);

    return successResponse({
      wallet: {
        id: wallet.id,
        currency: wallet.currency,
        balance: wallet.balance.toString(),
        availableBalance: wallet.availableBalance.toString(),
        isDefault: wallet.isDefault,
        status: wallet.status,
        createdAt: wallet.createdAt,
      },
    }, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      return errorResponse('ALREADY_EXISTS', error.message, 409);
    }
    console.error('Create wallet error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to create wallet', 500);
  }
}
