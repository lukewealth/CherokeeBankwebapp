// Cherokee Bank - Compliance: KYC Service
import { prisma } from '@/src/config/db';

export class KYCService {
  /**
   * Submit a KYC document
   */
  static async submitDocument(
    userId: string,
    type: 'ID' | 'PASSPORT' | 'UTILITY_BILL' | 'SELFIE' | 'PROOF_OF_ADDRESS',
    fileUrl: string,
    fileName: string,
    fileSize: number,
    mimeType: string
  ) {
    const doc = await prisma.kYCDocument.create({
      data: {
        userId,
        type,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        status: 'PENDING',
      },
    });

    // Update user KYC status
    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'PENDING' },
    });

    return doc;
  }

  /**
   * Review a KYC document (admin)
   */
  static async reviewDocument(
    documentId: string,
    reviewerId: string,
    status: 'VERIFIED' | 'REJECTED',
    notes: string
  ) {
    const doc = await prisma.kYCDocument.update({
      where: { id: documentId },
      data: {
        status,
        reviewedBy: reviewerId,
        reviewNotes: notes,
        reviewedAt: new Date(),
      },
    });

    // Check if all required documents are verified
    const allDocs = await prisma.kYCDocument.findMany({
      where: { userId: doc.userId },
    });

    const allVerified = allDocs.length > 0 && allDocs.every((d) => d.status === 'VERIFIED');
    const anyRejected = allDocs.some((d) => d.status === 'REJECTED');

    if (allVerified) {
      await prisma.user.update({
        where: { id: doc.userId },
        data: { kycStatus: 'VERIFIED' },
      });
    } else if (anyRejected) {
      await prisma.user.update({
        where: { id: doc.userId },
        data: { kycStatus: 'REJECTED' },
      });
    }

    return doc;
  }

  /**
   * Get pending KYC documents for admin review
   */
  static async getPendingDocuments(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      prisma.kYCDocument.findMany({
        where: { status: 'PENDING' },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.kYCDocument.count({ where: { status: 'PENDING' } }),
    ]);

    return { documents: docs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
