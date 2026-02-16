// Cherokee Bank - Audit Log Service
import { prisma } from '@/src/config/db';

export class AuditService {
  /**
   * Create an audit log entry
   */
  static async log(
    actorId: string,
    action: string,
    targetType: string,
    targetId: string,
    ipAddress: string,
    metadata?: Record<string, unknown>,
    userAgent?: string
  ) {
    return prisma.auditLog.create({
      data: {
        actorId,
        action,
        targetType,
        targetId,
        ipAddress,
        userAgent,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
    });
  }

  /**
   * Query audit logs with filters
   */
  static async getLogs(options: {
    actorId?: string;
    action?: string;
    targetType?: string;
    targetId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (options.actorId) where.actorId = options.actorId;
    if (options.action) where.action = options.action;
    if (options.targetType) where.targetType = options.targetType;
    if (options.targetId) where.targetId = options.targetId;
    if (options.dateFrom || options.dateTo) {
      where.createdAt = {
        ...(options.dateFrom && { gte: options.dateFrom }),
        ...(options.dateTo && { lte: options.dateTo }),
      };
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: where as never,
        include: {
          actor: { select: { email: true, firstName: true, lastName: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where: where as never }),
    ]);

    return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
