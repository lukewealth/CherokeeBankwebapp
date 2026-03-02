// Cherokee Bank - Crypto Wallets API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAuth } from '@/src/server/auth/guards';
import { successResponse, errorResponse } from '@/src/utils/api-response';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const wallets = await prisma.cryptoWallet.findMany({
      where: { userId: authResult.userId },
      select: {
        id: true,
        currency: true,
        balance: true,
        address: true,
        status: true,
        createdAt: true,
      },
    });

    return successResponse({
      wallets: wallets.map((w) => ({
        ...w,
        balance: w.balance.toString(),
      })),
    });
  } catch (error) {
    console.error('Crypto wallets error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch crypto wallets', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const body = await request.json();
    const { currency } = body;

    const validCurrencies = ['BTC', 'ETH', 'USDT'];
    if (!currency || !validCurrencies.includes(currency)) {
      return errorResponse('VALIDATION_ERROR', `Currency must be one of: ${validCurrencies.join(', ')}`, 400);
    }

    // Check if wallet already exists
    const existing = await prisma.cryptoWallet.findUnique({
      where: { userId_currency: { userId: authResult.userId, currency } },
    });
    if (existing) {
      return errorResponse('ALREADY_EXISTS', `${currency} wallet already exists`, 409);
    }

    // Generate a mock address (production would integrate with blockchain node)
    const address = `0x${crypto.randomBytes(20).toString('hex')}`;

    const wallet = await prisma.cryptoWallet.create({
      data: {
        userId: authResult.userId,
        currency,
        balance: 0,
        address,
        status: 'ACTIVE',
      },
    });

    return successResponse({
      wallet: {
        id: wallet.id,
        currency: wallet.currency,
        balance: wallet.balance.toString(),
        address: wallet.address,
        status: wallet.status,
        createdAt: wallet.createdAt,
      },
    }, 201);
  } catch (error) {
    console.error('Create crypto wallet error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to create crypto wallet', 500);
  }
}
