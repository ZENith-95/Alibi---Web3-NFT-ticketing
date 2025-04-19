import { CandidCanister } from "@bundly/ares-core";
import { _SERVICE as EventsService, idlFactory as eventsIdlFactory } from "../declarations/events/events.did.js";
import { _SERVICE as ProfileService, idlFactory as profileIdlFactory } from "../declarations/profile/profile.did.js";
import { _SERVICE as TicketService, idlFactory as ticketIdlFactory } from "../declarations/ticket/ticket.did.js";

export type EventsActor = EventsService;
export type ProfileActor = ProfileService;
export type TicketActor = TicketService;

export type CandidActors = {
  events: EventsActor;
  profile: ProfileActor;
  ticket: TicketActor;
};

export let candidCanisters: Record<keyof CandidActors, CandidCanister> = {
  events: {
    idlFactory: eventsIdlFactory,
    actorConfig: {
      canisterId: process.env.NEXT_PUBLIC_EVENTS_CANISTER_ID!,
    },
  },
  profile: {
    idlFactory: profileIdlFactory,
    actorConfig: {
      canisterId: process.env.NEXT_PUBLIC_PROFILE_CANISTER_ID!,
    },
  },
  ticket: {
    idlFactory: ticketIdlFactory,
    actorConfig: {
      canisterId: process.env.NEXT_PUBLIC_TICKET_CANISTER_ID!,
    },
  },
};
