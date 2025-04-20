"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { icApi } from '../ic-api'; // Import the icApi instance

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  identity: Identity | null;
  principal: Principal | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  authClient: AuthClient | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true); // Start loading until check is complete
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [principal, setPrincipal] = useState<Principal | null>(null);

  const iiUrl = process.env.NEXT_PUBLIC_INTERNET_IDENTITY_URL;

  // Update icApi when identity changes
  useEffect(() => {
    const updateApiIdentity = async () => {
      if (identity) {
        console.log("Updating icApi with authenticated identity");
        await icApi.updateIdentity(identity);
      } else {
        console.log("Updating icApi with anonymous identity");
        await icApi.updateIdentity(null);
      }
    };
    
    updateApiIdentity();
  }, [identity]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("Initializing AuthClient...");
        const client = await AuthClient.create();
        setAuthClient(client);

        console.log("Checking authentication status...");
        const authenticated = await client.isAuthenticated();
        console.log("Is Authenticated:", authenticated);
        setIsAuthenticated(authenticated);

        if (authenticated) {
          const currentIdentity = client.getIdentity();
          console.log("User is authenticated. Identity:", currentIdentity.getPrincipal().toText());
          setIdentity(currentIdentity as any);
          setPrincipal(currentIdentity.getPrincipal() as any);
        } else {
           console.log("User is not authenticated.");
           setIdentity(null);
           setPrincipal(null);
        }
      } catch (error) {
        console.error("Failed to initialize AuthClient:", error);
         setIsAuthenticated(false);
         setIdentity(null);
         setPrincipal(null);
      } finally {
        setIsAuthLoading(false); // Finished loading
        console.log("Auth loading finished.");
      }
    };

    initAuth();
  }, []); // Run only once on mount

  const login = async () => {
    if (!authClient || !iiUrl) {
        console.error("AuthClient not initialized or II URL missing");
        return;
    }
    setIsAuthLoading(true);
    console.log("Attempting login with II:", iiUrl);
    try {
        await authClient.login({
            identityProvider: iiUrl,
            onSuccess: async () => {
                console.log("Login successful!");
                const currentIdentity = authClient.getIdentity();
                const currentPrincipal = currentIdentity.getPrincipal();
                setIsAuthenticated(true);
                setIdentity(currentIdentity as any);
                setPrincipal(currentPrincipal as any);
                console.log("Logged in Principal:", currentPrincipal.toText());
            },
            onError: (error) => {
                console.error("Login failed:", error);
                setIsAuthenticated(false);
                setIdentity(null);
                setPrincipal(null);
            },
        });
    } catch (error) {
      console.error("Error during login process:", error);
      setIsAuthenticated(false);
      setIdentity(null);
      setPrincipal(null);
    } finally {
        setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    if (!authClient) return;
    setIsAuthLoading(true);
    console.log("Attempting logout...");
    try {
        await authClient.logout();
        setIsAuthenticated(false);
        setIdentity(null);
        setPrincipal(null);
        console.log("Logout successful.");
    } catch (error) {
        console.error("Logout failed:", error);
    } finally {
        setIsAuthLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAuthLoading, identity, principal, login, logout, authClient }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 