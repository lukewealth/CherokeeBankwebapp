'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAsyncOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  skipInitialFetch?: boolean;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true,
  options?: UseAsyncOptions,
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  // Store latest references to avoid stale closures without
  // causing useCallback/useEffect identity changes on every render.
  const asyncFnRef = useRef(asyncFunction);
  const optionsRef = useRef(options);
  const mountedRef = useRef(true);

  useEffect(() => {
    asyncFnRef.current = asyncFunction;
  }, [asyncFunction]);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await asyncFnRef.current();
      if (mountedRef.current) {
        setState({ data: response, loading: false, error: null });
        optionsRef.current?.onSuccess?.();
      }
      return response;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (mountedRef.current) {
        setState({ data: null, loading: false, error: err.message });
        optionsRef.current?.onError?.(err);
      }
      throw err;
    }
  }, []); // stable — never changes identity

  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, immediate]);

  return { ...state, execute };
}

export function useApi<T>(
  url: string,
  options?: UseAsyncOptions & { method?: string; body?: unknown },
) {
  const skipInitial = options?.skipInitialFetch ?? false;
  const method = options?.method || 'GET';
  const body = options?.body;

  // Stable async function that reads latest url/method/body via refs
  const urlRef = useRef(url);
  const methodRef = useRef(method);
  const bodyRef = useRef(body);

  useEffect(() => { urlRef.current = url; }, [url]);
  useEffect(() => { methodRef.current = method; }, [method]);
  useEffect(() => { bodyRef.current = body; }, [body]);

  const fetchFn = useCallback(async () => {
    const response = await fetch(urlRef.current, {
      method: methodRef.current,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: bodyRef.current ? JSON.stringify(bodyRef.current) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const json = await response.json();
    return json.data || json;
  }, []); // stable

  return useAsync<T>(fetchFn, !skipInitial, options);
}

export function useMutation<T, P>(asyncFunction: (params: P) => Promise<T>) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const asyncFnRef = useRef(asyncFunction);
  useEffect(() => {
    asyncFnRef.current = asyncFunction;
  }, [asyncFunction]);

  const mutate = useCallback(
    async (params: P) => {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await asyncFnRef.current(params);
        setState({ data: response, loading: false, error: null });
        return response;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, loading: false, error: err.message });
        throw err;
      }
    },
    [],
  );

  return { ...state, mutate };
}
