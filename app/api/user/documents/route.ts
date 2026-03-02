// Cherokee Bank - User Documents API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAuth } from '@/src/server/auth/guards';
import { successResponse, errorResponse } from '@/src/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const documents = await prisma.kYCDocument.findMany({
      where: { userId: authResult.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        status: true,
        reviewNotes: true,
        reviewedAt: true,
        createdAt: true,
      },
    });

    return successResponse({ documents });
  } catch (error) {
    console.error('Documents fetch error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch documents', 500);
  }
}
