'use client';

import { useState, useEffect, useCallback } from 'react';
import { CryptoPrice, CryptoPortfolio } from '@/src/types/crypto';
import { CryptoCurrency, CryptoWallet } from '@/src/types/wallet';
import { useAuth } from './useAuth';

interface CryptoState {
  wallets: CryptoWallet[];
  prices: CryptoPrice[];
  portfolio: CryptoPortfolio | null;
  isLoading: boolean;
  error: string | null;
}

export function useCrypto() {
  const { getToken, isAuthenticated } = useAuth();
  const [state, setState] = useState<CryptoState>({
    wallets: [],
    prices: [],
    portfolio: null,
    isLoading: true,
    error: null,
  });

  const fetchCryptoData = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const [walletsRes, pricesRes] = await Promise.all([
        fetch('/api/crypto/wallets', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/crypto/rate', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!walletsRes.ok || !pricesRes.ok) throw new Error('Failed to fetch crypto data');

      const walletsData = await walletsRes.json();
      const pricesData = await pricesRes.json();

      const wallets: CryptoWallet[] = walletsData.data;
      const prices: CryptoPrice[] = pricesData.data;

      // Calculate portfolio
      let totalValueUSD = 0;
      const walletsWithValue = wallets.map((wallet) => {
        const price = prices.find((p) => p.symbol === wallet.currency);
        const valueUSD = price ? wallet.balance * price.priceUSD : 0;
        totalValueUSD += valueUSD;
        return { ...wallet, valueUSD, price: price! };
      });

      setState({
        wallets,
        prices,
        portfolio: { totalValueUSD, wallets: walletsWithValue, prices },
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: (err as Error).message,
      }));
    }
  }, [getToken]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCryptoData();
    }
  }, [isAuthenticated, fetchCryptoData]);

  const buyCrypto = useCallback(async (currency: CryptoCurrency, amountUSD: number) => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch('/api/crypto/buy', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ currency, amountUSD }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Purchase failed');

    await fetchCryptoData();
    return data.data;
  }, [getToken, fetchCryptoData]);

  const sellCrypto = useCallback(async (currency: CryptoCurrency, amount: number) => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch('/api/crypto/sell', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ currency, amount }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Sale failed');

    await fetchCryptoData();
    return data.data;
  }, [getToken, fetchCryptoData]);

  return {
    ...state,
    refresh: fetchCryptoData,
    buyCrypto,
    sellCrypto,
  };
}