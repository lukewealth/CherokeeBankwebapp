// Cherokee Bank - Validation Utilities
import { z } from 'zod';

// ==================== Schemas ====================

export const emailSchema = z.string().email('Invalid email address').toLowerCase().trim();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number (use international format)')
  .optional();

export const amountSchema = z
  .number()
  .positive('Amount must be positive')
  .max(1_000_000_000, 'Amount exceeds maximum allowed');

export const uuidSchema = z.string().uuid('Invalid ID format');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ==================== Auth Schemas ====================

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required').max(50).trim(),
  lastName: z.string().min(1, 'Last name is required').max(50).trim(),
  phone: phoneSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const otpSchema = z.object({
  code: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const newPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

// ==================== Wallet Schemas ====================

export const createWalletSchema = z.object({
  currency: z.enum(['USD', 'EUR', 'GBP', 'CHERO']),
});

export const depositSchema = z.object({
  walletId: uuidSchema,
  amount: amountSchema,
  reference: z.string().optional(),
});

export const withdrawSchema = z.object({
  walletId: uuidSchema,
  amount: amountSchema,
  reference: z.string().optional(),
});

export const convertSchema = z.object({
  fromWalletId: uuidSchema,
  toWalletId: uuidSchema,
  amount: amountSchema,
});

// ==================== Transaction Schemas ====================

export const transferSchema = z.object({
  fromWalletId: uuidSchema,
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().optional(),
  toWalletId: uuidSchema.optional(),
  amount: amountSchema,
  currency: z.string().min(1),
  description: z.string().max(500).optional(),
}).refine(
  (data) => data.recipientEmail || data.recipientPhone || data.toWalletId,
  { message: 'Recipient email, phone, or wallet ID is required' }
);

export const transactionFilterSchema = z.object({
  type: z.enum(['TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'CONVERSION', 'POS_PAYMENT', 'CRYPTO_BUY', 'CRYPTO_SELL', 'FEE', 'ADJUSTMENT']).optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'FLAGGED', 'REVERSED', 'CANCELLED']).optional(),
  currency: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ==================== Crypto Schemas ====================

export const cryptoBuySchema = z.object({
  cryptoCurrency: z.enum(['BTC', 'ETH', 'USDT']),
  fiatWalletId: uuidSchema,
  amountUSD: amountSchema,
});

export const cryptoSellSchema = z.object({
  cryptoCurrency: z.enum(['BTC', 'ETH', 'USDT']),
  fiatWalletId: uuidSchema,
  cryptoAmount: z.number().positive(),
});

// ==================== Admin Schemas ====================

export const adjustBalanceSchema = z.object({
  userId: uuidSchema,
  walletId: uuidSchema,
  amount: z.number().refine((n) => n !== 0, 'Amount cannot be zero'),
  type: z.enum(['CREDIT', 'DEBIT']),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
});

export const kycReviewSchema = z.object({
  documentId: uuidSchema,
  status: z.enum(['VERIFIED', 'REJECTED']),
  notes: z.string().min(1).max(1000),
});

// ==================== Merchant Schemas ====================

export const createMerchantSchema = z.object({
  businessName: z.string().min(2).max(100).trim(),
  businessType: z.string().min(2).max(50).trim(),
  settlementWalletId: uuidSchema,
});

export const disputeSchema = z.object({
  transactionId: uuidSchema,
  reason: z.string().min(10).max(1000),
});

// ==================== Utility Functions ====================

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error.flatten().fieldErrors as Record<string, string[]> };
}
