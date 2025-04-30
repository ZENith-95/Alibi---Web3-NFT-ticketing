"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
// import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Plus, Trash, Loader2, Upload, Image as ImageIcon } from "lucide-react"; // Added Upload, ImageIcon
import { format } from "date-fns";
// import { toast } from "../../components/ui/use-toast"; // Using sonner toast instead
import { CreateEventRequest, icApi } from "../../lib/ic-api";
import { useNavigate } from "react-router-dom";
import { CreateTicketTypeRequest } from "../../../../declarations/alibi_events/alibi_events.did";
import { Textarea } from "../../components/ui/textarea";
import { useWallet } from "../../components/WalletProvider"; // Import useWallet for agent
import { Actor, HttpAgent } from "@dfinity/agent"; // Import Actor and HttpAgent
import { toast } from "sonner"; // Using sonner toast
import { Principal } from "@dfinity/principal"; // Import Principal
import { IDL } from "@dfinity/candid"; // Import IDL
export function EventCreationForm() {
  const [date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketTypes, setTicketTypes] = useState([{ name: "", price: "", capacity: "" }]);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewGenerated, setPreviewGenerated] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#00FEFE");
  const [secondaryColor, setSecondaryColor] = useState("#FF00FF");
  const [artStyle, setArtStyle] = useState("cyberpunk");
  const [eventName, setEventName] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { identity } = useWallet(); // Get identity for authenticated calls
  useEffect(() => {
    // Debug effect to log when the date changes
    if (date) {
      console.log("Date state updated:", date);
      console.log("Formatted date:", format(date, "yyyy-MM-dd"));
    }
  }, [date]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic validation (e.g., file type, size)
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file.");
        return;
      }
      // Add size validation if needed: e.g., if (file.size > 2 * 1024 * 1024) { toast.error("File size exceeds 2MB"); return; }
      setSelectedFile(file);
      setImageUrl(null); // Reset URL if a new file is selected
      setUploadError(null);
    }
  };

  // --- Asset Canister Upload Implementation ---

  // Minimal interface for asset canister actor
  interface AssetCanisterActor {
    create_batch: () => Promise<{ batch_id: string }>;
    create_chunk: (args: { batch_id: string; content: number[] }) => Promise<{ chunk_id: string }>;
    commit_batch: (args: {
      batch_id: string;
      chunk_ids: string[];
      headers: Array<[string, string]>;
      content_type: string;
    }) => Promise<void>;
  }

  // Define the IDL factory inline for the necessary methods
  // Corrected to match InterfaceFactory type (no arguments)
  const assetCanisterIdlFactory: IDL.InterfaceFactory = () => {
    return IDL.Service({
      create_batch: IDL.Func([], [IDL.Record({ batch_id: IDL.Text })], []),
      create_chunk: IDL.Func(
        [IDL.Record({ batch_id: IDL.Text, content: IDL.Vec(IDL.Nat8) })],
        [IDL.Record({ chunk_id: IDL.Text })],
        [],
      ),
      commit_batch: IDL.Func(
        [
          IDL.Record({
            batch_id: IDL.Text,
            chunk_ids: IDL.Vec(IDL.Text),
            headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
            content_type: IDL.Text,
          }),
        ],
        [],
        [],
      ),
    });
  };


  const handleImageUpload = async (): Promise<string | null> => {
     if (!selectedFile) {
       toast.error("No file selected.");
       return null;
    }
    if (!identity) {
       toast.error("User not authenticated. Cannot upload image.");
       return null;
    }

    setIsUploading(true);
    setUploadError(null);
    toast.info("Starting image upload...");

    const canisterId = process.env.CANISTER_ID_ALIBI_FRONTEND;
    if (!canisterId) {
      toast.error("Frontend canister ID not found in environment variables.");
      setIsUploading(false);
      return null;
    }

    try {
      const agent = new HttpAgent({ identity });
      if (process.env.DFX_NETWORK !== 'ic') {
        await agent.fetchRootKey();
      }

      const assetActor = Actor.createActor<AssetCanisterActor>(assetCanisterIdlFactory, {
        agent,
        canisterId: Principal.fromText(canisterId),
      });

      const fileBuffer = await selectedFile.arrayBuffer();
      const fileBytes = new Uint8Array(fileBuffer);

      const { batch_id } = await assetActor.create_batch();
      const chunkSize = 1024 * 1024; // 1MB chunks
      const chunkIds: string[] = [];

      for (let i = 0; i < fileBytes.length; i += chunkSize) {
        const chunk = Array.from(fileBytes.slice(i, i + chunkSize));
        const { chunk_id } = await assetActor.create_chunk({ batch_id, content: chunk });
        chunkIds.push(chunk_id);
        // Optional: Update progress indicator here
        toast.info(`Uploaded chunk ${chunkIds.length}...`);
      }

      await assetActor.commit_batch({
        batch_id,
        chunk_ids: chunkIds,
        headers: [], // Add headers if needed, e.g., Cache-Control
        content_type: selectedFile.type,
      });

      // Construct the URL - Use standard local asset canister format
      const host = process.env.DFX_NETWORK === 'ic'
        ? `https://${canisterId}.raw.icp0.io` // Basic mainnet URL (consider certified domains)
        : `http://localhost:4943`;
      // Use query parameter for local canister ID
      const finalUrl = process.env.DFX_NETWORK === 'ic'
         ? `${host}/${selectedFile.name}`
         : `${host}/${selectedFile.name}?canisterId=${canisterId}`;

      setIsUploading(false);
      toast.success("Image uploaded successfully!");
      setImageUrl(finalUrl);
      return finalUrl;

    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(`Image upload failed: ${error.message || 'Unknown error'}`);
      setUploadError("Failed to upload image.");
      setIsUploading(false);
      return null;
    }
  };

  // --- End Asset Canister Upload Implementation ---


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
      // Using sonner toast:
      toast.info("AI has generated a preview of your event ticket.");
      // Original toast call (commented out):
      // toast({
      //   title: "Preview Generated",
      //   description: "AI has generated a preview of your event ticket.",
      // });
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!date) {
        toast.error("Please select a date for your event.");
        // Original toast call (commented out):
        // toast({
        //   title: "Error",
        //   description: "Please select a date for your event.",
        //   variant: "destructive",
        // });
        setIsSubmitting(false);
        return;
      }

      if (ticketTypes.some(ticket => !ticket.name || !ticket.price || !ticket.capacity)) {
         toast.error("Please fill out all ticket type fields.");
        // Original toast call (commented out):
        // toast({
        //   title: "Error",
        //   description: "Please fill out all ticket type fields.",
        //   variant: "destructive",
        // });
        setIsSubmitting(false);
        return;
      }

      // Format date as YYYY-MM-DD
      const formattedDate = format(date, "yyyy-MM-dd");
      console.log("Formatted date:", formattedDate);

      // 1. Upload image if selected
      let finalImageUrl: string | null = imageUrl; // Use already uploaded URL if available
      if (selectedFile && !imageUrl) { // Only upload if file selected and not already uploaded
        finalImageUrl = await handleImageUpload();
        if (!finalImageUrl) {
          // Upload failed, stop submission
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Create the event request object
      const request: CreateEventRequest = {
        name: eventName,
        description: eventDescription,
        date: formattedDate,
        time: eventTime || "12:00",
        location: eventLocation,
        imageUrl: finalImageUrl ? [finalImageUrl] : [], // Use optional array syntax for ?Text
        artStyle: artStyle,
        ticketTypes: ticketTypes.map(tt => ({
          name: tt.name,
          price: BigInt(parseFloat(tt.price || "0") * 100000000), // Convert to e8s (ICP smallest unit)
          capacity: BigInt(parseInt(tt.capacity || "0")),
          description: [],
        } as CreateTicketTypeRequest)),
      };

      console.log("Creating event with data:", request);

      // Call the API to create the event
      const result = await icApi.createEvent(request);

      if ("ok" in result) {
        toast.success(`Event created successfully with ID: ${result.ok.toString()}`);
        // Original toast call (commented out):
        // toast({
        //   title: "Event Created",
        //   description: "Your event has been created successfully with ID: " + result.ok.toString(),
        // });
        navigate("/organizer");
      } else {
        let errorMessage = "Error creating event: Unknown error";
        if ("NotAuthorized" in result.err) {
          errorMessage = "You are not authorized to create events.";
        } else if ("InvalidInput" in result.err) {
          errorMessage = "Invalid input data. Please check your form.";
        } else if ("SystemError" in result.err) {
          errorMessage = `Error creating event: System error. Please try again later. (${JSON.stringify(result.err)})`;
        }
        toast.error(errorMessage);
        // Original toast call (commented out):
        // toast({
        //   title: "Error Creating Event",
        //   description: errorMessage,
        //   variant: "destructive",
        // });
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event. Please try again.");
      // Original toast call (commented out):
      // toast({
      //   title: "Error",
      //   description: "Failed to create event. Please try again.",
      //   variant: "destructive",
      // });
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
                <Input
                  id="name"
                  placeholder="Enter event name"
                  required
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Event Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date ? format(date, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const selectedDate = e.target.valueAsDate;
                    if (selectedDate) {
                      console.log("Date selected:", selectedDate);
                      setDate(selectedDate);
                    }
                  }}
                  min={format(new Date(), "yyyy-MM-dd")}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Event Time</Label>
                <Input
                  id="time"
                  type="time"
                  placeholder="e.g. 19:00"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Event Location</Label>
              <Input
                id="location"
                placeholder="Enter event location"
                required
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artStyle">Art Style</Label>
              <Select value={artStyle} onValueChange={setArtStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select art style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="abstract">Abstract</SelectItem>
                  <SelectItem value="futuristic">Futuristic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="eventImage">Event Image</Label>
              <Input
                id="eventImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              />
              {selectedFile && !isUploading && !imageUrl && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                  <Button type="button" size="sm" variant="ghost" onClick={handleImageUpload} disabled={isUploading}>
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload
                  </Button>
                </div>
              )}
              {isUploading && (
                 <div className="text-sm text-muted-foreground flex items-center gap-2">
                   <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                 </div>
              )}
              {imageUrl && (
                <div className="text-sm text-green-600">Image uploaded: {imageUrl}</div>
              )}
               {uploadError && (
                <div className="text-sm text-red-600">{uploadError}</div>
              )}
            </div>
             {/* End Image Upload Section */}


            <div className="space-y-2">
              <Label htmlFor="description">Event Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your event..."
                className="min-h-32"
                required
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
              />
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

            <button
              type="button"
              onClick={addTicketType}
              className="w-full border border-gray-300 rounded-md p-2 text-center"
            >
              <Plus className="mr-2 h-4 w-4 inline" />
              Add Ticket Type
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => navigate("/organizer")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
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
