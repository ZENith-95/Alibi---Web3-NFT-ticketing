"use client";

import React, { useState } from "react";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call to create event
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Event Created",
        description: "Your event has been created successfully.",
      });
      router.push("/organizer");
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Event Name</Label>
                <Input id="name" placeholder="Enter event name" required />
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
                <div className="flex">
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Clock className="mr-2 h-4 w-4" />
                    <span className="text-muted-foreground">Select time</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Event Location</Label>
              <Input id="location" placeholder="Enter event location" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Event Description</Label>
              <Textarea id="description" placeholder="Describe your event..." className="min-h-32" required />
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

