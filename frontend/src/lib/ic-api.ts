import { Principal } from "@dfinity/principal"
import { Identity } from "@dfinity/agent"

// Types
export interface Event {
  id: bigint
  name: string
  description: string
  date: string
  time: string
  location: string
  organizer: Principal
  imageUrl: string | null
  artStyle: string
  ticketTypes: TicketType[]
  totalCapacity: bigint
  ticketsSold: bigint
  isActive: boolean
  createdAt: bigint
}

export interface TicketType {
  id: bigint
  name: string
  price: bigint
  capacity: bigint
  sold: bigint
  description: string | null
}

export interface Ticket {
  id: bigint
  eventId: bigint
  ticketTypeId: bigint
  owner: Principal
  isUsed: boolean
  metadata: {
    name: string
    description: string
    imageUrl: string | null
    attributes: [string, string][]
  }
  mintedAt: bigint
}

export interface CreateEventRequest {
  name: string
  description: string
  date: string
  time: string
  location: string
  imageUrl: string | null
  artStyle: string
  ticketTypes: {
    name: string
    price: bigint
    capacity: bigint
    description: string | null
  }[]
}

export interface MintTicketRequest {
  eventId: bigint
  ticketTypeId: bigint
}

export type Result<T, E> = { ok: T } | { err: E }

export type Error =
  | { NotFound: null }
  | { AlreadyExists: null }
  | { NotAuthorized: null }
  | { SoldOut: null }
  | { InvalidInput: null }
  | { CannotModify: null }
  | { SystemError: null }

// Mock API implementation for frontend development
export class IcApi {
  // Mock data
  private events: Event[] = []
  private tickets: Ticket[] = []
  private nextEventId = 1n
  private nextTicketId = 1n
  private nextTicketTypeId = 1n

  constructor() {
    // Initialize with some mock data
    this.initializeMockData()
  }

  private initializeMockData() {
    // Create some mock events
    const event1: Event = {
      id: 1n,
      name: "Neon Nights 2024",
      description: "A futuristic cyberpunk event with live music and digital art installations.",
      date: "2024-06-15",
      time: "8:00 PM",
      location: "Quantum Arena, San Francisco",
      organizer: Principal.fromText("2vxsx-fae"),
      imageUrl: "/placeholder.svg?height=400&width=800&text=Neon+Nights",
      artStyle: "cyberpunk",
      ticketTypes: [
        {
          id: 1n,
          name: "General Admission",
          price: 10000000n, // 0.1 ICP
          capacity: 500n,
          sold: 380n,
          description: "Standard entry ticket",
        },
        {
          id: 2n,
          name: "VIP Access",
          price: 50000000n, // 0.5 ICP
          capacity: 100n,
          sold: 75n,
          description: "VIP entry with exclusive areas",
        },
      ],
      totalCapacity: 600n,
      ticketsSold: 455n,
      isActive: true,
      createdAt: BigInt(Date.now()),
    }

    const event2: Event = {
      id: BigInt(2),
      name: "Blockchain Summit",
      description: "A conference for blockchain enthusiasts and developers.",
      date: "2024-07-22",
      time: "9:00 AM",
      location: "Tech Center, New York",
      organizer: Principal.fromText("2vxsx-fae"),
      imageUrl: "/placeholder.svg?height=400&width=800&text=Blockchain+Summit",
      artStyle: "minimalist",
      ticketTypes: [
        {
          id: BigInt(3),
          name: "Standard Pass",
          price: BigInt(20000000), // 0.2 ICP
          capacity: BigInt(300),
          sold: BigInt(210),
          description: "Standard conference pass",
        },
      ],
      totalCapacity: BigInt(300),
      ticketsSold: BigInt(210),
      isActive: true,
      createdAt: BigInt(Date.now()),
    }

    this.events.push(event1, event2)
    this.nextEventId = BigInt(3)
    this.nextTicketTypeId = BigInt(4)
  }

  async getAllEvents(): Promise<Event[]> {
    return this.events.filter((event) => event.isActive)
  }

  async getEvent(eventId: bigint): Promise<Event | null> {
    const event = this.events.find((e) => e.id === eventId)
    return event || null
  }

  async getOrganizerEvents(organizer: Principal): Promise<Event[]> {
    return this.events.filter((e) => e.organizer.toString() === organizer.toString())
  }

  async createEvent(request: CreateEventRequest): Promise<Result<bigint, Error>> {
    const eventId = this.nextEventId++

    // Process ticket types
    const ticketTypes: TicketType[] = []
    let totalCapacity = 0n

    for (const ttReq of request.ticketTypes) {
      const ticketTypeId = this.nextTicketTypeId++
      const ticketType: TicketType = {
        id: ticketTypeId,
        name: ttReq.name,
        price: ttReq.price,
        capacity: ttReq.capacity,
        sold: 0n,
        description: ttReq.description,
      }

      ticketTypes.push(ticketType)
      totalCapacity += ttReq.capacity
    }

    // Create the event
    const event: Event = {
      id: eventId,
      name: request.name,
      description: request.description,
      date: request.date,
      time: request.time,
      location: request.location,
      organizer: Principal.fromText("2vxsx-fae"), // Mock organizer
      imageUrl: request.imageUrl,
      artStyle: request.artStyle,
      ticketTypes: ticketTypes,
      totalCapacity: totalCapacity,
      ticketsSold: 0n,
      isActive: true,
      createdAt: BigInt(Date.now()),
    }

    this.events.push(event)
    return { ok: eventId }
  }

  async mintTicket(request: MintTicketRequest): Promise<Result<bigint, Error>> {
    // Find the event
    const eventIndex = this.events.findIndex((e) => e.id === request.eventId);
    if (eventIndex === -1) {
      return { err: { NotFound: null } };
    }

    const event = this.events[eventIndex];

    if (!event.isActive) {
      return { err: { NotAuthorized: null } };
    }

    // Find the ticket type
    const ticketTypeIndex = event.ticketTypes.findIndex((tt) => tt.id === request.ticketTypeId);
    if (ticketTypeIndex === -1) {
      return { err: { NotFound: null } };
    }

    const ticketType = event.ticketTypes[ticketTypeIndex];

    if (ticketType.sold >= ticketType.capacity) {
      return { err: { SoldOut: null } };
    }

    // Update ticket type and event data immutably
    const updatedTicketType = {
      ...ticketType,
      sold: ticketType.sold + 1n,
    };

    const updatedEvent = {
      ...event,
      ticketsSold: event.ticketsSold + 1n,
      ticketTypes: [
        ...event.ticketTypes.slice(0, ticketTypeIndex),
        updatedTicketType,
        ...event.ticketTypes.slice(ticketTypeIndex + 1),
      ],
    };

    // Create ticket metadata using updated event data
    const metadata = {
      name: `${updatedEvent.name} - ${updatedTicketType.name}`,
      description: `NFT Ticket for ${updatedEvent.name}`,
      imageUrl: updatedEvent.imageUrl,
      attributes: [
        ["Event", updatedEvent.name],
        ["Type", updatedTicketType.name],
        ["Date", updatedEvent.date],
        ["Time", updatedEvent.time],
        ["Location", updatedEvent.location],
        ["Art Style", updatedEvent.artStyle],
      ] as [string, string][],
    };

    // Create the ticket
    const ticketId = this.nextTicketId++;
    const ticket: Ticket = {
      id: ticketId,
      eventId: request.eventId,
      ticketTypeId: request.ticketTypeId,
      owner: Principal.fromText("aaaaa-aa"), // Replace with actual owner's Principal
      isUsed: false,
      metadata: metadata,
      mintedAt: BigInt(Date.now()),
    };

    // Replace the event in the events array
    this.events = [
      ...this.events.slice(0, eventIndex),
      updatedEvent,
      ...this.events.slice(eventIndex + 1),
    ];

    // Add the new ticket to the tickets array
    this.tickets.push(ticket);

    return { ok: ticketId };
  }

  async updateIdentity(identity: any): Promise<void> {
    // In a real implementation, this would update the HttpAgent with the provided identity
    // For the mock implementation, we'll just log it
    if (identity) {
      console.log(`Updated to authenticated identity: ${identity.getPrincipal().toText()}`);
    } else {
      console.log("Updated to anonymous identity");
    }
  }

  async getUserTickets(user: Principal): Promise<Ticket[]> {
    return this.tickets.filter((t) => t.owner.toString() === user.toString())
  }

  async getTicket(ticketId: bigint): Promise<Ticket | null> {
    const ticket = this.tickets.find((t) => t.id === ticketId)
    return ticket || null
  }

  async verifyTicket(ticketId: bigint): Promise<Result<boolean, Error>> {
    const ticket = this.tickets.find((t) => t.id === ticketId)
    if (!ticket) {
      return { err: { NotFound: null } }
    }

    return { ok: !ticket.isUsed }
  }
}

// Export a singleton instance
export const icApi = new IcApi()

