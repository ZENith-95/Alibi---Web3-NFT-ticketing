import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

// Import generated IDL factories
import { idlFactory as profileIdlFactory } from '../../../declarations/alibi_backend/alibi_backend.did.js';
import { idlFactory as eventIdlFactory } from '../../../declarations/alibi_events/alibi_events.did.js';
import { idlFactory as containerFactory } from '../../../declarations/alibi_container/alibi_container.did.js';

// Import Candid types
import type { _SERVICE as ProfileService } from '../../../declarations/alibi_backend/alibi_backend.did';
import type { _SERVICE as EventService, Event, CreateEventRequest } from '../../../declarations/alibi_events/alibi_events.did';

// Re-export types for easier usage
export type { Event, CreateEventRequest };

// Define canister IDs (replace with your actual canister IDs)
const PROFILE_CANISTER_ID = process.env.CANISTER_ID_ALIBI_BACKEND || '';
const EVENT_CANISTER_ID = process.env.CANISTER_ID_ALIBI_EVENTS || '';
const CONTAINER_CANISTER_ID = process.env.CANISTER_ID_ALIBI_CONTAINER || '';

// Define the host (defaults to local replica)
const HOST = process.env.DFX_NETWORK === 'ic' ? 'https://icp-api.io' : 'http://localhost:4943';

class IcApi {
  private agent: HttpAgent;
  private profileActor: any; // Using 'any' instead of generic Actor type
  private eventActor: any;   // Using 'any' instead of generic Actor type
  private containerActor: any;
  constructor() {
    this.agent = new HttpAgent({ host: HOST });

    // Initialize actors with default anonymous identity
    this.profileActor = this.createActor(profileIdlFactory, PROFILE_CANISTER_ID);
    this.eventActor = this.createActor(eventIdlFactory, EVENT_CANISTER_ID);
    this.containerActor = this.createActor(containerFactory,CONTAINER_CANISTER_ID)

    // Fetch root key for local development
    if (process.env.DFX_NETWORK !== 'ic') {
      this.agent.fetchRootKey().catch(err => {
        console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
        console.error(err);
      });
    }
  }

  // Helper function to create actors
  private createActor(idlFactory: any, canisterId: string): any {
    return Actor.createActor(idlFactory, {
      agent: this.agent,
      canisterId,
    });
  }

  // Update identity for authenticated calls
  public updateIdentity(identity: any | null) {
    if (identity) {
      this.agent = new HttpAgent({ host: HOST, identity });
    } else {
      this.agent = new HttpAgent({ host: HOST }); // Reset to anonymous
    }
    // Re-create actors with the new agent
    this.profileActor = this.createActor(profileIdlFactory, PROFILE_CANISTER_ID);
    this.eventActor = this.createActor(eventIdlFactory, EVENT_CANISTER_ID);
  }

  // --- Profile Canister Methods ---
  async createProfile(username: string, bio: string): Promise<any> {
    return this.profileActor.createProfile(username, bio);
  }

  async getProfile(): Promise<any> {
    return this.profileActor.getProfile();
  }

  async updateProfile(username: string, bio: string): Promise<any> {
    return this.profileActor.updateProfile(username, bio);
  }

  // --- Event Canister Methods ---
  async createEvent(request: CreateEventRequest): Promise<any> {

    return this.eventActor.createEvent(request);
  }

  async getAllEvents(): Promise<Event[]> {
    return this.eventActor.getAllEvents();
  }

  async getEvent(eventId: bigint): Promise<any> {
    return this.eventActor.getEvent(eventId);
  }

  async getOrganizerEvents(principal: Principal): Promise<Event[]> {
    return this.eventActor.getOrganizerEvents(principal);
  }

  async mintTicket(eventId: bigint, ticketTypeId: bigint, imageUrl: string): Promise<any> {
    // Assuming MintTicketRequest structure matches these params
    const request = { eventId, ticketTypeId, imageUrl };
    return this.eventActor.mintTicket(request);
  }

  async getUserTickets(principal: Principal): Promise<any> {
    // Assuming getUserTickets takes a Principal
    return this.eventActor.getUserTickets(principal);
  }

  async verifyTicket(ticketId: bigint): Promise<any> {
    // Assuming verifyTicket takes a ticketId
    return this.eventActor.verifyTicket(ticketId);
  }
}

export const icApi = new IcApi();
