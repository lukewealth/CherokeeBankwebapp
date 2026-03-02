'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/src/types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const getToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('cherokee_access_token');
  }, []);

  const setTokens = useCallback((accessToken: string, refreshToken: string) => {
    localStorage.setItem('cherokee_access_token', accessToken);
    localStorage.setItem('cherokee_refresh_token', refreshToken);
  }, []);

  const clearTokens = useCallback(() => {
    localStorage.removeItem('cherokee_access_token');
    localStorage.removeItem('cherokee_refresh_token');
  }, []);

  const fetchUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
      return;
    }

    try {
      const res = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          // Try refresh
          const refreshToken = localStorage.getItem('cherokee_refresh_token');
          if (refreshToken) {
            const refreshRes = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              setTokens(refreshData.data.accessToken, refreshData.data.refreshToken);
              // Retry fetch
              const retryRes = await fetch('/api/user/profile', {
                headers: { Authorization: `Bearer ${refreshData.data.accessToken}` },
              });
              if (retryRes.ok) {
                const retryData = await retryRes.json();
                setState({ user: retryData.data, isAuthenticated: true, isLoading: false, error: null });
                return;
              }
            }
          }
          clearTokens();
          setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
          return;
        }
        throw new Error('Failed to fetch user');
      }

      const data = await res.json();
      setState({ user: data.data, isAuthenticated: true, isLoading: false, error: null });
    } catch (err) {
      setState({ user: null, isAuthenticated: false, isLoading: false, error: (err as Error).message });
    }
  }, [getToken, setTokens, clearTokens]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setTokens(data.data.accessToken, data.data.refreshToken);
      setState({ user: data.data.user, isAuthenticated: true, isLoading: false, error: null });
      return data.data;
    } catch (err) {
      setState((prev) => ({ ...prev, isLoading: false, error: (err as Error).message }));
      throw err;
    }
  }, [setTokens]);

  const register = useCallback(async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      return data.data;
    } catch (err) {
      setState((prev) => ({ ...prev, isLoading: false, error: (err as Error).message }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    const token = getToken();
    const refreshToken = localStorage.getItem('cherokee_refresh_token');

    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch {
      // Logout anyway
    }

    clearTokens();
    setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
  }, [getToken, clearTokens]);

  return {
    ...state,
    login,
    register,
    logout,
    refreshUser: fetchUser,
    getToken,
  };
}