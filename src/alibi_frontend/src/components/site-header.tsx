"use client"

import { Link } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { Button } from "./ui/button"
import { Ticket } from "lucide-react"
import { AuthButton } from "./auth-button"

export function SiteHeader() {
  const { pathname } = useLocation()
  const isOrganizer = pathname?.startsWith("/organizer") || false

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <Ticket className="h-6 w-6 text-cyan-400" />
            <span className="text-xl font-bold text-gradient">Alibi</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-cyan-400 ${
                pathname === "/" ? "text-cyan-400" : "text-muted-foreground"
              }`}
            >
              Discover
            </Link>
            <Link
              to="/tickets"
              className={`text-sm font-medium transition-colors hover:text-cyan-400 ${
                pathname === "/tickets" ? "text-cyan-400" : "text-muted-foreground"
              }`}
            >
              My Tickets
            </Link>
            {isOrganizer ? (
              <Link
                to="/organizer"
                className={`text-sm font-medium transition-colors hover:text-cyan-400 ${
                  pathname === "/organizer" ? "text-cyan-400" : "text-muted-foreground"
                }`}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/organizer"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-cyan-400"
              >
                For Organizers
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <AuthButton />
          {isOrganizer && (
            <Button asChild variant="default" className="hidden md:inline-flex">
              <Link to="/organizer/create">Create Event</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
