// Cherokee Bank - Login API Route
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/config/db';
import { comparePassword } from '@/src/server/auth/bcrypt';
import { generateTokens } from '@/src/server/auth/jwt';
import { successResponse, errorResponse, validationErrorResponse } from '@/src/utils/api-response';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    const errors: Record<string, string[]> = {};
    if (!email) errors.email = ['Email is required'];
    if (!password) errors.password = ['Password is required'];
    if (Object.keys(errors).length > 0) return validationErrorResponse(errors);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        kycStatus: true,
        twoFactorEnabled: true,
        failedLoginCount: true,
        lockedUntil: true,
      },
    });

    if (!user) {
      return errorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    // Check account lockout
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const minutesRemaining = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 60000);
      return errorResponse('ACCOUNT_LOCKED', `Account locked. Try again in ${minutesRemaining} minutes.`, 423);
    }

    // Check account status
    if (user.status === 'FROZEN') {
      return errorResponse('ACCOUNT_FROZEN', 'Your account has been frozen. Contact support.', 403);
    }
    if (user.status === 'SUSPENDED') {
      return errorResponse('ACCOUNT_SUSPENDED', 'Your account has been suspended.', 403);
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      const newFailedCount = user.failedLoginCount + 1;
      const updateData: Record<string, unknown> = { failedLoginCount: newFailedCount };

      if (newFailedCount >= MAX_FAILED_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      // Log failed login
      await prisma.securityEvent.create({
        data: {
          userId: user.id,
          type: 'FAILED_LOGIN',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });

      return errorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Return partial response indicating 2FA is needed
      return successResponse({
        requiresTwoFactor: true,
        userId: user.id,
      });
    }

    // Reset failed login count & update last login
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    // Generate tokens
    const tokens = generateTokens(user.id, user.email, user.role);

    // Store refresh token
    const crypto = await import('crypto');
    const tokenHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        deviceInfo: request.headers.get('user-agent') || null,
        ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Log security event
    await prisma.securityEvent.create({
      data: {
        userId: user.id,
        type: 'LOGIN',
        ipAddress,
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // Create response with tokens
    const response = successResponse({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        kycStatus: user.kycStatus,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      tokens,
    });

    // Set secure HTTP-only cookies for auth middleware
    const accessTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    response.cookies.set('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes in seconds
      path: '/',
    });

    response.cookies.set('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('INTERNAL_ERROR', 'Login failed', 500);
  }
}
