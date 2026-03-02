'use client';

import { useState, useEffect, useCallback } from 'react';

interface Wallet {
  id: string;
  currency: string;
  balance: number;
  status: string;
  isDefault: boolean;
}

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/wallets', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setWallets(data.data || []);
        setError(null);
      } else {
        setError(data.error?.message || 'Failed to fetch wallets');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  return { wallets, loading, error, refetch: fetchWallets };
}
