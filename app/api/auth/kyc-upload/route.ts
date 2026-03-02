// Cherokee Bank - KYC Document Upload API Route
import { NextRequest } from 'next/server';
import { prisma } from '@/src/config/db';
import { requireAuth } from '@/src/server/auth/guards';
import { successResponse, errorResponse } from '@/src/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('status' in authResult) return authResult;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const docType = formData.get('type') as string;

    if (!file) {
      return errorResponse('VALIDATION_ERROR', 'File is required', 400);
    }

    const validTypes = ['ID', 'PASSPORT', 'UTILITY_BILL', 'SELFIE', 'PROOF_OF_ADDRESS'];
    if (!docType || !validTypes.includes(docType)) {
      return errorResponse('VALIDATION_ERROR', `Document type must be one of: ${validTypes.join(', ')}`, 400);
    }

    // Validate file type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedMimes.includes(file.type)) {
      return errorResponse('VALIDATION_ERROR', 'File must be JPEG, PNG, WebP, or PDF', 400);
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return errorResponse('VALIDATION_ERROR', 'File size must not exceed 10MB', 400);
    }

    // In production, upload to S3/GCS. For now, store metadata.
    const fileUrl = `/uploads/kyc/${authResult.userId}/${Date.now()}-${file.name}`;

    const document = await prisma.kYCDocument.create({
      data: {
        userId: authResult.userId,
        type: docType as 'ID' | 'PASSPORT' | 'UTILITY_BILL' | 'SELFIE' | 'PROOF_OF_ADDRESS',
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        status: 'PENDING',
      },
    });

    // Update user KYC status if first submission
    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: { kycStatus: true },
    });

    if (user?.kycStatus === 'NOT_SUBMITTED') {
      await prisma.user.update({
        where: { id: authResult.userId },
        data: { kycStatus: 'PENDING' },
      });
    }

    // Log security event
    await prisma.securityEvent.create({
      data: {
        userId: authResult.userId,
        type: 'KYC_SUBMITTED',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: { documentId: document.id, docType },
      },
    });

    return successResponse({
      document: {
        id: document.id,
        type: document.type,
        fileName: document.fileName,
        status: document.status,
        createdAt: document.createdAt,
      },
    }, 201);
  } catch (error) {
    console.error('KYC upload error:', error);
    return errorResponse('INTERNAL_ERROR', 'KYC upload failed', 500);
  }
}

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
        status: true,
        reviewNotes: true,
        createdAt: true,
        reviewedAt: true,
      },
    });

    return successResponse({ documents });
  } catch (error) {
    console.error('KYC list error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch documents', 500);
  }
}
