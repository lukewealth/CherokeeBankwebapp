// Cherokee Bank - Currency Engine (Exchange Rates)
import { cacheGet, cacheSet } from '@/src/config/redis';

const CACHE_TTL = 300; // 5 minutes
const CACHE_KEY = 'exchange_rates';

// Default rates (used when API is unavailable)
const defaultRates: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  CHERO: 1.0, // pegged to USD by default
};

export class CurrencyEngine {
  /**
   * Get current exchange rates (all relative to USD)
   */
  static async getRates(): Promise<Record<string, number>> {
    // Check cache first
    const cached = await cacheGet(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const apiKey = process.env.EXCHANGE_RATE_API_KEY;
      if (apiKey) {
        const res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
        if (res.ok) {
          const data = await res.json();
          const rates: Record<string, number> = {
            USD: 1.0,
            EUR: data.conversion_rates?.EUR || defaultRates.EUR,
            GBP: data.conversion_rates?.GBP || defaultRates.GBP,
            CHERO: Number(process.env.CHERO_PEG_RATE_USD) || 1.0,
          };
          await cacheSet(CACHE_KEY, JSON.stringify(rates), CACHE_TTL);
          return rates;
        }
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    }

    // Fallback to default rates
    return {
      ...defaultRates,
      CHERO: Number(process.env.CHERO_PEG_RATE_USD) || 1.0,
    };
  }

  /**
   * Convert amount from one currency to another
   */
  static async convert(amount: number, from: string, to: string): Promise<{ convertedAmount: number; rate: number }> {
    if (from === to) return { convertedAmount: amount, rate: 1.0 };

    const rates = await this.getRates();
    const fromRate = rates[from];
    const toRate = rates[to];

    if (!fromRate || !toRate) {
      throw new Error(`Unsupported currency pair: ${from}/${to}`);
    }

    // Convert to USD first, then to target
    const inUSD = amount / fromRate;
    const convertedAmount = inUSD * toRate;
    const rate = toRate / fromRate;

    return {
      convertedAmount: Math.round(convertedAmount * 100) / 100,
      rate: Math.round(rate * 1000000) / 1000000,
    };
  }

  /**
   * Get conversion rate between two currencies
   */
  static async getRate(from: string, to: string): Promise<number> {
    const { rate } = await this.convert(1, from, to);
    return rate;
  }

  /**
   * Get all rates for display
   */
  static async getAllRates(): Promise<{ base: string; rates: Record<string, number>; timestamp: Date }> {
    const rates = await this.getRates();
    return {
      base: 'USD',
      rates,
      timestamp: new Date(),
    };
  }
}
