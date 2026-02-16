// Cherokee Bank - User Update API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAuth } from '@/src/server/auth/guards';
import { successResponse, errorResponse } from '@/src/utils/api-response';

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const body = await request.json();
    const allowedFields = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'street', 'city', 'state', 'country', 'postalCode', 'avatarUrl'];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'dateOfBirth') {
          updateData[field] = new Date(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse('VALIDATION_ERROR', 'No valid fields to update', 400);
    }

    // If phone is being updated, check uniqueness
    if (updateData.phone) {
      const existing = await prisma.user.findFirst({
        where: { phone: updateData.phone as string, id: { not: authResult.userId } },
      });
      if (existing) {
        return errorResponse('ALREADY_EXISTS', 'Phone number already in use', 409);
      }
    }

    const user = await prisma.user.update({
      where: { id: authResult.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        dateOfBirth: true,
        street: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        updatedAt: true,
      },
    });

    return successResponse({ user });
  } catch (error) {
    console.error('Profile update error:', error);
    return errorResponse('INTERNAL_ERROR', 'Profile update failed', 500);
  }
}
