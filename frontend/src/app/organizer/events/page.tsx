'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useEvents } from '@/hooks/use-events';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { useICPEvents } from '@/hooks/useEvents';

export default function OrganizerEventsPage() {
  const { isAuthenticated } = useAuth();
  const { events, deleteEvent } = useICPEvents();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please connect your wallet to manage your events.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleDelete = async (eventId: string) => {
    setIsLoading(true);
    try {
      await deleteEvent(eventId);
      toast({
        title: 'Success',
        description: 'Event deleted successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Events</h1>
        <Link href="/events/create">
          <Button>Create New Event</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {events?.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{event.name}</CardTitle>
                  <CardDescription>
                    {format(new Date(event.date), 'PPP')} at {event.time}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Link href={`/events/${event.id}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(event.id)}
                    disabled={isLoading}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{event.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Location</h3>
                  <p className="text-muted-foreground">{event.location}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Attendees</h3>
                  <p className="text-muted-foreground">
                    {event.attendees.length} / {event.maxAttendees} spots filled
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 