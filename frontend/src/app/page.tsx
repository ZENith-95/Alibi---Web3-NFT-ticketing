'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useEvents } from '@/hooks/use-events';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import Link from 'next/link';
import { Calendar, Ticket, Users } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { events, isLoading } = useEvents();
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);

  useEffect(() => {
    if (events) {
      const now = new Date();
      const upcomingEvents = events
        .filter((event) => new Date(event.date) > now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);
      setFeaturedEvents(upcomingEvents);
    }
  }, [events]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F1A] to-[#1A1A2C] text-[#E0E0FF]">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Welcome to Alibi
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A decentralized ticketing platform built on the Internet Computer.
            Create, manage, and attend events with secure NFT tickets.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/events">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Browse Events
              </Button>
            </Link>
            {isAuthenticated ? (
              <Link href="/events/create">
                <Button size="lg" variant="outline" className="border-blue-600 text-blue-400">
                  Create Event
                </Button>
              </Link>
            ) : (
              <Link href="/profile">
                <Button size="lg" variant="outline" className="border-blue-600 text-blue-400">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-[#1E1E2E] border-[#2A2A3A]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                Active Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">
                {events?.filter(e => new Date(e.date) > new Date()).length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1E1E2E] border-[#2A2A3A]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-purple-400" />
                Total Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">
                {events?.reduce((acc, e) => acc + e.attendees.length, 0) || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1E1E2E] border-[#2A2A3A]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-400" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-400">
                {events?.reduce((acc, e) => {
                  const uniqueUsers = new Set(e.attendees);
                  return acc + uniqueUsers.size;
                }, 0) || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Events */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Events</h2>
          {isLoading ? (
            <div className="text-center py-8">Loading events...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <Card className="bg-[#1E1E2E] border-[#2A2A3A] hover:border-blue-500 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-blue-400">{event.title}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {format(new Date(event.date), 'PPP')} at {event.time}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {event.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-400">
                          {event.attendees.length} attendees
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {event.maxAttendees - event.attendees.length} spots left
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Canister Info */}
        <div className="text-center">
          <Card className="bg-[#1E1E2E] border-[#2A2A3A] inline-block">
            <CardHeader>
              <CardTitle>Backend Canisters</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Profile Canister ID: {process.env.NEXT_PUBLIC_PROFILE_CANISTER_ID}</p>
              <p>Events Canister ID: {process.env.NEXT_PUBLIC_EVENTS_CANISTER_ID}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 