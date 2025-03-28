"use client"

import { useState, useEffect } from "react"
import { TicketCard } from "./ticket-card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import { Skeleton } from "./ui/skeleton"
import { useWallet } from "./wallet-provider"
import { mockTickets } from "../lib/mock-data"
import { Button } from "./ui/button"
import { Ticket } from "lucide-react"
import Link from "next/link"

export function TicketGallery() {
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isConnected } = useWallet()

  useEffect(() => {
    // Simulate API call to fetch tickets
    const fetchTickets = async () => {
      setIsLoading(true)
      // In a real implementation, we would fetch from the canister
      // For now, we'll just use mock data with a delay to simulate loading
      setTimeout(() => {
        setTickets(isConnected ? mockTickets : [])
        setIsLoading(false)
      }, 1500)
    }

    fetchTickets()
  }, [isConnected])

  const upcomingTickets = tickets.filter((ticket) => new Date(ticket.eventDate) >= new Date())
  const pastTickets = tickets.filter((ticket) => new Date(ticket.eventDate) < new Date())

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-secondary/50 rounded-full p-6 mb-6">
          <Ticket className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Connect your wallet to view your NFT tickets and manage your event RSVPs.
        </p>
        <Button asChild>
          <Link href="/">Browse Events</Link>
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div>
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-border">
                  <Skeleton className="h-64 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
          </div>
        </Tabs>
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-secondary/50 rounded-full p-6 mb-6">
          <Ticket className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Tickets Found</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          You haven't RSVP'd to any events yet. Browse upcoming events and get your first NFT ticket.
        </p>
        <Button asChild>
          <Link href="/">Browse Events</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <Tabs defaultValue="upcoming">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming ({upcomingTickets.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastTickets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingTickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No Upcoming Events</h3>
              <p className="text-muted-foreground mb-6">You don't have tickets for any upcoming events.</p>
              <Button asChild>
                <Link href="/">Browse Events</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastTickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No Past Events</h3>
              <p className="text-muted-foreground">You haven't attended any events yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

