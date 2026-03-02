// Cherokee Bank - Root Middleware (Next.js Edge Middleware)
import { NextRequest, NextResponse } from 'next/server';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/about', '/careers', '/support', '/legal', '/login', '/register', '/reset-password', '/verify-otp'];
const API_PUBLIC_ROUTES = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/auth/otp', '/api/auth/logout', '/api/crypto/rate'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ── Security Headers ──
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload',
  );

  // ── Skip static assets ──
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return response;
  }

  // ── CORS for API routes ──
  if (pathname.startsWith('/api')) {
    const origin = request.headers.get('origin') || '';
    const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');

    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
      response.headers.set('Access-Control-Max-Age', '86400');
    }

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }

    // Skip auth check for public API routes
    if (API_PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
      return response;
    }

    // Check for Authorization header OR access_token cookie on protected API routes
    const authHeader = request.headers.get('authorization');
    const accessTokenCookie = request.cookies.get('access_token')?.value;
    if ((!authHeader || !authHeader.startsWith('Bearer ')) && !accessTokenCookie) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 },
      );
    }

    return response;
  }

  // ── Page Route Protection ──
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!isPublicRoute) {
    // For protected pages, check for auth cookie/token
    const token = request.cookies.get('access_token')?.value;

    if (!token && pathname !== '/login') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
