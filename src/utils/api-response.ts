// Cherokee Bank - API Response Helper
import { NextResponse } from 'next/server';
import type { ApiResponse, ApiError, PaginationMeta } from '@/src/types/api';

export function successResponse<T>(data: T, status: number = 200, meta?: PaginationMeta): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, meta }, { status });
}

export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: Record<string, string[]>
): NextResponse<ApiResponse> {
  const error: ApiError = { code, message, details };
  return NextResponse.json({ success: false, error }, { status });
}

export function validationErrorResponse(errors: Record<string, string[]>): NextResponse<ApiResponse> {
  return errorResponse('VALIDATION_ERROR', 'Invalid input', 422, errors);
}

export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse<ApiResponse> {
  return errorResponse('UNAUTHORIZED', message, 401);
}

export function forbiddenResponse(message: string = 'Forbidden'): NextResponse<ApiResponse> {
  return errorResponse('FORBIDDEN', message, 403);
}

export function notFoundResponse(resource: string = 'Resource'): NextResponse<ApiResponse> {
  return errorResponse('NOT_FOUND', `${resource} not found`, 404);
}

export function internalErrorResponse(message: string = 'Internal server error'): NextResponse<ApiResponse> {
  return errorResponse('INTERNAL_ERROR', message, 500);
}

export function rateLimitResponse(): NextResponse<ApiResponse> {
  return errorResponse('RATE_LIMIT_EXCEEDED', 'Too many requests. Please try again later.', 429);
}
