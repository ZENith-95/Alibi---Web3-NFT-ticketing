import Link from "next/link"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Home, Ticket, Calendar, User } from "lucide-react"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">Alibi</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
              <span className="hidden md:inline-block">Home</span>
              <Home className="h-4 w-4 md:hidden" />
            </Link>
            <Link href="/events" className="transition-colors hover:text-foreground/80 text-foreground/60">
              <span className="hidden md:inline-block">Events</span>
              <Calendar className="h-4 w-4 md:hidden" />
            </Link>
            <Link href="/tickets" className="transition-colors hover:text-foreground/80 text-foreground/60">
              <span className="hidden md:inline-block">Tickets</span>
              <Ticket className="h-4 w-4 md:hidden" />
            </Link>
            <Link href="/profile" className="transition-colors hover:text-foreground/80 text-foreground/60">
              <span className="hidden md:inline-block">Profile</span>
              <User className="h-4 w-4 md:hidden" />
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button asChild variant="outline" className="hidden md:flex">
              <Link href="/organizer/create">Create Event</Link>
            </Button>
          </div>
          <nav className="flex items-center">
            <ConnectWalletButton />
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}

