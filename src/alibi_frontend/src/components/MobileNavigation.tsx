"use client"

import { Link } from "react-router-dom"
import { Home, QrCode, Ticket, User } from "lucide-react"

export function MobileNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="grid grid-cols-4 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/40">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center ${
            window.location.pathname === "/" ? "text-cyan-400" : "text-muted-foreground"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link
          to="/tickets"
          className={`flex flex-col items-center justify-center ${
            window.location.pathname === "/tickets" ? "text-cyan-400" : "text-muted-foreground"
          }`}
        >
          <Ticket className="h-5 w-5" />
          <span className="text-xs mt-1">Tickets</span>
        </Link>
        <Link
          to="/scan"
          className={`flex flex-col items-center justify-center ${
            window.location.pathname === "/scan" ? "text-cyan-400" : "text-muted-foreground"
          }`}
        >
          <QrCode className="h-5 w-5" />
          <span className="text-xs mt-1">Scan</span>
        </Link>
        <Link
          to="/organizer"
          className={`flex flex-col items-center justify-center ${
            (window.location.pathname || "").startsWith("/organizer") ? "text-cyan-400" : "text-muted-foreground"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  )
}
