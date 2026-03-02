'use client';

import { useState, useEffect, useCallback } from 'react';

interface CryptoWallet {
  id: string;
  currency: string;
  balance: number;
  address: string;
}

interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
}

export function useCrypto() {
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [walletsRes, pricesRes] = await Promise.all([
        fetch('/api/crypto/wallets', { credentials: 'include' }),
        fetch('/api/crypto/prices'),
      ]);

      const walletsData = await walletsRes.json();
      const pricesData = await pricesRes.json();

      if (walletsRes.ok) setWallets(walletsData.data || []);
      if (pricesRes.ok) setPrices(pricesData.data || []);
      setError(null);
    } catch {
      setError('Failed to fetch crypto data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { wallets, prices, loading, error, refetch: fetchData };
}
