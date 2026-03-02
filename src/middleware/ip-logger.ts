// Cherokee Bank - IP Logger Middleware
import { prisma } from '@/src/config/db';
import { getClientIp } from '@/src/utils/helpers';

/**
 * Log a security event
 */
export async function logSecurityEvent(
  userId: string,
  type: string,
  headers: Headers,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const ipAddress = getClientIp(headers);
    const userAgent = headers.get('user-agent') || undefined;

    await prisma.securityEvent.create({
      data: {
        userId,
        type: type as never,
        ipAddress,
        userAgent,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}
