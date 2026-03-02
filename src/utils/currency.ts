// Cherokee Bank - Currency Utilities

export const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CHERO: '₵',
  BTC: '₿',
  ETH: 'Ξ',
  USDT: '₮',
};

export const currencyFlags: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  CHERO: '🏛️',
  BTC: '₿',
  ETH: 'Ξ',
  USDT: '₮',
};

export const currencyNames: Record<string, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  CHERO: 'Cherokee Coin',
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  USDT: 'Tether',
};

export const currencyDecimals: Record<string, number> = {
  USD: 2,
  EUR: 2,
  GBP: 2,
  CHERO: 2,
  BTC: 8,
  ETH: 6,
  USDT: 2,
};

export const fiatCurrencies = ['USD', 'EUR', 'GBP', 'CHERO'] as const;
export const cryptoCurrencies = ['BTC', 'ETH', 'USDT'] as const;
export const allCurrencies = [...fiatCurrencies, ...cryptoCurrencies] as const;

export function isFiatCurrency(currency: string): boolean {
  return (fiatCurrencies as readonly string[]).includes(currency);
}

export function isCryptoCurrency(currency: string): boolean {
  return (cryptoCurrencies as readonly string[]).includes(currency);
}

export function getCurrencyColor(currency: string): string {
  const colors: Record<string, string> = {
    USD: '#22c55e',
    EUR: '#3b82f6',
    GBP: '#a855f7',
    CHERO: '#f59e0b',
    BTC: '#f7931a',
    ETH: '#627eea',
    USDT: '#26a17b',
  };
  return colors[currency] || '#6b7280';
}
