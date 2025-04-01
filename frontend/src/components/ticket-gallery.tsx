"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, QrCode, ExternalLink } from "lucide-react"
import type { Ticket } from "@/lib/ic-api"
import { icApi } from "@/lib/ic-api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface TicketGalleryProps {
  tickets: Ticket[]
}

export function TicketGallery({ tickets }: TicketGalleryProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleShowQR = async (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsLoading(true)

    try {
      const qrCodeSvg = await icApi.getTicketQRCode(ticket.id)
      setQrCode(qrCodeSvg)
    } catch (error) {
      console.error("Error generating QR code:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tickets.map((ticket) => (
        <Card key={ticket.id.toString()} className="overflow-hidden">
          <div className="aspect-video w-full bg-muted relative">
            {ticket.metadata.imageUrl ? (
              <img
                src={ticket.metadata.imageUrl || "/placeholder.svg"}
                alt={ticket.metadata.name}
                className="object-cover w-full h-full"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-muted">
                <span className="text-muted-foreground">No image available</span>
              </div>
            )}
            <Badge className="absolute top-2 right-2" variant={ticket.isUsed ? "secondary" : "default"}>
              {ticket.isUsed ? "Used" : "Valid"}
            </Badge>
          </div>
          <CardHeader>
            <CardTitle>{ticket.metadata.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{ticket.metadata.description}</p>
            <div className="space-y-2 text-sm">
              {ticket.metadata.attributes.map(([key, value]) => (
                <div key={key} className="flex items-center">
                  {key === "date" && <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />}
                  {key === "time" && <Clock className="h-4 w-4 mr-2 text-muted-foreground" />}
                  {key === "location" && <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />}
                  {!["date", "time", "location"].includes(key) && <div className="h-4 w-4 mr-2" />}
                  <span className="capitalize font-medium">{key}:</span>
                  <span className="ml-1">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => handleShowQR(ticket)}>
                  <QrCode className="mr-2 h-4 w-4" />
                  Show QR Code
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Ticket QR Code</DialogTitle>
                  <DialogDescription>Present this QR code at the event entrance for verification.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4">
                  {isLoading ? (
                    <div className="w-64 h-64 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : qrCode ? (
                    <div className="w-64 h-64 bg-white p-2" dangerouslySetInnerHTML={{ __html: qrCode }} />
                  ) : (
                    <div className="w-64 h-64 flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground">QR code not available</span>
                    </div>
                  )}
                  <p className="mt-4 text-sm text-center text-muted-foreground">Ticket ID: {ticket.id.toString()}</p>
                </div>
              </DialogContent>
            </Dialog>
            <Button asChild size="sm">
              <Link href={`/events/${ticket.eventId.toString()}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Event
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

