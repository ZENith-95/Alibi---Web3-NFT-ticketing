"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';
import { toast } from 'sonner';

// Create a session timeout tracker
const SESSION_STORAGE_KEY = 'alibi-auth-expiration';
const DEFAULT_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface WalletContextProps {
  isAuthenticated: boolean;
  principal: any;
  authClient: AuthClient | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  identity: any;
  isLoading: boolean;
  getAgent: () => HttpAgent | null;
}

const WalletContext = createContext<WalletContextProps>({
  isAuthenticated: false,
  principal: null,
  authClient: null,
  login: async () => { },
  logout: async () => { },
  refreshSession: async () => { },
  identity: null,
  isLoading: true,
  getAgent: () => null,
});

export function useWallet() {
  return useContext(WalletContext);
}

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [principal, setPrincipal] = useState<any>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [identity, setIdentity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if auth token is valid and not expired
  const checkSession = useCallback(() => {
    const storedExpiration = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (storedExpiration) {
      const expirationTime = parseInt(storedExpiration, 10);
      if (expirationTime < Date.now()) {
        // Token has expired
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        setIsAuthenticated(false);
        setPrincipal(null);
        setIdentity(null);
        return false;
      }
      return true;
    }
    return false;
  }, []);

  // Initialize auth client
  const initAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const client = await AuthClient.create();
      setAuthClient(client);

      // Check authentication status
      const isAuthed = await client.isAuthenticated();

      if (isAuthed && checkSession()) {
        const id = client.getIdentity();
        const userPrincipal = id.getPrincipal();

        setIdentity(id as any);
        setPrincipal(userPrincipal);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error initializing auth client:', error);
      toast.error('Failed to initialize authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [checkSession]);

  // Handle login
  const login = useCallback(async () => {
    if (!authClient) return;

    try {
      // Set expiration date (e.g., 1 day from now)
      const expirationTime = Date.now() + DEFAULT_EXPIRATION_MS;

      await authClient.login({
        identityProvider: process.env.DFX_NETWORK === 'ic'
          ? 'https://identity.ic0.app'
          : import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY_HOST,
        onSuccess: async () => {
          const id = authClient.getIdentity();
          const userPrincipal = id.getPrincipal();

          // Update auth state
          setIdentity(id as any);
          setPrincipal(userPrincipal);
          setIsAuthenticated(true);

          // Store session expiration
          sessionStorage.setItem(SESSION_STORAGE_KEY, expirationTime.toString());

          toast.success('Successfully logged in!');
        },
        onError: (error) => {
          console.error('Login error:', error);
          toast.error('Failed to login. Please try again.');
        },
      });
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Authentication failed. Please try again.');
    }
  }, [authClient]);

  // Handle logout
  const logout = useCallback(async () => {
    if (!authClient) return;

    try {
      await authClient.logout();

      // Clear auth state
      setIsAuthenticated(false);
      setPrincipal(null);
      setIdentity(null);

      // Clear session storage
      sessionStorage.removeItem(SESSION_STORAGE_KEY);

      toast.info('You have been logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    }
  }, [authClient]);

  // Refresh user session
  const refreshSession = useCallback(async () => {
    if (!authClient || !isAuthenticated) return;

    try {
      // Set new expiration date
      const expirationTime = Date.now() + DEFAULT_EXPIRATION_MS;
      sessionStorage.setItem(SESSION_STORAGE_KEY, expirationTime.toString());

      // Re-validate identity
      const id = authClient.getIdentity();
      const userPrincipal = id.getPrincipal();

      setIdentity(id as any);
      setPrincipal(userPrincipal);

      toast.success('Session refreshed successfully');
    } catch (error) {
      console.error('Session refresh error:', error);
      toast.error('Failed to refresh session');
    }
  }, [authClient, isAuthenticated]);

  // Auto-refresh session if it's about to expire
  useEffect(() => {
    if (isAuthenticated) {
      const storedExpiration = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (storedExpiration) {
        const expirationTime = parseInt(storedExpiration, 10);
        const timeUntilExpiration = expirationTime - Date.now();

        // If session expires in less than 1 hour, refresh it
        if (timeUntilExpiration > 0 && timeUntilExpiration < 60 * 60 * 1000) {
          refreshSession();
        }

        // Set up timer to check session periodically
        const intervalId = setInterval(checkSession, 5 * 60 * 1000); // Check every 5 minutes
        return () => clearInterval(intervalId);
      }
    }
  }, [isAuthenticated, checkSession, refreshSession]);

  // Initialize auth on component mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Function to get a new agent instance with the current identity
  const getAgent = useCallback(() => {
    if (identity) {
      return new HttpAgent({ identity });
    }
    return null;
  }, [identity]);

  const value = {
    isAuthenticated,
    principal,
    authClient,
    login,
    logout,
    refreshSession,
    identity,
    isLoading,
    getAgent,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
