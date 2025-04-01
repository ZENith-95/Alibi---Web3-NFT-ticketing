"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, Users, Edit, BarChart } from "lucide-react"
import type { Event } from "@/lib/ic-api"

interface EventListProps {
  events: Event[]
}

export function EventList({ events }: EventListProps) {
  const [sortBy, setSortBy] = useState<"date" | "name" | "tickets">("date")

  // Sort events based on the selected criteria
  const sortedEvents = [...events].sort((a, b) => {
    if (sortBy === "date") {
      // Sort by date (newest first)
      return Number(b.createdAt) - Number(a.createdAt)
    } else if (sortBy === "name") {
      // Sort by name (alphabetically)
      return a.name.localeCompare(b.name)
    } else {
      // Sort by tickets sold (highest first)
      return Number(b.ticketsSold) - Number(a.ticketsSold)
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button variant={sortBy === "date" ? "default" : "outline"} size="sm" onClick={() => setSortBy("date")}>
          <Calendar className="mr-2 h-4 w-4" />
          Sort by Date
        </Button>
        <Button variant={sortBy === "name" ? "default" : "outline"} size="sm" onClick={() => setSortBy("name")}>
          <Edit className="mr-2 h-4 w-4" />
          Sort by Name
        </Button>
        <Button variant={sortBy === "tickets" ? "default" : "outline"} size="sm" onClick={() => setSortBy("tickets")}>
          <Users className="mr-2 h-4 w-4" />
          Sort by Tickets Sold
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedEvents.map((event) => (
          <Card key={event.id.toString()} className="overflow-hidden">
            <div className="aspect-video w-full bg-muted relative">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl || "/placeholder.svg"}
                  alt={event.name}
                  className="object-cover w-full h-full"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-muted">
                  <span className="text-muted-foreground">No image available</span>
                </div>
              )}
              <Badge className="absolute top-2 right-2" variant={event.isActive ? "default" : "secondary"}>
                {event.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <CardHeader>
              <CardTitle>{event.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {event.ticketsSold.toString()} / {event.totalCapacity.toString()} tickets sold
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button asChild variant="outline" size="sm">
                <Link href={`/organizer/events/${event.id.toString()}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href={`/organizer/events/${event.id.toString()}/dashboard`}>
                  <BarChart className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

