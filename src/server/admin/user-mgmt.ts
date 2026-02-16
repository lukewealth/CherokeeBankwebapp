// Cherokee Bank - Admin User Management
import { prisma } from '@/src/config/db';

export class UserManagement {
  /**
   * List all users with pagination and filters
   */
  static async listUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
    kycStatus?: string;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (options.status) where.status = options.status;
    if (options.role) where.role = options.role;
    if (options.kycStatus) where.kycStatus = options.kycStatus;
    if (options.search) {
      where.OR = [
        { email: { contains: options.search, mode: 'insensitive' } },
        { firstName: { contains: options.search, mode: 'insensitive' } },
        { lastName: { contains: options.search, mode: 'insensitive' } },
        { phone: { contains: options.search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: where as never,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          kycStatus: true,
          createdAt: true,
          lastLoginAt: true,
          _count: { select: { wallets: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: where as never }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Get detailed user info (admin view)
   */
  static async getUserDetail(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallets: true,
        cryptoWallets: true,
        kycDocuments: true,
        securityEvents: { take: 20, orderBy: { createdAt: 'desc' } },
        merchant: true,
        _count: {
          select: {
            sentTransactions: true,
            notifications: true,
          },
        },
      },
    });
  }

  /**
   * Freeze a user account
   */
  static async freezeAccount(userId: string, adminId: string, reason: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: 'FROZEN' },
    });

    // Also freeze all wallets
    await prisma.wallet.updateMany({
      where: { userId },
      data: { status: 'FROZEN' },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'FREEZE_ACCOUNT',
        targetType: 'USER',
        targetId: userId,
        metadata: { reason },
        ipAddress: 'admin-action',
      },
    });

    return user;
  }

  /**
   * Unfreeze a user account
   */
  static async unfreezeAccount(userId: string, adminId: string, reason: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' },
    });

    await prisma.wallet.updateMany({
      where: { userId, status: 'FROZEN' },
      data: { status: 'ACTIVE' },
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'UNFREEZE_ACCOUNT',
        targetType: 'USER',
        targetId: userId,
        metadata: { reason },
        ipAddress: 'admin-action',
      },
    });

    return user;
  }
}
