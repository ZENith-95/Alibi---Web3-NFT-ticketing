import { useState, useEffect, useCallback } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  timestamp: number | null;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Cache object to store fetched data
const cache: Record<string, CacheEntry<any>> = {};

interface UseDataFetchingOptions {
  cacheDuration?: number; // Duration in milliseconds for which cached data is valid
  enabled?: boolean; // Whether to fetch data automatically
  onSuccess?: (data: any) => void; // Callback on successful data fetch
  onError?: (error: Error) => void; // Callback on error
}

const defaultOptions: UseDataFetchingOptions = {
  cacheDuration: 5 * 60 * 1000, // 5 minutes
  enabled: true,
};

export function useDataFetching<T>(
  fetchFn: () => Promise<T>,
  cacheKey: string,
  options: UseDataFetchingOptions = {}
) {
  const { cacheDuration, enabled, onSuccess, onError } = { ...defaultOptions, ...options };
  
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: enabled ? true : false,
    error: null,
    timestamp: null,
  });

  const fetchData = useCallback(async (force = false) => {
    // Skip if not enabled
    if (!enabled && !force) return;
    
    // Check cache if we have valid data
    const cachedData = cache[cacheKey];
    const now = Date.now();
    
    if (!force && cachedData && cacheDuration && now - cachedData.timestamp < cacheDuration) {
      // Use cached data if it's still valid
      setState({
        data: cachedData.data,
        loading: false,
        error: null,
        timestamp: cachedData.timestamp,
      });
      onSuccess?.(cachedData.data);
      return;
    }
    
    // Fetch fresh data
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await fetchFn();
      
      // Cache the result
      cache[cacheKey] = {
        data,
        timestamp: Date.now(),
      };
      
      setState({
        data,
        loading: false,
        error: null,
        timestamp: Date.now(),
      });
      
      onSuccess?.(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
        timestamp: null,
      });
      
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  }, [fetchFn, cacheKey, cacheDuration, enabled, onSuccess, onError]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
    
    // Cleanup function
    return () => {
      // Clean up any resources if needed
    };
  }, [enabled, fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);
  
  const clearCache = useCallback(() => {
    delete cache[cacheKey];
  }, [cacheKey]);

  return {
    ...state,
    refetch,
    clearCache,
  };
} 