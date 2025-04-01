import { useAuth as useAuthProvider } from '@/lib/auth/auth-provider';

export function useAuth() {
  const auth = useAuthProvider();
  
  return {
    isAuthenticated: auth.isAuthenticated,
    principal: auth.principal,
    login: auth.login,
    logout: auth.logout,
  };
} 