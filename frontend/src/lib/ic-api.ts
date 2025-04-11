import type { Principal } from "@dfinity/principal"
import { Actor, HttpAgent, type Identity } from "@dfinity/agent"
import { Principal as PrincipalClass } from "@dfinity/principal"
import { generateQRCode } from "./qr-generator"
import { generateTicketImage } from "./image-generator"
import { safeString, safeBigInt } from "./utils/string-utils"
import { AuthClient } from "@dfinity/auth-client"

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

export interface Profile {
  username: string
  bio: string
}

export type GetProfileResponse = { ok: Profile } | { err: GetProfileError }
export type GetProfileError = { userNotAuthenticated: null } | { profileNotFound: null }

export type CreateProfileResponse = { ok: boolean } | { err: CreateProfileError }
export type CreateProfileError = { profileAlreadyExists: null } | { userNotAuthenticated: null }

export type Result<T, E> = { ok: T } | { err: E }

export type Error =
  | { NotFound: null }
  | { AlreadyExists: null }
  | { NotAuthorized: null }
  | { SoldOut: null }
  | { InvalidInput: null }
  | { CannotModify: null }
  | { SystemError: null }

// Import the IDL factory directly
const idlFactory = ({ IDL }: { IDL: any }) => {
  const TicketType = IDL.Record({
    id: IDL.Nat,
    name: IDL.Text,
    price: IDL.Nat,
    capacity: IDL.Nat,
    sold: IDL.Nat,
    description: IDL.Opt(IDL.Text),
  })

  const Event = IDL.Record({
    id: IDL.Nat,
    name: IDL.Text,
    description: IDL.Text,
    date: IDL.Text,
    time: IDL.Text,
    location: IDL.Text,
    organizer: IDL.Principal,
    imageUrl: IDL.Opt(IDL.Text),
    artStyle: IDL.Text,
    ticketTypes: IDL.Vec(TicketType),
    totalCapacity: IDL.Nat,
    ticketsSold: IDL.Nat,
    isActive: IDL.Bool,
    createdAt: IDL.Nat64,
  })

  const Error = IDL.Variant({
    NotFound: IDL.Null,
    AlreadyExists: IDL.Null,
    NotAuthorized: IDL.Null,
    SoldOut: IDL.Null,
    InvalidInput: IDL.Null,
    CannotModify: IDL.Null,
    SystemError: IDL.Null,
  })

  const Result = IDL.Variant({
    ok: IDL.Nat,
    err: Error,
  })

  const CreateTicketTypeRequest = IDL.Record({
    name: IDL.Text,
    price: IDL.Nat,
    capacity: IDL.Nat,
    description: IDL.Opt(IDL.Text),
  })

  const CreateEventRequest = IDL.Record({
    name: IDL.Text,
    description: IDL.Text,
    date: IDL.Text,
    time: IDL.Text,
    location: IDL.Text,
    imageUrl: IDL.Opt(IDL.Text),
    artStyle: IDL.Text,
    ticketTypes: IDL.Vec(CreateTicketTypeRequest),
  })

  const Result_1 = IDL.Variant({
    ok: Event,
    err: Error,
  })

  const TicketMetadata = IDL.Record({
    name: IDL.Text,
    description: IDL.Text,
    imageUrl: IDL.Opt(IDL.Text),
    attributes: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
  })

  const Ticket = IDL.Record({
    id: IDL.Nat,
    eventId: IDL.Nat,
    ticketTypeId: IDL.Nat,
    owner: IDL.Principal,
    isUsed: IDL.Bool,
    metadata: TicketMetadata,
    mintedAt: IDL.Nat64,
  })

  const Result_2 = IDL.Variant({
    ok: Ticket,
    err: Error,
  })

  const MintTicketRequest = IDL.Record({
    eventId: IDL.Nat,
    ticketTypeId: IDL.Nat,
    imageUrl: IDL.Text,
  })

  const Result_3 = IDL.Variant({
    ok: IDL.Bool,
    err: Error,
  })

  const Profile = IDL.Record({
    username: IDL.Text,
    bio: IDL.Text,
  })

  const GetProfileError = IDL.Variant({
    userNotAuthenticated: IDL.Null,
    profileNotFound: IDL.Null,
  })

  const GetProfileResponse = IDL.Variant({
    ok: Profile,
    err: GetProfileError,
  })

  const CreateProfileError = IDL.Variant({
    profileAlreadyExists: IDL.Null,
    userNotAuthenticated: IDL.Null,
  })

  const CreateProfileResponse = IDL.Variant({
    ok: IDL.Bool,
    err: CreateProfileError,
  })

  return IDL.Service({
    createEvent: IDL.Func([CreateEventRequest], [Result], []),
    createProfile: IDL.Func([IDL.Text, IDL.Text], [CreateProfileResponse], []),
    getAllEvents: IDL.Func([], [IDL.Vec(Event)], ["query"]),
    getEvent: IDL.Func([IDL.Nat], [Result_1], ["query"]),
    getOrganizerEvents: IDL.Func([IDL.Principal], [IDL.Vec(Event)], ["query"]),
    getProfile: IDL.Func([], [GetProfileResponse], ["query"]),
    getTicket: IDL.Func([IDL.Nat], [Result_2], ["query"]),
    getUserTickets: IDL.Func([IDL.Principal], [IDL.Vec(Ticket)], ["query"]),
    mintTicket: IDL.Func([MintTicketRequest], [Result], []),
    verifyTicket: IDL.Func([IDL.Nat], [Result_3], []),
  })
}

// Define the _SERVICE type based on the IDL
type _SERVICE = {
  createEvent: (request: any) => Promise<any>
  createProfile: (username: string, bio: string) => Promise<any>
  getAllEvents: () => Promise<any[]>
  getEvent: (eventId: bigint) => Promise<any>
  getOrganizerEvents: (organizer: any) => Promise<any[]>
  getProfile: () => Promise<any>
  getTicket: (ticketId: bigint) => Promise<any>
  getUserTickets: (user: any) => Promise<any[]>
  mintTicket: (request: any) => Promise<any>
  verifyTicket: (ticketId: bigint) => Promise<any>
}

// Real API implementation for Internet Computer backend
export class IcApi {
  private actor: _SERVICE | null = null
  private profileActor: any | null = null
  private agent: HttpAgent | null = null
  private identity: Identity | null = null
  private canisterId: string = process.env.NEXT_PUBLIC_EVENTS_CANISTER_ID || "rrkah-fqaaa-aaaaa-aaaaq-cai"
  private profileCanisterId: string = process.env.NEXT_PUBLIC_PROFILE_CANISTER_ID || "avqkn-guaaa-aaaaa-qaaea-cai"
  private host: string = process.env.NEXT_PUBLIC_IC_HOST || "http://localhost:4943"

  // Cache for events and tickets to improve performance
  private eventsCache: Map<string, Event> = new Map()
  private ticketsCache: Map<string, Ticket> = new Map()
  private userTicketsCache: Map<string, Ticket[]> = new Map()
  private organizerEventsCache: Map<string, Event[]> = new Map()

  // Event listeners for real-time updates
  private eventListeners: Map<string, Set<() => void>> = new Map([
    ["event-created", new Set()],
    ["ticket-minted", new Set()],
    ["event-updated", new Set()],
    ["ticket-used", new Set()],
  ])

  constructor() {
    this.initializeActor()
  }

  private async initializeActor() {
    try {
      // Validate canister IDs
      if (!this.canisterId || !this.profileCanisterId) {
        throw new Error("Canister IDs not configured")
      }

      // Create a new agent first
      this.agent = new HttpAgent({
        host: this.host,
      })

      // Always fetch the root key in development mode
      if (process.env.NODE_ENV !== "production" || this.host.includes("localhost")) {
        try {
          console.log("Fetching root key...")
          await this.agent.fetchRootKey()
          console.log("Successfully fetched root key")
        } catch (error) {
          console.error("Failed to fetch root key:", error)
          throw error
        }
      }

      // Then handle identity
      if (!this.identity) {
        try {
          const authClient = await AuthClient.create()
          if (!authClient) {
            throw new Error("Failed to initialize identity")
          }
          this.identity = authClient.getIdentity()
          this.agent.replaceIdentity(this.identity)
        } catch (error) {
          console.error("Failed to initialize identity:", error)
          // Continue without identity for query calls
        }
      } else {
        this.agent.replaceIdentity(this.identity)
      }

      // Initialize events actor with the new agent
      this.actor = Actor.createActor(idlFactory, {
        agent: this.agent,
        canisterId: this.canisterId,
      })

      // Initialize profile actor with the new agent
      const profileIdlFactory = ({ IDL }: { IDL: any }) => {
        const Profile = IDL.Record({
          username: IDL.Text,
          bio: IDL.Text,
        })

        const GetProfileError = IDL.Variant({
          userNotAuthenticated: IDL.Null,
          profileNotFound: IDL.Null,
        })

        const GetProfileResponse = IDL.Variant({
          ok: Profile,
          err: GetProfileError,
        })

        const CreateProfileError = IDL.Variant({
          profileAlreadyExists: IDL.Null,
          userNotAuthenticated: IDL.Null,
        })

        const CreateProfileResponse = IDL.Variant({
          ok: IDL.Bool,
          err: CreateProfileError,
        })

        return IDL.Service({
          createProfile: IDL.Func([IDL.Text, IDL.Text], [CreateProfileResponse], []),
          getProfile: IDL.Func([], [GetProfileResponse], []),
          getProfileByPrincipal: IDL.Func([IDL.Principal], [GetProfileResponse], []),
        })
      }

      this.profileActor = Actor.createActor(profileIdlFactory, {
        agent: this.agent,
        canisterId: this.profileCanisterId,
      })

      console.log("Successfully initialized actors")
    } catch (error) {
      console.error("Error initializing actor:", error)
      throw error
    }
  }

  // Method to set identity when user connects wallet
  public async setIdentity(identity: Identity) {
    try {
      this.identity = identity

      if (!this.agent) {
        throw new Error("Agent not initialized")
      }

      this.agent.replaceIdentity(identity)

      // Recreate the actor with the new identity
      this.actor = Actor.createActor<_SERVICE>(idlFactory, {
        agent: this.agent,
        canisterId: this.canisterId,
      })

      // Recreate the profile actor with the new identity
      this.profileActor = Actor.createActor(profileIdlFactory, {
        agent: this.agent,
        canisterId: this.profileCanisterId,
      })
    } catch (error) {
      console.error("Error setting identity:", error)
      throw error
    }
  }

  private clearCaches() {
    this.eventsCache.clear()
    this.ticketsCache.clear()
    this.userTicketsCache.clear()
    this.organizerEventsCache.clear()
  }

  // Event listener methods
  public addEventListener(event: string, callback: () => void) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)?.add(callback)
    }
  }

  public removeEventListener(event: string, callback: () => void) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)?.delete(callback)
    }
  }

  private notifyListeners(event: string) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)?.forEach((callback) => callback())
    }
  }

  // Profile Methods
  async getProfile(): Promise<GetProfileResponse> {
    try {
      if (!this.profileActor) {
        await this.initializeActor()
      }

      if (!this.identity) {
        return { err: { userNotAuthenticated: null } }
      }

      if (this.profileActor) {
        try {
          const result = await this.profileActor.getProfile()
          console.log('Profile fetch result:', result)
          return result
        } catch (actorError) {
          console.error("Profile actor call failed:", actorError)
          // Try to reinitialize the actor and retry once
          await this.initializeActor()
          if (this.profileActor) {
            const retryResult = await this.profileActor.getProfile()
            return retryResult
          }
          throw actorError
        }
      }

      throw new Error("Profile actor not initialized")
    } catch (error) {
      console.error("Error fetching profile:", error)
      return { err: { userNotAuthenticated: null } }
    }
  }

  async createProfile(username: string, bio: string): Promise<CreateProfileResponse> {
    try {
      if (!this.profileActor) {
        await this.initializeActor()
      }

      if (!this.identity) {
        return { err: { userNotAuthenticated: null } }
      }

      if (this.profileActor) {
        try {
          // Make sure username and bio are strings
          const sanitizedUsername = safeString(username)
          const sanitizedBio = safeString(bio)

          console.log('Creating profile with:', { username: sanitizedUsername, bio: sanitizedBio })
          const result = await this.profileActor.createProfile(sanitizedUsername, sanitizedBio)
          console.log('Profile creation result:', result)
          return result
        } catch (actorError) {
          console.error("Profile actor call failed:", actorError)
          // Try to reinitialize the actor and retry once
          await this.initializeActor()
          if (this.profileActor) {
            const retryResult = await this.profileActor.createProfile(
              safeString(username),
              safeString(bio)
            )
            return retryResult
          }
          throw actorError
        }
      }

      throw new Error("Profile actor not initialized")
    } catch (error) {
      console.error("Error creating profile:", error)
      return { err: { userNotAuthenticated: null } }
    }
  }

  // Event Methods
  async getAllEvents(): Promise<Event[]> {
    try {
      if (!this.actor) {
        await this.initializeActor()
      }

      if (this.actor) {
        try {
          // Create a new agent for this call to ensure fresh state
          const agent = new HttpAgent({
            host: this.host,
          })

          if (process.env.NODE_ENV !== "production" || this.host.includes("localhost")) {
            await agent.fetchRootKey()
          }

          if (this.identity) {
            agent.replaceIdentity(this.identity)
          }

          // Create a new actor with the fresh agent
          const freshActor = Actor.createActor(idlFactory, {
            agent,
            canisterId: this.canisterId,
          })

          const result = await freshActor.getAllEvents()

          // Transform the result to our Event interface
          const events: Event[] = result.map((event) => this.transformCanisterEvent(event))

          // Update cache
          events.forEach((event) => {
            this.eventsCache.set(event.id.toString(), event)
          })

          return events
        } catch (error) {
          console.warn("Actor call failed in getAllEvents:", error)

          // Mock implementation for development
          if (process.env.NODE_ENV !== "production") {
            console.log("Using mock events data")
            return []
          } else {
            throw error
          }
        }
      }

      throw new Error("Actor not initialized")
    } catch (error) {
      console.error("Error fetching all events:", error)
      // Fallback to cache if available
      return Array.from(this.eventsCache.values())
    }
  }

  async getEvent(eventId: bigint): Promise<Event | null> {
    try {
      // Check cache first
      const cachedEvent = this.eventsCache.get(eventId.toString())
      if (cachedEvent) {
        return cachedEvent
      }

      if (!this.actor) {
        await this.initializeActor()
      }

      if (this.actor) {
        try {
          const result = await this.actor.getEvent(eventId)

          if ("ok" in result) {
            const event = this.transformCanisterEvent(result.ok)

            // Update cache
            this.eventsCache.set(eventId.toString(), event)

            return event
          }

          return null
        } catch (error) {
          console.warn("Actor call failed in getEvent, using mock implementation:", error)

          // Mock implementation for development
          if (process.env.NODE_ENV !== "production") {
            console.log("Using mock event data")
            return null
          } else {
            throw error
          }
        }
      }

      throw new Error("Actor not initialized")
    } catch (error) {
      console.error(`Error fetching event ${eventId}:`, error)
      return null
    }
  }

  async getOrganizerEvents(organizer: Principal): Promise<Event[]> {
    try {
      // Check cache first
      const principalString = organizer.toString()
      const cachedEvents = this.organizerEventsCache.get(principalString)
      if (cachedEvents) {
        return cachedEvents
      }

      if (!this.actor) {
        await this.initializeActor()
      }

      if (this.actor) {
        try {
          // Ensure organizer is properly handled
          console.log("Fetching events for organizer:", principalString)

          const result = await this.actor.getOrganizerEvents(organizer)

          // Transform the result to our Event interface
          const events: Event[] = result.map((event) => this.transformCanisterEvent(event))

          // Update cache
          this.organizerEventsCache.set(principalString, events)
          events.forEach((event) => {
            this.eventsCache.set(event.id.toString(), event)
          })

          return events
        } catch (actorError) {
          console.warn("Actor call failed in getOrganizerEvents, using mock implementation:", actorError)

          // Mock implementation for development
          if (process.env.NODE_ENV !== "production") {
            console.log("Using mock events data")
            // Return empty array for now
            return []
          } else {
            throw actorError
          }
        }
      }

      throw new Error("Actor not initialized")
    } catch (error) {
      console.error(`Error fetching organizer events for ${organizer.toString()}:`, error)
      // Fallback to cache if available or return empty array
      return this.organizerEventsCache.get(organizer.toString()) || []
    }
  }

  async createEvent(request: CreateEventRequest): Promise<Result<bigint, Error>> {
    try {
      // Ensure actor and identity are initialized
      if (!this.actor || !this.identity) {
        await this.initializeActor()
        if (!this.actor || !this.identity) {
          throw new Error("Failed to initialize actor")
        }
      }

      // Transform the request into canister format
      const canisterRequest = this.transformCreateEventRequest(request)

      console.log("Creating event with request:", canisterRequest)

      // Call the canister's createEvent method
      const result = await this.actor.createEvent(canisterRequest)

      console.log("Event creation result:", result)

      if ('err' in result) {
        return result
      }

      // Clear the organizer events cache and notify listeners
      this.organizerEventsCache.clear()
      this.notifyListeners("event-created")

      return result
    } catch (error) {
      console.error("Error creating event:", error)
      return { err: { SystemError: null } }
    }
  }

  async mintTicket(request: MintTicketRequest): Promise<Result<bigint, Error>> {
    try {
      if (!this.actor) {
        await this.initializeActor()
      }

      if (!this.identity) {
        return { err: { NotAuthorized: null } }
      }

      if (this.actor) {
        try {
          // Get the event to generate the ticket image
          const event = await this.getEvent(request.eventId)
          if (!event) {
            return { err: { NotFound: null } }
          }

          // Get the ticket type
          const ticketType = event.ticketTypes.find((tt) => tt.id === request.ticketTypeId)
          if (!ticketType) {
            return { err: { NotFound: null } }
          }

          // Generate ticket image
          const artStyle = event.artStyle
          const ticketImageUrl = await generateTicketImage(
            event.name,
            ticketType.name,
            event.date,
            event.time,
            event.location,
            artStyle,
          )

          // Mint the ticket with the generated image
          const mintRequest = {
            eventId: request.eventId,
            ticketTypeId: request.ticketTypeId,
            imageUrl: ticketImageUrl,
          }

          const result = await this.actor.mintTicket(mintRequest)

          if ("ok" in result) {
            // Clear user tickets cache
            const owner = this.identity.getPrincipal()
            this.userTicketsCache.delete(owner.toString())

            // Update event cache
            this.eventsCache.delete(request.eventId.toString())

            // Notify listeners
            this.notifyListeners("ticket-minted")

            return { ok: result.ok }
          }

          return result
        } catch (error) {
          console.warn("Actor call failed in mintTicket, using mock implementation:", error)

          // Mock implementation for development
          if (process.env.NODE_ENV !== "production") {
            console.log("Using mock ticket minting")
            return { ok: BigInt(Date.now()) }
          } else {
            throw error
          }
        }
      }

      throw new Error("Actor not initialized")
    } catch (error) {
      console.error("Error minting ticket:", error)
      return { err: { SystemError: null } }
    }
  }

  async getUserTickets(user: Principal): Promise<Ticket[]> {
    try {
      // Check cache first
      const principalString = user.toString()
      const cachedTickets = this.userTicketsCache.get(principalString)
      if (cachedTickets) {
        return cachedTickets
      }

      if (!this.actor) {
        await this.initializeActor()
      }

      if (this.actor) {
        try {
          const result = await this.actor.getUserTickets(user)

          // Transform the result to our Ticket interface
          const tickets: Ticket[] = result.map((ticket) => this.transformCanisterTicket(ticket))

          // Update cache
          this.userTicketsCache.set(principalString, tickets)
          tickets.forEach((ticket) => {
            this.ticketsCache.set(ticket.id.toString(), ticket)
          })

          return tickets
        } catch (actorError) {
          console.warn("Actor call failed in getUserTickets, using mock implementation:", actorError)

          // Mock implementation for development
          if (process.env.NODE_ENV !== "production") {
            console.log("Using mock tickets data")
            // Return empty array for now
            return []
          } else {
            throw actorError
          }
        }
      }

      throw new Error("Actor not initialized")
    } catch (error) {
      console.error(`Error fetching user tickets for ${user.toString()}:`, error)
      // Fallback to cache if available or return empty array
      return this.userTicketsCache.get(user.toString()) || []
    }
  }

  async getTicket(ticketId: bigint): Promise<Ticket | null> {
    try {
      // Check cache first
      const ticketIdString = ticketId.toString()
      const cachedTicket = this.ticketsCache.get(ticketIdString)
      if (cachedTicket) {
        return cachedTicket
      }

      if (!this.actor) {
        await this.initializeActor()
      }

      if (this.actor) {
        try {
          const result = await this.actor.getTicket(ticketId)

          if ("ok" in result) {
            const ticket = this.transformCanisterTicket(result.ok)

            // Update cache
            this.ticketsCache.set(ticketIdString, ticket)

            return ticket
          }

          return null
        } catch (error) {
          console.warn("Actor call failed in getTicket, using mock implementation:", error)

          // Mock implementation for development
          if (process.env.NODE_ENV !== "production") {
            console.log("Using mock ticket data")
            return null
          } else {
            throw error
          }
        }
      }

      throw new Error("Actor not initialized")
    } catch (error) {
      console.error(`Error fetching ticket ${ticketId}:`, error)
      return null
    }
  }

  async verifyTicket(ticketId: bigint): Promise<Result<boolean, Error>> {
    try {
      if (!this.actor) {
        await this.initializeActor()
      }

      if (!this.identity) {
        return { err: { NotAuthorized: null } }
      }

      if (this.actor) {
        try {
          const result = await this.actor.verifyTicket(ticketId)

          if ("ok" in result) {
            // Clear caches
            this.ticketsCache.delete(ticketId.toString())
            this.userTicketsCache.clear()

            // Notify listeners
            this.notifyListeners("ticket-used")

            return { ok: result.ok }
          }

          return result
        } catch (error) {
          console.warn("Actor call failed in verifyTicket, using mock implementation:", error)

          // Mock implementation for development
          if (process.env.NODE_ENV !== "production") {
            console.log("Using mock ticket verification")
            return { ok: true }
          } else {
            throw error
          }
        }
      }

      throw new Error("Actor not initialized")
    } catch (error) {
      console.error(`Error verifying ticket ${ticketId}:`, error)
      return { err: { SystemError: null } }
    }
  }

  async getTicketQRCode(ticketId: bigint): Promise<string> {
    try {
      const ticket = await this.getTicket(ticketId)

      if (!ticket) {
        throw new Error("Ticket not found")
      }

      // Generate QR code SVG
      const qrData = JSON.stringify({
        id: ticket.id.toString(),
        eventId: ticket.eventId.toString(),
        owner: ticket.owner.toString(),
      })

      const qrCodeSvg = await generateQRCode(qrData)
      return qrCodeSvg
    } catch (error) {
      console.error(`Error generating QR code for ticket ${ticketId}:`, error)
      throw error
    }
  }

  // Helper methods to transform canister data to our interfaces
  private transformCanisterEvent(canisterEvent: any): Event {
    try {
      // Ensure all fields are properly typed
      return {
        id: safeBigInt(canisterEvent.id),
        name: safeString(canisterEvent.name),
        description: safeString(canisterEvent.description),
        date: safeString(canisterEvent.date),
        time: safeString(canisterEvent.time),
        location: safeString(canisterEvent.location),
        organizer: canisterEvent.organizer,
        imageUrl: canisterEvent.imageUrl ? safeString(canisterEvent.imageUrl[0]) : null,
        artStyle: safeString(canisterEvent.artStyle),
        ticketTypes: Array.isArray(canisterEvent.ticketTypes)
          ? canisterEvent.ticketTypes.map((tt: any) => this.transformCanisterTicketType(tt))
          : [],
        totalCapacity: safeBigInt(canisterEvent.totalCapacity),
        ticketsSold: safeBigInt(canisterEvent.ticketsSold),
        isActive: Boolean(canisterEvent.isActive),
        createdAt: safeBigInt(canisterEvent.createdAt),
      }
    } catch (error) {
      console.error("Error transforming canister event:", error, canisterEvent)
      // Return a default event object
      return {
        id: BigInt(0),
        name: "Error loading event",
        description: "There was an error loading this event",
        date: "",
        time: "",
        location: "",
        organizer: canisterEvent.organizer || PrincipalClass.anonymous(),
        imageUrl: null,
        artStyle: "",
        ticketTypes: [],
        totalCapacity: BigInt(0),
        ticketsSold: BigInt(0),
        isActive: false,
        createdAt: BigInt(Date.now()),
      }
    }
  }

  private transformCanisterTicketType(canisterTicketType: any): TicketType {
    try {
      return {
        id: safeBigInt(canisterTicketType.id),
        name: safeString(canisterTicketType.name),
        price: safeBigInt(canisterTicketType.price),
        capacity: safeBigInt(canisterTicketType.capacity),
        sold: safeBigInt(canisterTicketType.sold),
        description:
          canisterTicketType.description && canisterTicketType.description.length > 0
            ? safeString(canisterTicketType.description[0])
            : null,
      }
    } catch (error) {
      console.error("Error transforming ticket type:", error, canisterTicketType)
      // Return a default ticket type
      return {
        id: BigInt(0),
        name: "Error loading ticket type",
        price: BigInt(0),
        capacity: BigInt(0),
        sold: BigInt(0),
        description: null,
      }
    }
  }

  private transformCanisterTicket(canisterTicket: any): Ticket {
    try {
      return {
        id: safeBigInt(canisterTicket.id),
        eventId: safeBigInt(canisterTicket.eventId),
        ticketTypeId: safeBigInt(canisterTicket.ticketTypeId),
        owner: canisterTicket.owner,
        isUsed: Boolean(canisterTicket.isUsed),
        metadata: {
          name: safeString(canisterTicket.metadata?.name),
          description: safeString(canisterTicket.metadata?.description),
          imageUrl:
            canisterTicket.metadata?.imageUrl && canisterTicket.metadata.imageUrl.length > 0
              ? safeString(canisterTicket.metadata.imageUrl[0])
              : null,
          attributes: Array.isArray(canisterTicket.metadata?.attributes)
            ? canisterTicket.metadata.attributes.map((attr: any) => [safeString(attr[0]), safeString(attr[1])])
            : [],
        },
        mintedAt: safeBigInt(canisterTicket.mintedAt),
      }
    } catch (error) {
      console.error("Error transforming ticket:", error, canisterTicket)
      // Return a default ticket
      return {
        id: BigInt(0),
        eventId: BigInt(0),
        ticketTypeId: BigInt(0),
        owner: canisterTicket.owner || PrincipalClass.anonymous(),
        isUsed: false,
        metadata: {
          name: "Error loading ticket",
          description: "There was an error loading this ticket",
          imageUrl: null,
          attributes: [],
        },
        mintedAt: BigInt(Date.now()),
      }
    }
  }

  private transformCreateEventRequest(request: CreateEventRequest): any {
    try {
      // Transform ticket types
      const ticketTypes = request.ticketTypes.map((tt) => ({
        name: safeString(tt.name),
        price: BigInt(tt.price),
        capacity: BigInt(tt.capacity),
        description: tt.description ? [safeString(tt.description)] : [],
      }))

      // Transform the request
      return {
        name: safeString(request.name),
        description: safeString(request.description),
        date: safeString(request.date),
        time: safeString(request.time),
        location: safeString(request.location),
        imageUrl: request.imageUrl ? [safeString(request.imageUrl)] : [],
        artStyle: safeString(request.artStyle || "modern"),
        ticketTypes,
      }
    } catch (error) {
      console.error("Error transforming create event request:", error)
      throw error
    }
  }
}

// Export a singleton instance
export const icApi = new IcApi()

