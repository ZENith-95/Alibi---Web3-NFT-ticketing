"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { Ticket } from "lucide-react"
import { ConnectWalletButton } from "./connect-wallet-button"

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const isOrganizer = pathname?.startsWith("/organizer") || false

  const handleCreateEvent = (e: React.MouseEvent) => {
    e.preventDefault()
    // Use router.push for client-side navigation
    router.push("/organizer/create")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Ticket className="h-6 w-6 text-cyan-400" />
            <span className="text-xl font-bold text-gradient">Alibi</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-cyan-400 ${
                pathname === "/" ? "text-cyan-400" : "text-muted-foreground"
              }`}
            >
              Discover
            </Link>
            <Link
              href="/tickets"
              className={`text-sm font-medium transition-colors hover:text-cyan-400 ${
                pathname === "/tickets" ? "text-cyan-400" : "text-muted-foreground"
              }`}
            >
              My Tickets
            </Link>
            {isOrganizer ? (
              <Link
                href="/organizer"
                className={`text-sm font-medium transition-colors hover:text-cyan-400 ${
                  pathname === "/organizer" ? "text-cyan-400" : "text-muted-foreground"
                }`}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/organizer"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-cyan-400"
              >
                For Organizers
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ConnectWalletButton />
          {isOrganizer && (
            <Button 
              variant="default" 
              className="hidden md:inline-flex"
              onClick={handleCreateEvent}
            >
              Create Event
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

