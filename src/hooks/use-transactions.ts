'use client';

import { useState, useCallback } from 'react';

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  description?: string;
  createdAt: string;
  reference: string;
}

interface PaginatedResult {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}

export function useTransactions() {
  const [data, setData] = useState<PaginatedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    walletId?: string;
  }) => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.type) searchParams.set('type', params.type);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.walletId) searchParams.set('walletId', params.walletId);

      const res = await fetch(`/api/transactions?${searchParams.toString()}`, { credentials: 'include' });
      const json = await res.json();

      if (res.ok) {
        setData(json.data);
        setError(null);
      } else {
        setError(json.error?.message || 'Failed to fetch transactions');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchTransactions };
}
