// Cherokee Bank - Virtual Cards API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAuth } from '@/src/server/auth/guards';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from '@/src/utils/api-response';
import crypto from 'crypto';

// Helper: generate a random 16-digit card number (Visa-like prefix 4532)
function generateCardNumber(): string {
  const prefix = '4532';
  let num = prefix;
  for (let i = 0; i < 12; i++) num += Math.floor(Math.random() * 10).toString();
  return num;
}

// Helper: generate 3-digit CVV
function generateCVV(): string {
  return Math.floor(100 + Math.random() * 900).toString();
}

// Helper: hash CVV for storage
function hashCVV(cvv: string): string {
  return crypto.createHash('sha256').update(cvv).digest('hex');
}

// GET - List user's virtual cards
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const cards = await prisma.virtualCard.findMany({
      where: { userId: authResult.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        cardName: true,
        last4: true,
        expiryMonth: true,
        expiryYear: true,
        currency: true,
        spendingLimit: true,
        currentSpend: true,
        cardType: true,
        cardUsage: true,
        status: true,
        isFrozen: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse({
      cards: cards.map((c) => ({
        ...c,
        spendingLimit: c.spendingLimit.toString(),
        currentSpend: c.currentSpend.toString(),
      })),
      total: cards.length,
    });
  } catch (error) {
    console.error('Cards list error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch cards', 500);
  }
}

// POST - Generate a new virtual card
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const body = await request.json();
    const {
      cardName,
      currency = 'USD',
      spendingLimit = 5000,
      cardUsage = 'MULTI_USE',
      cardType = 'VIRTUAL',
      merchantLimits,
    } = body;

    // Validation
    const errors: Record<string, string[]> = {};
    if (!cardName || cardName.trim().length === 0)
      errors.cardName = ['Card name is required'];
    if (!['USD', 'EUR', 'GBP', 'CHERO'].includes(currency))
      errors.currency = ['Invalid currency'];
    if (spendingLimit < 100 || spendingLimit > 100000)
      errors.spendingLimit = ['Spending limit must be between $100 and $100,000'];
    if (!['SINGLE_USE', 'MULTI_USE'].includes(cardUsage))
      errors.cardUsage = ['Card usage must be SINGLE_USE or MULTI_USE'];
    if (Object.keys(errors).length > 0) return validationErrorResponse(errors);

    // Check user has max 10 active cards
    const activeCount = await prisma.virtualCard.count({
      where: {
        userId: authResult.userId,
        status: { in: ['ACTIVE', 'FROZEN'] },
      },
    });
    if (activeCount >= 10) {
      return errorResponse(
        'LIMIT_EXCEEDED',
        'Maximum of 10 active cards allowed',
        400
      );
    }

    // Generate card details
    const cardNumber = generateCardNumber();
    const last4 = cardNumber.slice(-4);
    const cvv = generateCVV();
    const cvvHash = hashCVV(cvv);

    // Expiry = 3 years from now
    const now = new Date();
    const expiryMonth = now.getMonth() + 1;
    const expiryYear = now.getFullYear() + 3;

    const card = await prisma.virtualCard.create({
      data: {
        userId: authResult.userId,
        cardName: cardName.trim(),
        last4,
        expiryMonth,
        expiryYear,
        cvvHash,
        currency,
        spendingLimit,
        cardUsage,
        cardType,
        metadata: merchantLimits ? { merchantLimits } : undefined,
      },
      select: {
        id: true,
        cardName: true,
        last4: true,
        expiryMonth: true,
        expiryYear: true,
        currency: true,
        spendingLimit: true,
        currentSpend: true,
        cardType: true,
        cardUsage: true,
        status: true,
        isFrozen: true,
        metadata: true,
        createdAt: true,
      },
    });

    return successResponse(
      {
        card: {
          ...card,
          spendingLimit: card.spendingLimit.toString(),
          currentSpend: card.currentSpend.toString(),
          // Return full card number and CVV only on creation
          cardNumber: cardNumber.replace(/(.{4})/g, '$1 ').trim(),
          cvv,
        },
      },
      201
    );
  } catch (error) {
    console.error('Card creation error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to create card', 500);
  }
}
