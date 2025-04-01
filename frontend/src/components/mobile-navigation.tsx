"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Ticket, Calendar, User } from "lucide-react"

export function MobileNavigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border md:hidden">
      <div className="grid h-full grid-cols-4">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center ${
            pathname === "/" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link
          href="/events"
          className={`flex flex-col items-center justify-center ${
            pathname && pathname.startsWith("/events") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-xs mt-1">Events</span>
        </Link>
        <Link
          href="/tickets"
          className={`flex flex-col items-center justify-center ${
            pathname && pathname.startsWith("/tickets") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Ticket className="h-5 w-5" />
          <span className="text-xs mt-1">Tickets</span>
        </Link>
        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center ${
            pathname && pathname.startsWith("/profile") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  )
}

