// Cherokee Bank - Crypto Price Provider
import { cacheGet, cacheSet } from '@/src/config/redis';
import { cryptoProviders } from '@/src/config/crypto-providers';

const PRICE_CACHE_TTL = 60; // 1 minute

export interface CryptoPriceData {
  symbol: string;
  name: string;
  priceUSD: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: Date;
}

export class CryptoProvider {
  /**
   * Get current prices for all supported cryptocurrencies
   */
  static async getPrices(): Promise<Record<string, CryptoPriceData>> {
    const cacheKey = 'crypto_prices';
    const cached = await cacheGet(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      const coins = Object.values(cryptoProviders.supportedCoins);
      const ids = coins.map((c) => c.id).join(',');
      
      const res = await fetch(
        `${cryptoProviders.priceApi.baseUrl}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
      );

      if (!res.ok) throw new Error('Price API unavailable');

      const data = await res.json();
      const prices: Record<string, CryptoPriceData> = {};

      for (const coin of coins) {
        const coinData = data[coin.id];
        if (coinData) {
          prices[coin.symbol] = {
            symbol: coin.symbol,
            name: coin.name,
            priceUSD: coinData.usd || 0,
            change24h: coinData.usd_24h_change || 0,
            volume24h: coinData.usd_24h_vol || 0,
            marketCap: coinData.usd_market_cap || 0,
            lastUpdated: new Date(),
          };
        }
      }

      await cacheSet(cacheKey, JSON.stringify(prices), PRICE_CACHE_TTL);
      return prices;
    } catch (error) {
      console.error('Failed to fetch crypto prices:', error);
      // Return fallback prices
      return {
        BTC: { symbol: 'BTC', name: 'Bitcoin', priceUSD: 95000, change24h: 0, volume24h: 0, marketCap: 0, lastUpdated: new Date() },
        ETH: { symbol: 'ETH', name: 'Ethereum', priceUSD: 3200, change24h: 0, volume24h: 0, marketCap: 0, lastUpdated: new Date() },
        USDT: { symbol: 'USDT', name: 'Tether', priceUSD: 1.0, change24h: 0, volume24h: 0, marketCap: 0, lastUpdated: new Date() },
      };
    }
  }

  /**
   * Get price for a specific cryptocurrency
   */
  static async getPrice(symbol: string): Promise<CryptoPriceData | null> {
    const prices = await this.getPrices();
    return prices[symbol] || null;
  }
}
