import { Principal } from "@dfinity/principal"
import { Identity, Actor, HttpAgent } from "@dfinity/agent"
import { idlFactory as eventsIdlFactory } from "../declarations/events/events.did.js"
import { idlFactory as ticketIdlFactory } from "../declarations/ticket/ticket.did.js"
import { idlFactory as profileIdlFactory } from "../declarations/profile/profile.did.js"
import { _SERVICE as EventsService } from "../declarations/events/events.did"
import { _SERVICE as TicketService } from "../declarations/ticket/ticket.did"
import { _SERVICE as ProfileService } from "../declarations/profile/profile.did"

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

// API implementation that connects to backend canisters
export class IcApi {
  private eventsActor: EventsService | null = null
  private ticketActor: TicketService | null = null
  private profileActor: ProfileService | null = null
  private agent: HttpAgent | null = null
  private host: string = process.env.NEXT_PUBLIC_IC_HOST || "http://localhost:8000"

  constructor() {
    this.initializeActors()
  }

  private initializeActors() {
    // Create an anonymous agent
    this.agent = new HttpAgent({ host: this.host })

    // For local development, we need to fetch the root key
    if (this.host.includes("localhost") || this.host.includes("127.0.0.1")) {
      this.agent.fetchRootKey().catch((err) => {
        console.warn("Unable to fetch root key. If you're running locally, this is expected:", err)
      })
    }

    // Create actors using anonymous identity
    this.createActors()
  }

  private createActors() {
    try {
      const eventsCanisterId = process.env.NEXT_PUBLIC_EVENTS_CANISTER_ID
      const ticketCanisterId = process.env.NEXT_PUBLIC_TICKET_CANISTER_ID
      const profileCanisterId = process.env.NEXT_PUBLIC_PROFILE_CANISTER_ID

      if (!this.agent) {
        console.error("Agent not initialized")
        return
      }

      if (eventsCanisterId) {
        this.eventsActor = Actor.createActor<EventsService>(eventsIdlFactory, {
          agent: this.agent,
          canisterId: eventsCanisterId,
        })
      } else {
        console.warn("Events canister ID not found in environment variables")
      }

      if (ticketCanisterId) {
        this.ticketActor = Actor.createActor<TicketService>(ticketIdlFactory, {
          agent: this.agent,
          canisterId: ticketCanisterId,
        })
      } else {
        console.warn("Ticket canister ID not found in environment variables")
      }

      if (profileCanisterId) {
        this.profileActor = Actor.createActor<ProfileService>(profileIdlFactory, {
          agent: this.agent,
          canisterId: profileCanisterId,
        })
      } else {
        console.warn("Profile canister ID not found in environment variables")
      }
    } catch (error) {
      console.error("Error creating actors:", error)
    }
  }

  async updateIdentity(identity: any): Promise<void> {
    if (!identity) {
      // Reinitialize with anonymous identity
      this.initializeActors()
      return
    }

    try {
      // Create a new agent with the authenticated identity
      this.agent = new HttpAgent({ host: this.host, identity })

      // For local development, we need to fetch the root key
      if (this.host.includes("localhost") || this.host.includes("127.0.0.1")) {
        await this.agent.fetchRootKey().catch((err) => {
          console.warn("Unable to fetch root key:", err)
        })
      }

      // Recreate the actors with the authenticated identity
      this.createActors()
    } catch (error) {
      console.error("Error updating identity:", error)
    }
  }

  // Map backend event to frontend event model
  private mapEventToFrontend = (backendEvent: any): Event => {
    const ticketTypes = Array.isArray(backendEvent.ticketTypes)
      ? backendEvent.ticketTypes.map((tt: any) => ({
          id: BigInt(tt.id),
          name: tt.name,
          price: BigInt(tt.price),
          capacity: BigInt(tt.capacity),
          sold: BigInt(tt.sold),
          description: tt.description?.[0] || null,
        }))
      : []

    let totalCapacity = 0n
    let ticketsSold = 0n

    // Calculate totals
    for (const tt of ticketTypes) {
      totalCapacity += tt.capacity
      ticketsSold += tt.sold
    }

    // Determine if event is active based on status
    const isActive = backendEvent.status?.active !== undefined

    return {
      id: BigInt(backendEvent.id),
      name: backendEvent.name,
      description: backendEvent.description,
      date: backendEvent.date,
      time: backendEvent.time,
      location: backendEvent.location,
      organizer: backendEvent.organizer,
      imageUrl: backendEvent.imageUrl?.[0] || null,
      artStyle: backendEvent.artStyle,
      ticketTypes,
      totalCapacity,
      ticketsSold,
      isActive,
      createdAt: BigInt(Date.now()), // Backend doesn't store creation time
    }
  }

  // Map backend ticket to frontend ticket model
  private mapTicketToFrontend = (backendTicket: any): Ticket => {
    return {
      id: BigInt(backendTicket.id),
      eventId: BigInt(backendTicket.eventId),
      ticketTypeId: BigInt(backendTicket.ticketTypeId),
      owner: backendTicket.owner,
      isUsed: backendTicket.isUsed,
      metadata: {
        name: backendTicket.metadata.name,
        description: backendTicket.metadata.description,
        imageUrl: backendTicket.metadata.imageUrl?.[0] || null,
        attributes: backendTicket.metadata.attributes,
      },
      mintedAt: BigInt(backendTicket.mintedAt),
    }
  }

  async getAllEvents(): Promise<Event[]> {
    if (!this.eventsActor) {
      console.error("Events actor not initialized")
      return []
    }

    try {
      const response = await this.eventsActor.getAllEvents()
      if ("ok" in response) {
        const events = response.ok as any[]
        return events.map((event) => this.mapEventToFrontend(event))
      } else {
        console.error("Error fetching events:", response)
        return []
      }
    } catch (error) {
      console.error("Error calling getAllEvents:", error)
      return []
    }
  }

  async getEvent(eventId: bigint): Promise<Event | null> {
    if (!this.eventsActor) {
      console.error("Events actor not initialized")
      return null
    }

    try {
      const response = await this.eventsActor.getEvent(eventId.toString() as any)
      if ("ok" in response) {
        return this.mapEventToFrontend(response.ok)
      } else {
        console.error("Error fetching event:", response)
        return null
      }
    } catch (error) {
      console.error("Error calling getEvent:", error)
      return null
    }
  }

  async getOrganizerEvents(organizer: Principal): Promise<Event[]> {
    if (!this.eventsActor) {
      console.error("Events actor not initialized")
      return []
    }

    try {
      const response = await this.eventsActor.getOrganizerEvents(organizer)
      if ("ok" in response) {
        const events = response.ok as any[]
        return events.map((event) => this.mapEventToFrontend(event))
      } else {
        console.error("Error fetching organizer events:", response)
        return []
      }
    } catch (error) {
      console.error("Error calling getOrganizerEvents:", error)
      return []
    }
  }

  async createEvent(request: CreateEventRequest): Promise<Result<bigint, Error>> {
    if (!this.eventsActor) {
      console.error("Events actor not initialized")
      return { err: { SystemError: null } }
    }

    try {
      // Convert request to backend format
      const backendRequest = {
        name: request.name,
        description: request.description,
        date: request.date,
        time: request.time,
        location: request.location,
        imageUrl: request.imageUrl ? [request.imageUrl] : [] as any,
        artStyle: request.artStyle,
        ticketTypes: request.ticketTypes.map((tt) => ({
          name: tt.name,
          price: Number(tt.price),
          capacity: Number(tt.capacity),
          description: tt.description ? [tt.description] : [] as any,
        })),
      } as any

      const response = await this.eventsActor.createEvent(backendRequest)

      if ("ok" in response) {
        const event = response.ok as any
        return { ok: BigInt(event.id) }
      } else {
        console.error("Error creating event:", response)
        // Map backend error to frontend error
        const err = response as any
        if (err.err?.userNotAuthenticated !== undefined) {
          return { err: { NotAuthorized: null } }
        } else if (err.err?.invalidInput !== undefined) {
          return { err: { InvalidInput: null } }
        } else {
          return { err: { SystemError: null } }
        }
      }
    } catch (error) {
      console.error("Error calling createEvent:", error)
      return { err: { SystemError: null } }
    }
  }

  async mintTicket(request: MintTicketRequest): Promise<Result<bigint, Error>> {
    if (!this.ticketActor) {
      console.error("Ticket actor not initialized");
      return { err: { SystemError: null } };
    }

    try {
      // Convert request to backend format
      const backendRequest = {
        eventId: request.eventId.toString() as any,
        ticketTypeId: request.ticketTypeId.toString() as any,
      };

      const response = await (this.ticketActor as any).mintTicket(backendRequest);
      
      if ("ok" in response) {
        const ticket = response.ok as any;
        return { ok: BigInt(ticket.id) };
      } else {
        console.error("Error minting ticket:", response);
        // Map backend error to frontend error
        const err = response as any;
        if (err.err?.notFound !== undefined) {
          return { err: { NotFound: null } };
        } else if (err.err?.soldOut !== undefined) {
          return { err: { SoldOut: null } };
        } else if (err.err?.userNotAuthenticated !== undefined) {
          return { err: { NotAuthorized: null } };
        } else if (err.err?.eventNotActive !== undefined) {
          return { err: { CannotModify: null } };
        } else {
          return { err: { SystemError: null } };
        }
      }
    } catch (error) {
      console.error("Error calling mintTicket:", error);
      return { err: { SystemError: null } };
    }
  }

  async getUserTickets(user: Principal): Promise<Ticket[]> {
    if (!this.ticketActor) {
      console.error("Ticket actor not initialized");
      return [];
    }

    try {
      const response = await (this.ticketActor as any).getUserTickets();
      if ("ok" in response) {
        const tickets = response.ok as any[];
        return tickets.map((ticket) => this.mapTicketToFrontend(ticket));
      } else {
        console.error("Error fetching user tickets:", response);
        return [];
      }
    } catch (error) {
      console.error("Error calling getUserTickets:", error);
      return [];
    }
  }

  async getTicket(ticketId: bigint): Promise<Ticket | null> {
    if (!this.ticketActor) {
      console.error("Ticket actor not initialized");
      return null;
    }

    try {
      const response = await (this.ticketActor as any).getTicket(ticketId.toString() as any);
      if ("ok" in response) {
        return this.mapTicketToFrontend(response.ok);
      } else {
        console.error("Error fetching ticket:", response);
        return null;
      }
    } catch (error) {
      console.error("Error calling getTicket:", error);
      return null;
    }
  }

  async verifyTicket(ticketId: bigint): Promise<Result<boolean, Error>> {
    if (!this.ticketActor) {
      console.error("Ticket actor not initialized");
      return { err: { SystemError: null } };
    }

    try {
      const response = await (this.ticketActor as any).verifyTicket(ticketId.toString() as any);
      if ("ok" in response) {
        return { ok: response.ok };
      } else {
        console.error("Error verifying ticket:", response);
        // Map backend error to frontend error
        const err = response as any;
        if (err.err?.ticketNotFound !== undefined) {
          return { err: { NotFound: null } };
        } else if (err.err?.userNotAuthenticated !== undefined) {
          return { err: { NotAuthorized: null } };
        } else {
          return { err: { SystemError: null } };
        }
      }
    } catch (error) {
      console.error("Error calling verifyTicket:", error);
      return { err: { SystemError: null } };
    }
  }

  // Profile methods
  async createProfile(username: string, bio: string): Promise<Result<boolean, Error>> {
    if (!this.profileActor) {
      console.error("Profile actor not initialized")
      return { err: { SystemError: null } }
    }

    try {
      const response = await this.profileActor.createProfile(username, bio)
      if ("ok" in response) {
        return { ok: response.ok }
      } else {
        console.error("Error creating profile:", response)
        // Map backend error to frontend error
        const err = response as any
        if (err.err?.userNotAuthenticated !== undefined) {
          return { err: { NotAuthorized: null } }
        } else if (err.err?.profileAlreadyExists !== undefined) {
          return { err: { AlreadyExists: null } }
        } else {
          return { err: { SystemError: null } }
        }
      }
    } catch (error) {
      console.error("Error calling createProfile:", error)
      return { err: { SystemError: null } }
    }
  }

  async getProfile(): Promise<Result<{ username: string; bio: string }, Error>> {
    if (!this.profileActor) {
      console.error("Profile actor not initialized")
      return { err: { SystemError: null } }
    }

    try {
      const response = await this.profileActor.getProfile()
      if ("ok" in response) {
        return { ok: { username: response.ok.username, bio: response.ok.bio } }
      } else {
        console.error("Error fetching profile:", response)
        // Map backend error to frontend error
        const err = response as any
        if (err.err?.userNotAuthenticated !== undefined) {
          return { err: { NotAuthorized: null } }
        } else if (err.err?.profileNotFound !== undefined) {
          return { err: { NotFound: null } }
        } else {
          return { err: { SystemError: null } }
        }
      }
    } catch (error) {
      console.error("Error calling getProfile:", error)
      return { err: { SystemError: null } }
    }
  }
}

// Export a singleton instance
export const icApi = new IcApi()

