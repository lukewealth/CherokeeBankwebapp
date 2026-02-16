'use client';

import { useState, useEffect, useCallback } from 'react';

interface DashboardStats {
  totalBalance: number;
  walletCount: number;
  transactionCount: number;
  kycStatus: string;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      // const res = await fetch('/api/dashboard/stats', { credentials: 'include' });
      // const data = await res.json();
      // if (res.ok) {
      //   setStats(data.data);
      //   setError(null);
      // } else {
      //   setError(data.error?.message || 'Failed to fetch stats');
      // }
      // Mock data for now
      setStats({
        totalBalance: 12345.67,
        walletCount: 3,
        transactionCount: 42,
        kycStatus: 'VERIFIED',
      });
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
