// Cherokee Bank - Admin KYC Review API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAdmin } from '@/src/server/auth/guards';
import { successResponse, errorResponse, validationErrorResponse } from '@/src/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if ('status' in authResult) return authResult;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));

    const [documents, total] = await Promise.all([
      prisma.kYCDocument.findMany({
        where: { status: status as 'PENDING' | 'VERIFIED' | 'REJECTED' },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, kycStatus: true } },
          reviewer: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.kYCDocument.count({ where: { status: status as 'PENDING' | 'VERIFIED' | 'REJECTED' } }),
    ]);

    return successResponse(
      { documents },
      200,
      { page, limit, total, totalPages: Math.ceil(total / limit) },
    );
  } catch (error) {
    console.error('KYC review list error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch KYC documents', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if ('status' in authResult) return authResult;

    const body = await request.json();
    const { documentId, status, reviewNotes } = body;

    const errors: Record<string, string[]> = {};
    if (!documentId) errors.documentId = ['Document ID is required'];
    if (!status || !['VERIFIED', 'REJECTED'].includes(status)) {
      errors.status = ['Status must be VERIFIED or REJECTED'];
    }
    if (status === 'REJECTED' && (!reviewNotes || reviewNotes.trim().length < 5)) {
      errors.reviewNotes = ['Review notes required for rejection'];
    }
    if (Object.keys(errors).length > 0) return validationErrorResponse(errors);

    const document = await prisma.kYCDocument.findUnique({
      where: { id: documentId },
      include: { user: { select: { id: true, kycStatus: true } } },
    });

    if (!document) return errorResponse('NOT_FOUND', 'Document not found', 404);
    if (document.status !== 'PENDING') return errorResponse('CONFLICT', 'Document already reviewed', 409);

    await prisma.$transaction(async (tx) => {
      // Update document status
      await tx.kYCDocument.update({
        where: { id: documentId },
        data: {
          status,
          reviewedBy: authResult.userId,
          reviewNotes: reviewNotes || null,
          reviewedAt: new Date(),
        },
      });

      // If verified, check if all required docs are verified → update user KYC status
      if (status === 'VERIFIED') {
        const allDocs = await tx.kYCDocument.findMany({
          where: { userId: document.userId },
        });
        const allVerified = allDocs.every((d) => d.id === documentId ? true : d.status === 'VERIFIED');
        if (allVerified && allDocs.length >= 2) {
          await tx.user.update({
            where: { id: document.userId },
            data: { kycStatus: 'VERIFIED' },
          });
        }
      } else if (status === 'REJECTED') {
        await tx.user.update({
          where: { id: document.userId },
          data: { kycStatus: 'REJECTED' },
        });
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          actorId: authResult.userId,
          action: `KYC_${status}`,
          targetType: 'KYC_DOCUMENT',
          targetId: documentId,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          metadata: { userId: document.userId, docType: document.type, reviewNotes },
        },
      });

      // Security event
      await tx.securityEvent.create({
        data: {
          userId: document.userId,
          type: 'KYC_REVIEWED',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          metadata: { documentId, status, reviewedBy: authResult.userId },
        },
      });
    });

    return successResponse({ message: `Document ${status.toLowerCase()} successfully`, documentId });
  } catch (error) {
    console.error('KYC review error:', error);
    return errorResponse('INTERNAL_ERROR', 'KYC review failed', 500);
  }
}
