// Cherokee Bank - Wallet Types

export enum FiatCurrency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  CHERO = 'CHERO',
}

export enum CryptoCurrency {
  BTC = 'BTC',
  ETH = 'ETH',
  USDT = 'USDT',
}

export type Currency = FiatCurrency | CryptoCurrency;

export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  CLOSED = 'CLOSED',
}

export interface Wallet {
  id: string;
  userId: string;
  currency: FiatCurrency;
  balance: number;
  availableBalance: number;
  isDefault: boolean;
  status: WalletStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CryptoWallet {
  id: string;
  userId: string;
  currency: CryptoCurrency;
  balance: number;
  address: string;
  status: WalletStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletSummary {
  totalBalanceUSD: number;
  wallets: Wallet[];
  cryptoWallets: CryptoWallet[];
}

export interface CreateWalletInput {
  currency: FiatCurrency;
}

export interface DepositInput {
  walletId: string;
  amount: number;
  reference?: string;
}

export interface WithdrawInput {
  walletId: string;
  amount: number;
  reference?: string;
}

export interface ConvertInput {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
}

export interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;
  timestamp: Date;
}
