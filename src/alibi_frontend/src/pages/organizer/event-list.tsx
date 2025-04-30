import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import { Calendar, Clock, MapPin, Users, QrCode, MoreHorizontal, Edit, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Link } from "react-router-dom"
import { icApi } from '../../lib/ic-api'; // Import icApi
import { useWallet } from '../../components/WalletProvider'; // Import useWallet
import { Event } from '../../../../declarations/alibi_events/alibi_events.did'; // Import Event type
import { toast } from 'sonner'; // Import sonner toast
import { Loader2 } from 'lucide-react'; // Import Loader2 for loading state


export function EventList() {
  const { principal, isAuthenticated } = useWallet(); // Get principal and auth status
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizerEvents = async () => {
      if (!isAuthenticated || !principal) {
        setLoading(false);
        setEvents([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedEvents = await icApi.getOrganizerEvents(principal);
        setEvents(fetchedEvents);
      } catch (e: any) {
        console.error("Error fetching organizer events:", e);
        setError(`Failed to fetch events: ${e.message || 'Unknown error'}`);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizerEvents();
  }, [isAuthenticated, principal]); // Refetch when auth status or principal changes

  const activeEvents = events.filter((event) => new Date(event.date) >= new Date());
  const pastEvents = events.filter((event) => new Date(event.date) < new Date());

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-xl font-medium mb-2">Authentication Required</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Please log in to view and manage your events.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
       <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
           <Loader2 className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
           <h3 className="text-xl font-medium mb-2">Loading Events...</h3>
        </CardContent>
       </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-red-500">
          <h3 className="text-xl font-medium mb-2">Error Loading Events</h3>
          <p className="text-muted-foreground max-w-md mb-6 text-red-500">
            {error}
          </p>
        </CardContent>
      </Card>
    );
  }


  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No Events Created</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            You haven't created any events yet. Create your first event to start selling tickets.
          </p>
          <Button asChild>
            <Link to="/organizer/create">Create Your First Event</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4">Active Events</h2>
        {activeEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {activeEvents.map((event) => (
              <EventCard key={event.id.toString()} event={event} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground">No active events. Create a new event to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Past Events</h2>
          <div className="grid grid-cols-1 gap-4">
            {pastEvents.map((event) => (
              <EventCard key={event.id.toString()} event={event} isCompleted />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EventCard({ event, isCompleted = false }: { event: Event; isCompleted?: boolean }) {
  // Ensure event.totalCapacity is not zero to avoid division by zero
  const percentageSold = event.totalCapacity > 0 ? Math.round((Number(event.ticketsSold) / Number(event.totalCapacity)) * 100) : 0;


  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/4 h-40 md:h-auto">
          <img
            src={event.imageUrl && event.imageUrl.length > 0 ? event.imageUrl[0] : "/placeholder.svg?height=200&width=200&text=Event+Image"}
            alt={event.name}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        </div>
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <h3 className="text-xl font-bold mr-3">{event.name}</h3>
              <Badge variant={isCompleted ? "secondary" : "default"}>{isCompleted ? "Completed" : "Active"}</Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Event
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <QrCode className="mr-2 h-4 w-4" />
                  Scan Tickets
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4 text-primary" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-2 h-4 w-4 text-primary" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-2 h-4 w-4 text-primary" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="mr-2 h-4 w-4 text-primary" />
              <span>
                {Number(event.ticketsSold)} / {Number(event.totalCapacity)} Attendees
              </span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1 text-xs">
              <span>Ticket Sales</span>
              <span>{percentageSold}%</span>
            </div>
            <Progress value={percentageSold} className="h-1.5" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant={isCompleted ? "outline" : "default"}>
              <Link to={`/organizer/event/${event.id.toString()}`}>{isCompleted ? "View Summary" : "Manage Event"}</Link>
            </Button>
            {!isCompleted && (
              <Button asChild size="sm" variant="outline">
                <Link to={`/scan`}>
                  <QrCode className="mr-2 h-4 w-4" />
                  Scan Tickets
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
