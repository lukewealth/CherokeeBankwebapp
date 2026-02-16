// Cherokee Bank - Virtual Card Actions API (freeze, update, cancel)
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAuth } from '@/src/server/auth/guards';
import {
  successResponse,
  errorResponse,
} from '@/src/utils/api-response';

type RouteContext = { params: Promise<{ id: string }> };

// GET - Get single card details
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const { id } = await context.params;

    const card = await prisma.virtualCard.findFirst({
      where: { id, userId: authResult.userId },
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

    if (!card) {
      return errorResponse('NOT_FOUND', 'Card not found', 404);
    }

    return successResponse({
      card: {
        ...card,
        spendingLimit: card.spendingLimit.toString(),
        currentSpend: card.currentSpend.toString(),
      },
    });
  } catch (error) {
    console.error('Card get error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch card', 500);
  }
}

// PATCH - Update card (freeze/unfreeze, update limits, update name)
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const { id } = await context.params;
    const body = await request.json();
    const { action, spendingLimit, cardName, merchantLimits } = body;

    // Verify ownership
    const existingCard = await prisma.virtualCard.findFirst({
      where: { id, userId: authResult.userId },
    });

    if (!existingCard) {
      return errorResponse('NOT_FOUND', 'Card not found', 404);
    }

    if (existingCard.status === 'CANCELLED' || existingCard.status === 'EXPIRED') {
      return errorResponse('INVALID_STATE', 'Cannot update a cancelled or expired card', 400);
    }

    // Build update data
    const updateData: any = {};

    // Toggle freeze action
    if (action === 'freeze') {
      updateData.isFrozen = true;
      updateData.status = 'FROZEN';
    } else if (action === 'unfreeze') {
      updateData.isFrozen = false;
      updateData.status = 'ACTIVE';
    }

    // Update spending limit
    if (spendingLimit !== undefined) {
      if (spendingLimit < 100 || spendingLimit > 100000) {
        return errorResponse('VALIDATION_ERROR', 'Spending limit must be between $100 and $100,000', 400);
      }
      updateData.spendingLimit = spendingLimit;
    }

    // Update card name
    if (cardName) {
      updateData.cardName = cardName.trim();
    }

    // Update merchant limits in metadata
    if (merchantLimits) {
      const currentMeta = (existingCard.metadata as any) || {};
      updateData.metadata = { ...currentMeta, merchantLimits };
    }

    const card = await prisma.virtualCard.update({
      where: { id },
      data: updateData,
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
      card: {
        ...card,
        spendingLimit: card.spendingLimit.toString(),
        currentSpend: card.currentSpend.toString(),
      },
    });
  } catch (error) {
    console.error('Card update error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to update card', 500);
  }
}

// DELETE - Cancel a card
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const { id } = await context.params;

    // Verify ownership
    const existingCard = await prisma.virtualCard.findFirst({
      where: { id, userId: authResult.userId },
    });

    if (!existingCard) {
      return errorResponse('NOT_FOUND', 'Card not found', 404);
    }

    if (existingCard.status === 'CANCELLED') {
      return errorResponse('INVALID_STATE', 'Card is already cancelled', 400);
    }

    const card = await prisma.virtualCard.update({
      where: { id },
      data: { status: 'CANCELLED' },
      select: {
        id: true,
        cardName: true,
        last4: true,
        status: true,
      },
    });

    return successResponse({ card, message: 'Card cancelled successfully' });
  } catch (error) {
    console.error('Card delete error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to cancel card', 500);
  }
}
