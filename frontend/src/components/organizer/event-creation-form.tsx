"use client";

import React, { useState, useRef } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { CalendarIcon, Clock, Plus, Trash, Image, Loader2 } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import { toast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import { IcApi } from "../../lib/ic-api";

export function EventCreationForm() {
  const router = useRouter();
  const [date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketTypes, setTicketTypes] = useState([{ name: "", price: "", capacity: "" }]);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewGenerated, setPreviewGenerated] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#00FEFE");
  const [secondaryColor, setSecondaryColor] = useState("#FF00FF");
  const [artStyle, setArtStyle] = useState("cyberpunk");
  const nameRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: "", price: "", capacity: "" }]);
  };

  const removeTicketType = (index: number) => {
    const newTicketTypes = [...ticketTypes];
    newTicketTypes.splice(index, 1);
    setTicketTypes(newTicketTypes);
  };

  const updateTicketType = (index: number, field: string, value: string) => {
    const newTicketTypes = [...ticketTypes];
    newTicketTypes[index] = { ...newTicketTypes[index], [field]: value };
    setTicketTypes(newTicketTypes);
  };

  const generatePreview = () => {
    setIsGeneratingPreview(true);
    // Simulate API call to generate preview
    setTimeout(() => {
      setIsGeneratingPreview(false);
      setPreviewGenerated(true);
      toast({
        title: "Preview Generated",
        description: "AI has generated a preview of your event ticket.",
      });
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date for the event",
        variant: "destructive"
      });
      return;
    }
    
    const name = nameRef.current?.value;
    const location = locationRef.current?.value;
    const description = descriptionRef.current?.value;
    const time = timeRef.current?.value || "12:00";
    
    if (!name || !location || !description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Validate ticket types
    const validTicketTypes = ticketTypes.filter(
      tt => tt.name && tt.price && tt.capacity
    );
    
    if (validTicketTypes.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one valid ticket type",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const api = new IcApi();
      
      const eventRequest = {
        name,
        description,
        date: format(date, "yyyy-MM-dd"),
        time,
        location,
        imageUrl: null,
        artStyle,
        ticketTypes: validTicketTypes.map(tt => ({
          name: tt.name,
          price: BigInt(parseFloat(tt.price) * 100000000), // Convert to bigint
          capacity: BigInt(parseInt(tt.capacity)),
          description: null
        }))
      };
      
      const result = await api.createEvent(eventRequest);
      
      if ('ok' in result) {
        toast({
          title: "Event Created",
          description: "Your event has been created successfully.",
        });
        // Use router.push for client-side navigation instead of window.location
        router.push("/organizer");
      } else {
        toast({
          title: "Error",
          description: "Failed to create event. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Event Name</Label>
                <Input id="name" placeholder="Enter event name" ref={nameRef} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Event Time</Label>
                <Input type="time" id="time" ref={timeRef} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Event Location</Label>
              <Input id="location" placeholder="Enter event location" ref={locationRef} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Event Description</Label>
              <Textarea id="description" placeholder="Describe your event..." ref={descriptionRef} className="min-h-32" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="artStyle">Ticket Art Style</Label>
              <Select value={artStyle} onValueChange={setArtStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="futuristic">Futuristic</SelectItem>
                  <SelectItem value="retro">Retro</SelectItem>
                  <SelectItem value="abstract">Abstract</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Ticket Types</h3>
          <div className="space-y-4">
            {ticketTypes.map((ticket, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end pb-4 border-b border-border">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`ticket-name-${index}`}>Ticket Name</Label>
                  <Input
                    id={`ticket-name-${index}`}
                    placeholder="e.g. General Admission"
                    value={ticket.name}
                    onChange={(e) => updateTicketType(index, "name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`ticket-price-${index}`}>Price (ICP)</Label>
                  <Input
                    id={`ticket-price-${index}`}
                    type="number"
                    step="0.001"
                    placeholder="0.00"
                    value={ticket.price}
                    onChange={(e) => updateTicketType(index, "price", e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor={`ticket-capacity-${index}`}>Capacity</Label>
                    <Input
                      id={`ticket-capacity-${index}`}
                      type="number"
                      placeholder="100"
                      value={ticket.capacity}
                      onChange={(e) => updateTicketType(index, "capacity", e.target.value)}
                      required
                    />
                  </div>
                  {ticketTypes.length > 1 && (
                    <button
                      type="button"
                      className="variant-ghost size-sm"
                      onClick={() => removeTicketType(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="button" onClick={addTicketType} className="w-full border border-gray-300 rounded-md p-2 text-center">
              <Plus className="mr-2 h-4 w-4" />
              Add Ticket Type
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline">
          Save as Draft
        </Button>
        <Button aria-disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Publish Event"
          )}
        </Button>
      </div>
    </form>
  );
}

