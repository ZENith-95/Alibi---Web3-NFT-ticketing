
import { Home, QrCode, Ticket, User } from "lucide-react"
import { NavLink } from "react-router-dom"

export function MobileNavigation() {


  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="grid grid-cols-4 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/40">
        <NavLink
          to="/"
          className={({ isActive }) => `flex flex-col items-center justify-center ${isActive ? "text-cyan-400" : "text-muted-foreground"
            }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </NavLink>
        <NavLink
          to="/tickets"
          className={({ isActive }) => `flex flex-col items-center justify-center ${isActive ? "text-cyan-400" : "text-muted-foreground"
            }`}
        >
          <Ticket className="h-5 w-5" />
          <span className="text-xs mt-1">Tickets</span>
        </NavLink>
        <NavLink
          to="/scan"
          className={({ isActive }) => `flex flex-col items-center justify-center ${isActive ? "text-cyan-400" : "text-muted-foreground"}`}
        >
          <QrCode className="h-5 w-5" />
          <span className="text-xs mt-1">Scan</span>
        </NavLink>
        <NavLink
          to="/organizer"
          className={({ isActive, }) => `flex flex-col items-center justify-center ${isActive ? "text-cyan-400" : "text-muted-foreground"
            }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </NavLink>
      </div>
    </div>
  )
}

