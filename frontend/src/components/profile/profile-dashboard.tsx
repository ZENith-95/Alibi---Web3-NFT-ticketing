"use client"

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Ticket, Calendar, QrCode, Wallet } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-provider"
import { icApi, type Event, type Ticket as TicketType } from "@/lib/ic-api"
import { EventList } from "@/components/organizer/event-list"
import { TicketGallery } from "@/components/ticket-gallery"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

export function ProfileDashboard() {
  const { isAuthenticated, principal } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [stats, setStats] = useState({
    eventsCreated: 0,
    ticketsOwned: 0,
    eventsAttended: 0,
  })
  const [error, setError] = useState<string | null>(null)

  // Function to fetch user data
  const fetchUserData = useCallback(async () => {
    if (!isAuthenticated || !principal) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch events and tickets in parallel
      const [fetchedEvents, fetchedTickets] = await Promise.all([
        icApi.getOrganizerEvents(principal),
        icApi.getUserTickets(principal),
      ])

      setEvents(fetchedEvents)
      setTickets(fetchedTickets)

      // Calculate stats
      setStats({
        eventsCreated: fetchedEvents.length,
        ticketsOwned: fetchedTickets.length,
        eventsAttended: fetchedTickets.filter((ticket) => ticket.isUsed).length,
      })
    } catch (error) {
      console.error("Error fetching user data:", error)
      setError("Failed to load your profile data. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load your profile data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, principal])

  // Initial data fetch
  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  // Set up event listeners for real-time updates
  useEffect(() => {
    // Add event listeners for real-time updates
    const handleEventCreated = () => {
      fetchUserData()
    }

    const handleTicketMinted = () => {
      fetchUserData()
    }

    // Register event listeners
    icApi.addEventListener("event-created", handleEventCreated)
    icApi.addEventListener("ticket-minted", handleTicketMinted)
    icApi.addEventListener("ticket-used", handleEventCreated)

    // Clean up event listeners on unmount
    return () => {
      icApi.removeEventListener("event-created", handleEventCreated)
      icApi.removeEventListener("ticket-minted", handleTicketMinted)
      icApi.removeEventListener("ticket-used", handleEventCreated)
    }
  }, [fetchUserData])

  if (!isAuthenticated) {
    return (
      <Card className="border-border">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground max-w-md mb-6">Connect your wallet to view your events and tickets.</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-border">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-destructive mb-4">⚠️</div>
          <h3 className="text-xl font-medium mb-2">Error Loading Data</h3>
          <p className="text-muted-foreground max-w-md mb-6">{error}</p>
          <Button onClick={fetchUserData}>Try Again</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {isLoading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
          </div>
          <Skeleton className="h-12 w-full max-w-xs rounded-lg mb-4" />
          <Skeleton className="h-[400px] rounded-lg" />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Events Created</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">{stats.eventsCreated}</span>
                </div>
                <div className="mt-2">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/organizer/create">Create New Event</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tickets Owned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Ticket className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">{stats.ticketsOwned}</span>
                </div>
                <div className="mt-2">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/">Browse Events</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Events Attended</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <QrCode className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">{stats.eventsAttended}</span>
                </div>
                <div className="mt-2">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/scan">Scan Tickets</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="tickets">
            <TabsList className="mb-6">
              <TabsTrigger value="tickets">My Tickets</TabsTrigger>
              <TabsTrigger value="events">My Events</TabsTrigger>
            </TabsList>

            <TabsContent value="tickets">
              {tickets.length > 0 ? (
                <TicketGallery tickets={tickets} />
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Tickets Found</h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                      You haven't RSVP'd to any events yet. Browse upcoming events and get your first NFT ticket.
                    </p>
                    <Button asChild>
                      <Link href="/">Browse Events</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="events">
              {events.length > 0 ? (
                <EventList events={events} />
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Events Created</h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                      You haven't created any events yet. Create your first event to start selling tickets.
                    </p>
                    <Button asChild>
                      <Link href="/organizer/create">Create Your First Event</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

