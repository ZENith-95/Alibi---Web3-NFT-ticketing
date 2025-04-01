import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth/auth-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "Alibi - NFT Ticketing Platform",
  description: "AI-generated NFT ticketing platform for events",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add a script to safely detect wallet extensions without modifying window properties */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Create a non-enumerable property to store wallet detection results
                  if (!window.hasOwnProperty('_walletDetection')) {
                    Object.defineProperty(window, '_walletDetection', {
                      value: {},
                      writable: true,
                      enumerable: false
                    });
                  }
                  
                  // Check for Internet Computer wallets
                  window._walletDetection.hasIcWallets = !!(
                    window.ic && (window.ic.plug || window.ic.internetIdentity)
                  );
                  
                  // Log detection results for debugging
                  console.log('Wallet detection:', window._walletDetection);
                } catch (e) {
                  console.error("Error during wallet detection:", e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'