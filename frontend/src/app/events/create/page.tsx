'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useEvents } from '@/hooks/use-events';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash } from 'lucide-react';
import { CreateEventRequest, TicketType } from '@/types/events';

export default function CreateEventPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { createEvent } = useEvents();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<CreateEventRequest>({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    artStyle: 'modern',
    imageUrl: null,
    ticketTypes: [],
  });

  if (!isAuthenticated) {
    return (
      <div className="container py-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription className="text-slate-400">
              Please connect your wallet to create events.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return "Event name is required";
    if (!formData.description.trim()) return "Event description is required";
    if (!formData.date) return "Event date is required";
    if (!formData.time) return "Event time is required";
    if (!formData.location.trim()) return "Event location is required";
    if (formData.ticketTypes.length === 0) return "At least one ticket type is required";

    for (const ticketType of formData.ticketTypes) {
      if (!ticketType.name.trim()) return "Ticket name is required";
      if (ticketType.price <= BigInt(0)) return "Ticket price must be greater than 0";
      if (ticketType.capacity <= BigInt(0)) return "Ticket capacity must be greater than 0";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validationError = validateForm();
      if (validationError) {
        toast({
          title: "Validation Error",
          description: validationError,
          variant: "destructive",
        });
        return;
      }

      // Format the date and time
      const formattedDate = new Date(formData.date).toISOString().split('T')[0];
      const formattedTime = formData.time;

      // Create event request with properly formatted data
      const eventRequest: CreateEventRequest = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        date: formattedDate,
        time: formattedTime,
        location: formData.location.trim(),
        artStyle: formData.artStyle,
        imageUrl: [], // Empty array for null in Candid
        ticketTypes: formData.ticketTypes.map(tt => ({
          name: tt.name.trim(),
          price: tt.price,
          capacity: tt.capacity,
          description: tt.description ? [tt.description.trim()] : [] // Array for optional text in Candid
        }))
      };

      console.log('Creating event with request:', eventRequest);

      const result = await createEvent(eventRequest);
      
      if ('err' in result) {
        const errorMessage = result.err.SystemError ? 'System error occurred' :
                           result.err.NotAuthorized ? 'You are not authorized to create events' :
                           result.err.InvalidEventData ? 'Invalid event data' :
                           'Failed to create event';
        throw new Error(errorMessage);
      }

      toast({
        title: "Success",
        description: "Event created successfully",
      });
      
      router.push('/events');
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTicketType = () => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: [
        ...prev.ticketTypes,
        {
          name: '',
          price: BigInt(0),
          capacity: BigInt(0),
          description: null
        }
      ]
    }));
  };

  const handleRemoveTicketType = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, i) => i !== index)
    }));
  };

  const handleTicketTypeChange = (index: number, field: keyof TicketType, value: string) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.map((tt, i) => {
        if (i === index) {
          if (field === "name" || field === "description") {
            return {
              ...tt,
              [field]: value
            };
          } else if (field === "price" || field === "capacity") {
            // Remove any non-numeric characters except decimal point
            const numericValue = value.replace(/[^\d.]/g, '');
            
            // Convert to BigInt, defaulting to 0 if invalid
            try {
              // First convert to number to handle decimal points
              const numberValue = parseFloat(numericValue);
              if (isNaN(numberValue)) {
                return {
                  ...tt,
                  [field]: BigInt(0)
                };
              }
              
              // Convert to BigInt, multiplying by 100 to handle decimals
              return {
                ...tt,
                [field]: BigInt(Math.round(numberValue * 100))
              };
            } catch (error) {
              console.error(`Error converting ${field} to BigInt:`, error);
              return {
                ...tt,
                [field]: BigInt(0)
              };
            }
          }
        }
        return tt;
      })
    }));
  };

  return (
    <div className="container py-8">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
          <CardDescription className="text-slate-400">
            Fill in the details below to create your event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Event Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter event name"
                className="bg-slate-700 border-slate-600"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Date</label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Time</label>
                <Input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1 block">Location</label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter event location"
                className="bg-slate-700 border-slate-600"
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1 block">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter event description"
                className="bg-slate-700 border-slate-600"
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1 block">Art Style</label>
              <Input
                name="artStyle"
                value={formData.artStyle}
                onChange={handleChange}
                placeholder="Enter art style (e.g. modern, classic, minimalist)"
                className="bg-slate-700 border-slate-600"
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1 block">Ticket Types</label>
              <div className="space-y-4">
                {formData.ticketTypes.map((ticketType, index) => (
                  <div key={index} className="p-4 rounded-md bg-slate-700 border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <Input
                        placeholder="Ticket name (e.g. General Admission)"
                        className="bg-slate-600 border-slate-500 w-48"
                        value={ticketType.name}
                        onChange={(e) => handleTicketTypeChange(index, "name", e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Price in ICP"
                        className="bg-slate-600 border-slate-500 w-32"
                        value={Number(ticketType.price) / 100}
                        onChange={(e) => handleTicketTypeChange(index, "price", e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Input
                        type="number"
                        placeholder="Quantity"
                        className="bg-slate-600 border-slate-500 w-32"
                        value={ticketType.capacity.toString()}
                        onChange={(e) => handleTicketTypeChange(index, "capacity", e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-slate-400"
                        onClick={() => handleRemoveTicketType(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed border-slate-600"
                  onClick={handleAddTicketType}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ticket Type
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                className="border-slate-700"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-blue-500"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 