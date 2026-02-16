// Cherokee Bank - Register API Route
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/config/db';
import { hashPassword } from '@/src/server/auth/bcrypt';
import { generateTokens } from '@/src/server/auth/jwt';
import { WalletService } from '@/src/server/banking/wallet.service';
import { successResponse, errorResponse, validationErrorResponse } from '@/src/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone } = body;

    // Validation
    const errors: Record<string, string[]> = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = ['Valid email is required'];
    if (!password || password.length < 8) errors.password = ['Password must be at least 8 characters'];
    if (!firstName || firstName.trim().length < 1) errors.firstName = ['First name is required'];
    if (!lastName || lastName.trim().length < 1) errors.lastName = ['Last name is required'];
    if (Object.keys(errors).length > 0) return validationErrorResponse(errors);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return errorResponse('ALREADY_EXISTS', 'An account with this email already exists', 409);
    }

    // Check if phone already exists
    if (phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone } });
      if (existingPhone) {
        return errorResponse('ALREADY_EXISTS', 'An account with this phone number already exists', 409);
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user in transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone || null,
          status: 'ACTIVE',
          role: 'USER',
        },
      });

      return newUser;
    });

    // Create default wallets
    await WalletService.createDefaultWallets(user.id);

    // Generate tokens
    const tokens = generateTokens(user.id, user.email, user.role);

    // Log security event
    await prisma.securityEvent.create({
      data: {
        userId: user.id,
        type: 'LOGIN',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
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
      },
      tokens,
    }, 201);

    // Set secure HTTP-only cookies for auth middleware
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
    console.error('Registration error:', error);
    return errorResponse('INTERNAL_ERROR', 'Registration failed', 500);
  }
}
