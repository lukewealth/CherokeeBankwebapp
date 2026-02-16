// Cherokee Bank - Crypto Types

import type { CryptoCurrency } from './wallet';

export interface CryptoPrice {
  symbol: string;
  name: string;
  priceUSD: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: Date;
}

export interface CryptoBuyInput {
  cryptoCurrency: string;
  fiatWalletId: string;
  amountUSD: number;
}

export interface CryptoSellInput {
  cryptoCurrency: string;
  fiatWalletId: string;
  cryptoAmount: number;
}

export interface CryptoPortfolio {
  totalValueUSD: number;
  holdings?: CryptoHolding[];
  wallets?: any[];
  prices?: CryptoPrice[];
}

export interface CryptoHolding {
  currency: string;
  balance: number;
  valueUSD: number;
  priceUSD: number;
  change24h: number;
  allocation: number; // percentage of portfolio
}
