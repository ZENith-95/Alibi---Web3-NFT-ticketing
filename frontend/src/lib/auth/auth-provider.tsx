"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Identity } from "@dfinity/agent"
import { AuthClient } from "@dfinity/auth-client"
import type { Principal } from "@dfinity/principal"
import { Ed25519KeyIdentity } from "@dfinity/identity"
import { icApi } from "@/lib/ic-api"
import { safeString } from "@/lib/utils/string-utils"
import { toast } from "@/components/ui/use-toast"

interface AuthContextType {
  isAuthenticated: boolean
  principal: Principal | null
  identity: Identity | null
  login: (authType: "ii" | "plug") => Promise<boolean>
  logout: () => Promise<void>
  isAuthenticating: boolean
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  principal: null,
  identity: null,
  login: async () => false,
  logout: async () => {},
  isAuthenticating: false,
})

// Safely check if a wallet is available
const hasIcWallet = (walletType: string): boolean => {
  try {
    if (typeof window === "undefined") return false

    // Check our custom detection property first
    if (window._walletDetection && window._walletDetection.hasIcWallets) {
      return true
    }

    // Fallback to direct check
    if (window.ic) {
      if (walletType === "plug" && window.ic.plug) return true
      if (walletType === "ii" && window.ic.internetIdentity) return true
    }

    return false
  } catch (e) {
    console.error("Error checking for wallet:", e)
    return false
  }
}

// Safely access the plug wallet
const getPlugWallet = () => {
  try {
    if (typeof window === "undefined") return null
    if (window.ic && window.ic.plug) return window.ic.plug
    return null
  } catch (e) {
    console.error("Error accessing plug wallet:", e)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [principal, setPrincipal] = useState<Principal | null>(null)
  const [identity, setIdentity] = useState<Identity | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authClient, setAuthClient] = useState<AuthClient | null>(null)

  // Initialize auth client
  useEffect(() => {
    const init = async () => {
      try {
        const client = await AuthClient.create()
        setAuthClient(client)

        // Check if already authenticated
        if (await client.isAuthenticated()) {
          const identity = client.getIdentity()
          const principal = identity.getPrincipal()

          setIdentity(identity as any)
          setPrincipal(principal as any)
          setIsAuthenticated(true)

          // Set identity in the API with type assertion
          await icApi.setIdentity(identity as any)
        }
      } catch (error) {
        console.error("Error initializing auth client:", error)
      }
    }

    init()
  }, [])

  // Login function
  const login = async (authType: "ii" | "plug"): Promise<boolean> => {
    setIsAuthenticating(true)
    try {
      if (authType === "ii") {
        // Internet Identity authentication
        if (!authClient) {
          throw new Error("Auth client not initialized")
        }

        return new Promise<boolean>((resolve) => {
          const identityProvider = safeString(
            process.env.NEXT_PUBLIC_INTERNET_IDENTITY_URL || "https://identity.ic0.app"
          )

          authClient.login({
            identityProvider,
            onSuccess: async () => {
              const identity = authClient.getIdentity()
              const principal = identity.getPrincipal()

              setIdentity(identity as any)
              setPrincipal(principal as any)
              setIsAuthenticated(true)

              // Set identity in the API with type assertion
              await icApi.setIdentity(identity as any)

              resolve(true)
            },
            onError: (error) => {
              console.error("Authentication error:", error)
              resolve(false)
            },
          })
        })
      } else if (authType === "plug") {
        // Plug wallet authentication
        if (!hasIcWallet("plug")) {
          console.error("Plug wallet extension not detected. Please install the Plug wallet extension from https://plugwallet.ooo/")
          toast({
            title: "Plug Wallet Not Found",
            description: "Please install the Plug wallet extension from https://plugwallet.ooo/",
            variant: "destructive",
          })
          return false
        }

        try {
          const plugWallet = getPlugWallet()
          if (!plugWallet) {
            throw new Error("Plug wallet not available")
          }

          // Request connection
          const connected = await plugWallet.requestConnect({
            whitelist: [],
            host: safeString(process.env.NEXT_PUBLIC_IC_HOST || "http://localhost:4943"),
          })

          if (!connected) {
            throw new Error("Failed to connect to Plug wallet")
          }

          // Get the principal
          const principal = await plugWallet.getPrincipal()
          if (!principal) {
            throw new Error("Failed to get principal from Plug wallet")
          }

          // Create an identity from the Plug wallet
          const identity = await plugWallet.createAgent({
            whitelist: [],
            host: safeString(process.env.NEXT_PUBLIC_IC_HOST || "http://localhost:4943"),
          })

          setIdentity(identity)
          setPrincipal(principal)
          setIsAuthenticated(true)

          // Set identity in the API
          await icApi.setIdentity(identity)

          return true
        } catch (error) {
          console.error("Plug wallet connection error:", error)
          toast({
            title: "Connection Failed",
            description: "Failed to connect to Plug wallet. Please make sure the extension is installed and unlocked.",
            variant: "destructive",
          })
          return false
        }
      }
      return false
    } finally {
      setIsAuthenticating(false)
    }
  }

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      if (authClient) {
        await authClient.logout()
      }

      // Reset state
      setIsAuthenticated(false)
      setPrincipal(null)
      setIdentity(null)

      // Clear local storage
      localStorage.removeItem("identity")
      localStorage.removeItem("walletType")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        principal,
        identity,
        login,
        logout,
        isAuthenticating,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

