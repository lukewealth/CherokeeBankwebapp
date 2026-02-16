'use client';

import { useState, useEffect, useCallback } from 'react';
import { Wallet, WalletSummary } from '@/src/types/wallet';
import { useAuth } from './useAuth';

interface WalletState {
  wallets: Wallet[];
  summary: WalletSummary | null;
  isLoading: boolean;
  error: string | null;
}

export function useWallet() {
  const { getToken, isAuthenticated } = useAuth();
  const [state, setState] = useState<WalletState>({
    wallets: [],
    summary: null,
    isLoading: true,
    error: null,
  });

  const fetchWallets = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const res = await fetch('/api/wallets/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch wallets');

      const data = await res.json();
      setState({
        wallets: data.data.wallets,
        summary: data.data.summary || null,
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
      fetchWallets();
    }
  }, [isAuthenticated, fetchWallets]);

  const deposit = useCallback(async (walletId: string, amount: number) => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch('/api/wallets/deposit', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletId, amount }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Deposit failed');

    await fetchWallets();
    return data.data;
  }, [getToken, fetchWallets]);

  const withdraw = useCallback(async (walletId: string, amount: number) => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch('/api/wallets/withdraw', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletId, amount }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Withdrawal failed');

    await fetchWallets();
    return data.data;
  }, [getToken, fetchWallets]);

  const convert = useCallback(async (fromWalletId: string, toWalletId: string, amount: number) => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch('/api/wallets/convert', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromWalletId, toWalletId, amount }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Conversion failed');

    await fetchWallets();
    return data.data;
  }, [getToken, fetchWallets]);

  return {
    ...state,
    refresh: fetchWallets,
    deposit,
    withdraw,
    convert,
  };
}