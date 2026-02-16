'use client';

import { useApi, useMutation } from './use-api';
import { useState, useCallback } from 'react';

interface Wallet {
  id: string;
  currency: string;
  balance: number;
  available: number;
  reserved: number;
  lastUpdated: string;
}

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'exchange' | 'stake';
  amount: number;
  currency: string;
  recipient: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  description: string;
}

interface DashboardStats {
  totalBalance: number;
  walletCount: number;
  transactionCount: number;
  kycStatus: string;
}

export function useDashboard() {
  return useApi<DashboardStats>('/api/dashboard/stats');
}

export function useWallets() {
  return useApi<Wallet[]>('/api/wallets');
}

export function useWallet(id: string) {
  return useApi<Wallet>(`/api/wallets/${id}`);
}

export function useTransactions(limit = 10, offset = 0) {
  return useApi<Transaction[]>(`/api/transactions?limit=${limit}&offset=${offset}`);
}

export function useCreateTransaction() {
  return useMutation(async (data: {
    recipient: string;
    amount: number;
    currency: string;
  }) => {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create transaction');
    const json = await response.json();
    return json.data;
  });
}

export function useExchangeRate() {
  return useApi<any>('/api/crypto/rate');
}

export function useCryptoWallets() {
  return useApi<Wallet[]>('/api/crypto/wallets');
}

export function useUserProfile() {
  return useApi<any>('/api/user/profile');
}

export function useUpdateProfile() {
  return useMutation(async (data: any) => {
    const response = await fetch('/api/user/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    const json = await response.json();
    return json.data;
  });
}

export function useKYCStatus() {
  return useApi<{ status: string; documents: any[] }>('/api/kyc/status');
}

export function useTransactionStats(period: 'week' | 'month' | 'year' = 'month') {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await globalThis.fetch(`/api/transactions/stats?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const json = await response.json();
      setStats(json.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [period]);

  return { stats, loading, error, fetch: fetchStats };
}

export function useSecuritySettings() {
  return useApi<any>('/api/user/security');
}

export function useUpdateSecuritySettings() {
  return useMutation(async (data: any) => {
    const response = await fetch('/api/user/security/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update security settings');
    const json = await response.json();
    return json.data;
  });
}

// ── Virtual Cards ──

export function useVirtualCards() {
  return useApi<{ cards: any[]; total: number }>('/api/cards');
}

export function useCreateCard() {
  return useMutation(async (data: {
    cardName: string;
    currency: string;
    spendingLimit: number;
    cardUsage: string;
    cardType?: string;
    merchantLimits?: any;
  }) => {
    const response = await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Failed to create card');
    }
    const json = await response.json();
    return json.data;
  });
}

export function useToggleFreezeCard() {
  return useMutation(async ({ id, frozen }: { id: string; frozen: boolean }) => {
    const response = await fetch(`/api/cards/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: frozen ? 'freeze' : 'unfreeze' }),
    });
    if (!response.ok) throw new Error('Failed to update card');
    const json = await response.json();
    return json.data;
  });
}

export function useCancelCard() {
  return useMutation(async (id: string) => {
    const response = await fetch(`/api/cards/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to cancel card');
    const json = await response.json();
    return json.data;
  });
}
