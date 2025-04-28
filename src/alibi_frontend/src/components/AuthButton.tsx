"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { LogIn, LogOut, Loader2, User, Lock, Shield } from "lucide-react";
import { AuthClient } from "@dfinity/auth-client";
import { icApi } from "../lib/ic-api";
import { useWallet } from './WalletProvider';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';

export function AuthButton() {
  const { isAuthenticated, principal, login, logout, refreshSession, isLoading } = useWallet();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Format principal for display
  const formattedPrincipal = principal ? 
    `${principal.toString().substring(0, 5)}...${principal.toString().slice(-4)}` : 
    null;

  const handleLogin = async () => {
    try {
      setIsAuthenticating(true);
      await login();
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Failed to authenticate. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to log out. Please try again.');
    }
  };

  const handleRefreshSession = async () => {
    try {
      await refreshSession();
    } catch (error) {
      console.error('Session refresh failed:', error);
      toast.error('Failed to refresh session. Please try again.');
    }
  };

  // Show loading indicator
  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  // When not authenticated, show login button
  if (!isAuthenticated) {
    return (
      <Button onClick={handleLogin} disabled={isAuthenticating}>
        {isAuthenticating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Connect
          </>
        )}
      </Button>
    );
  }

  // When authenticated, show dropdown with user info and actions
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span>{formattedPrincipal}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          className="cursor-pointer text-xs overflow-hidden text-ellipsis"
          onClick={() => {
            navigator.clipboard.writeText(principal.toString());
            toast.success('Principal ID copied to clipboard');
          }}
        >
          <User className="mr-2 h-4 w-4" />
          <span className="flex-1 truncate">{principal.toString()}</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          className="cursor-pointer text-blue-600 dark:text-blue-400"
          onClick={handleRefreshSession}
        >
          <Shield className="mr-2 h-4 w-4" />
          <span>Refresh Session</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          className="cursor-pointer text-red-600 dark:text-red-400"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
