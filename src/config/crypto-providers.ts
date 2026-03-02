// Cherokee Bank - Crypto Provider Configuration
export const cryptoProviders = {
  // CoinGecko API (free tier)
  priceApi: {
    baseUrl: 'https://api.coingecko.com/api/v3',
    endpoints: {
      prices: '/simple/price',
      markets: '/coins/markets',
      history: '/coins/{id}/market_chart',
    },
  },
  
  // Supported cryptocurrencies
  supportedCoins: {
    BTC: { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', decimals: 8 },
    ETH: { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    USDT: { id: 'tether', name: 'Tether', symbol: 'USDT', decimals: 6 },
  } as const,
  
  // Fee configuration
  fees: {
    buyFeePercent: 1.5,   // 1.5% fee on crypto purchases
    sellFeePercent: 1.5,  // 1.5% fee on crypto sales
    withdrawalFee: {
      BTC: 0.0001,
      ETH: 0.005,
      USDT: 1.0,
    },
    minBuy: {
      BTC: 0.0001,
      ETH: 0.001,
      USDT: 10,
    },
  },
};
