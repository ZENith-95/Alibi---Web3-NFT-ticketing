export interface TicketType {
  name: string;
  price: bigint;
  capacity: bigint;
  description: string | null;
}

export interface CreateEventRequest {
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  artStyle: string;
  imageUrl?: string;
  ticketTypes: TicketType[];
}

export interface EventType extends CreateEventRequest {
  id: bigint;
  organizer: string;
  totalCapacity: bigint;
  ticketsSold: bigint;
  isActive: boolean;
  createdAt: bigint;
  attendees: string[];
}

export interface EventResponse {
  ok?: Event;
  err?: {
    SystemError: null;
    NotAuthorized: null;
    EventNotFound: null;
    InvalidEventData: null;
  };
} 