// Cherokee Bank - Environment Configuration
// Centralized environment variable validation using Zod

import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string'),
  
  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  
  // OpenAI
  OPENAI_API_KEY: z.string().startsWith('sk-', 'OPENAI_API_KEY must start with sk-'),
  OPENAI_MODEL: z.string().default('gpt-4'),
  
  // Redis
  REDIS_URL: z.string().url().optional(),
  
  // Email (SMTP)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  
  // Crypto Provider
  CRYPTO_PROVIDER_KEY: z.string().optional(),
  CRYPTO_PROVIDER_URL: z.string().url().optional(),
  
  // Exchange Rate API
  EXCHANGE_RATE_API_KEY: z.string().optional(),
  
  // Storage
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_REGION: z.string().default('us-east-1'),
  
  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Cherokee Bank'),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Admin
  ADMIN_DEFAULT_EMAIL: z.string().email().optional(),
  ADMIN_DEFAULT_PASSWORD: z.string().min(8).optional(),
  
  // Cherokee Currency
  CHERO_PEG_RATE_USD: z.coerce.number().positive().default(1.0),
});

export type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  // In development, allow partial env - only validate what's present
  if (process.env.NODE_ENV === 'development') {
    const partial = envSchema.partial().safeParse(process.env);
    if (!partial.success) {
      console.warn('⚠️ Environment validation warnings:', partial.error.flatten().fieldErrors);
    }
    return {
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/cherokee_bank',
      JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production-32chars!',
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-prod-32!',
      JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
      JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'sk-dev-placeholder',
      OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4',
      REDIS_URL: process.env.REDIS_URL,
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      SMTP_FROM: process.env.SMTP_FROM,
      CRYPTO_PROVIDER_KEY: process.env.CRYPTO_PROVIDER_KEY,
      CRYPTO_PROVIDER_URL: process.env.CRYPTO_PROVIDER_URL,
      EXCHANGE_RATE_API_KEY: process.env.EXCHANGE_RATE_API_KEY,
      STORAGE_BUCKET: process.env.STORAGE_BUCKET,
      STORAGE_REGION: process.env.STORAGE_REGION || 'us-east-1',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Cherokee Bank',
      NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
      ADMIN_DEFAULT_EMAIL: process.env.ADMIN_DEFAULT_EMAIL,
      ADMIN_DEFAULT_PASSWORD: process.env.ADMIN_DEFAULT_PASSWORD,
      CHERO_PEG_RATE_USD: Number(process.env.CHERO_PEG_RATE_USD) || 1.0,
    };
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables. Check server logs.');
  }
  return parsed.data;
}

export const env = getEnv();
