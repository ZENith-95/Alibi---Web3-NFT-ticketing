'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import Link from 'next/link';
import { Ticket } from 'lucide-react';
import { EventStatus, useICPEvents } from '@/hooks/useEvents';

export default function EventsPage() {
  const { isAuthenticated } = useAuth();
  const { events, status, errorMsg,fetchEvents } = useICPEvents();

  useEffect(()=>{
fetchEvents()
  },[fetchEvents])

  if (status === EventStatus.LOADING) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading events...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="container py-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
          <p>Error loading events: {errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Events</h1>
        {isAuthenticated && (
          <Link href="/events/create">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
              Create Event
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events?.map((event) => (
          <Link key={event.id.toString()} href={`/events/${event.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl">{event.name}</CardTitle>
                <CardDescription className="text-slate-400">
                  {format(new Date(event.date), 'PPP')} at {event.time}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 mb-4">{event.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-cyan-500" />
                    <span className="text-sm text-slate-400">
                      {event.ticketsSold.toString()} / {event.totalCapacity.toString()} tickets sold
                    </span>
                  </div>
                  <span className="text-sm font-medium text-cyan-400">
                    {event.ticketTypes.length} ticket types
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 