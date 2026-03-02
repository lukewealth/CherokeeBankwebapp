// Cherokee Bank - Update Security Settings API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAuth } from '@/src/server/auth/guards';
import { successResponse, errorResponse } from '@/src/utils/api-response';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const body = await request.json();
    const { currentPassword, newPassword, twoFactorEnabled } = body;

    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: { id: true, passwordHash: true, twoFactorEnabled: true },
    });

    if (!user) {
      return errorResponse('NOT_FOUND', 'User not found', 404);
    }

    const updateData: Record<string, any> = {};

    // Password change
    if (currentPassword && newPassword) {
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return errorResponse('VALIDATION_ERROR', 'Current password is incorrect', 400);
      }
      if (newPassword.length < 8) {
        return errorResponse('VALIDATION_ERROR', 'New password must be at least 8 characters', 400);
      }
      updateData.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    // 2FA toggle
    if (typeof twoFactorEnabled === 'boolean') {
      updateData.twoFactorEnabled = twoFactorEnabled;
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse('VALIDATION_ERROR', 'No changes provided', 400);
    }

    await prisma.user.update({
      where: { id: authResult.userId },
      data: updateData,
    });

    return successResponse({ message: 'Security settings updated successfully' });
  } catch (error) {
    console.error('Security settings update error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to update security settings', 500);
  }
}
