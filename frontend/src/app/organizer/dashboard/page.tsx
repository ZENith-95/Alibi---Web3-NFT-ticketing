'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { useICPEvents } from '@/hooks/useEvents';

export default function OrganizerDashboardPage() {
  const { isAuthenticated } = useAuth();
  const { events } = useICPEvents();
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalAttendees: 0,
  });

  useEffect(() => {
    if (events) {
      const now = new Date();
      const upcomingEvents = events.filter(
        (event) => new Date(event.date) > now
      );
      
      setStats({
        totalEvents: events.length,
        upcomingEvents: upcomingEvents.length,
        totalAttendees: events.reduce(
          (acc, event) => acc + event.attendees.length,
          0
        ),
      });
    }
  }, [events]);

  if (!isAuthenticated) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please connect your wallet to access the organizer dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
        <Link href="/events/create">
          <Button>Create New Event</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Events</CardTitle>
            <CardDescription>All events created</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalEvents}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Events scheduled for the future</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.upcomingEvents}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Attendees</CardTitle>
            <CardDescription>Across all events</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalAttendees}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Your latest events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events?.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-semibold">{event.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.date), 'PPP')} at {event.time}
                  </p>
                </div>
                <Link href={`/events/${event.id}`}>
                  <Button variant="outline">View Details</Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 