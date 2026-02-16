// Cherokee Bank - Crypto Rate API Route
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/src/utils/api-response';

// Mock crypto prices (production integrates CoinGecko, Binance, etc.)
const CRYPTO_PRICES: Record<string, { usd: number; eur: number; gbp: number; change24h: number }> = {
  BTC: { usd: 67500.00, eur: 62100.00, gbp: 53325.00, change24h: 2.35 },
  ETH: { usd: 3450.00, eur: 3174.00, gbp: 2725.50, change24h: -1.12 },
  USDT: { usd: 1.00, eur: 0.92, gbp: 0.79, change24h: 0.01 },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency');
    const fiat = (searchParams.get('fiat') || 'usd').toLowerCase();

    if (currency) {
      const rate = CRYPTO_PRICES[currency.toUpperCase()];
      if (!rate) {
        return errorResponse('NOT_FOUND', `Rate not found for ${currency}`, 404);
      }
      return successResponse({
        currency: currency.toUpperCase(),
        fiat: fiat.toUpperCase(),
        price: rate[fiat as keyof typeof rate] || rate.usd,
        change24h: rate.change24h,
        timestamp: new Date().toISOString(),
      });
    }

    // Return all rates
    const rates = Object.entries(CRYPTO_PRICES).map(([symbol, data]) => ({
      currency: symbol,
      price: data[fiat as keyof typeof data] || data.usd,
      change24h: data.change24h,
    }));

    return successResponse({
      fiat: fiat.toUpperCase(),
      rates,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Crypto rate error:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch rates', 500);
  }
}
