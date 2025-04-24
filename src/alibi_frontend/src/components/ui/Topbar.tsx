import { NavLink } from "react-router-dom"
import { NavItemProp } from "../../types"
import React from "react"

export default function Topbar() {
    const links: NavItemProp[] = [
        {
            href: "/",
            name: "Home"
        },
        {
            href: "/tickets",
            name: "Ticket"
        },
        {
            href: "/events",
            name: "Events"
        },
        {
            href: "/profile",
            name: "Profile"
        }
    ]
    return <header className="sticky top-0 w-full border-b border-border/40 bg-background/95 backdrop-blur  bg-black text-white">
        <div className="container flex h-14 max-w-screen-2xl items-center">
            <div className="mr-4 hidden md:flex">
                <NavLink to="/" className="mr-6 flex items-center space-x-2">
                    <span className="hidden font-bold sm:inline-block">Alibi</span>
                </NavLink>
                <nav className="flex items-center gap-6 ">
                    {links.map(({ name, href }) => (
                        <NavLink
                            to={href}
                            key={name}
                            className={({ isActive }) =>
                                `link ${isActive ? "active_link" : ""}`
                            }
                        >
                            {name}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </div>
    </header>
}

