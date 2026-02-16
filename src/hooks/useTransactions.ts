'use client';

import { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionFilter, PaginatedTransactions } from '@/src/types/transaction';
import { useAuth } from './useAuth';
import { buildQueryString } from '@/src/utils/helpers';

interface TransactionsState {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

export function useTransactions(initialFilters?: TransactionFilter) {
  const { getToken, isAuthenticated } = useAuth();
  const [filters, setFilters] = useState<TransactionFilter>(initialFilters || { page: 1, limit: 20 });
  const [state, setState] = useState<TransactionsState>({
    transactions: [],
    total: 0,
    page: 1,
    totalPages: 0,
    isLoading: true,
    error: null,
  });

  const fetchTransactions = useCallback(async (currentFilters?: TransactionFilter) => {
    const token = getToken();
    if (!token) return;

    const appliedFilters = currentFilters || filters;

    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const queryString = buildQueryString(appliedFilters as Record<string, string | number | boolean | undefined>);
      const res = await fetch(`/api/transactions/list${queryString}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch transactions');

      const data = await res.json();
      const paginated: PaginatedTransactions = data.data;

      setState({
        transactions: paginated.transactions,
        total: paginated.total,
        page: paginated.page,
        totalPages: paginated.totalPages,
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
  }, [getToken, filters]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
    }
  }, [isAuthenticated, fetchTransactions]);

  const updateFilters = useCallback((newFilters: Partial<TransactionFilter>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    fetchTransactions(updated);
  }, [filters, fetchTransactions]);

  const goToPage = useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);

  const getTransaction = useCallback(async (id: string): Promise<Transaction | null> => {
    const token = getToken();
    if (!token) return null;

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return null;

      const data = await res.json();
      return data.data;
    } catch {
      return null;
    }
  }, [getToken]);

  return {
    ...state,
    filters,
    updateFilters,
    goToPage,
    getTransaction,
    refresh: fetchTransactions,
  };
}