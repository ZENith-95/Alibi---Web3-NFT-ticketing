'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { useICPEvents } from '@/hooks/useEvents';
type Params = {
  id: string;
};

export default function EventPageClient() {
  const { id } = useParams() as Params;
  const { isAuthenticated ,principal} = useAuth();
  const { events,  } = useICPEvents();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const event = events?.find((e) => e.id === BigInt( id));

  if (!event) {
    return <div className="container py-8">Event not found</div>;
  }

  const handleAttend = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please connect your wallet to attend events.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // await attendEvent(event.id);
      toast({
        title: 'Success',
        description: 'You have successfully joined the event!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to join the event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeave = async () => {
    setIsLoading(true);
    try {
      // await leaveEvent(event.id);
      toast({
        title: 'Success',
        description: 'You have left the event.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to leave the event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isAttending = event.attendees.includes(principal?.toString() || '');

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl">{event.name}</CardTitle>
          <CardDescription className="text-lg">
            {format(new Date(event.date), 'PPP')} at {event.time}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{event.description}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Location</h3>
              <p className="text-muted-foreground">{event.location}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Attendees</h3>
              <p className="text-muted-foreground">
                {event.attendees.length} / {0} spots filled
              </p>
            </div>

            <div className="flex gap-4">
              {isAttending ? (
                <Button
                  variant="destructive"
                  onClick={handleLeave}
                  disabled={isLoading}
                >
                  Leave Event
                </Button>
              ) : (
                <Button
                  onClick={handleAttend}
                  disabled={isLoading || event.attendees.length >= 0}
                >
                  Attend Event
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 