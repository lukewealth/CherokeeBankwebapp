// Cherokee Bank - Auth Guards (Middleware for API routes)
import { NextRequest } from 'next/server';
import { verifyAccessToken, extractToken } from './jwt';
import { prisma } from '@/src/config/db';
import { unauthorizedResponse, forbiddenResponse, errorResponse } from '@/src/utils/api-response';
import type { JWTPayload, UserRole } from '@/src/types/user';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Authenticate user from JWT token
 * Returns JWTPayload if valid, or NextResponse error
 */
export async function requireAuth(request: NextRequest): Promise<JWTPayload | ReturnType<typeof unauthorizedResponse>> {
  const authHeader = request.headers.get('authorization');
  let token = extractToken(authHeader);

  // Fallback: read access_token from cookies (set by login)
  if (!token) {
    token = request.cookies.get('access_token')?.value ?? null;
  }

  if (!token) {
    return unauthorizedResponse('Missing authentication token');
  }

  try {
    const payload = verifyAccessToken(token);

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, status: true, role: true },
    });

    if (!user) {
      return unauthorizedResponse('User not found');
    }

    if (user.status === 'FROZEN') {
      return errorResponse('ACCOUNT_FROZEN', 'Your account has been frozen. Contact support.', 403);
    }

    if (user.status === 'SUSPENDED') {
      return errorResponse('ACCOUNT_SUSPENDED', 'Your account has been suspended.', 403);
    }

    if (user.status === 'PENDING') {
      return errorResponse('ACCOUNT_PENDING', 'Please verify your email to continue.', 403);
    }

    return payload;
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return errorResponse('TOKEN_EXPIRED', 'Access token has expired. Please refresh.', 401);
    }
    return unauthorizedResponse('Invalid authentication token');
  }
}

/**
 * Require ADMIN or SUPERADMIN role
 */
export async function requireAdmin(request: NextRequest): Promise<JWTPayload | ReturnType<typeof forbiddenResponse>> {
  const authResult = await requireAuth(request);
  
  // If it's a NextResponse (error), return it
  if ('status' in authResult) return authResult;
  
  if (authResult.role !== 'ADMIN' && authResult.role !== 'SUPERADMIN') {
    return forbiddenResponse('Admin access required');
  }

  return authResult;
}

/**
 * Require SUPERADMIN role
 */
export async function requireSuperAdmin(request: NextRequest): Promise<JWTPayload | ReturnType<typeof forbiddenResponse>> {
  const authResult = await requireAuth(request);
  
  if ('status' in authResult) return authResult;
  
  if (authResult.role !== 'SUPERADMIN') {
    return forbiddenResponse('Super Admin access required');
  }

  return authResult;
}

/**
 * Check if auth result is an error response
 */
export function isAuthError(result: unknown): result is ReturnType<typeof unauthorizedResponse> {
  return result !== null && typeof result === 'object' && 'status' in result;
}

/**
 * Helper to require specific roles
 */
export async function requireRole(request: NextRequest, ...roles: UserRole[]): Promise<JWTPayload | ReturnType<typeof forbiddenResponse>> {
  const authResult = await requireAuth(request);
  
  if ('status' in authResult) return authResult;
  
  if (!roles.includes(authResult.role as UserRole)) {
    return forbiddenResponse(`Required role: ${roles.join(' or ')}`);
  }

  return authResult;
}
