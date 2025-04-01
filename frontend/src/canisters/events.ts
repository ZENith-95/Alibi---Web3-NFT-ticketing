import { ActorSubclass } from "@dfinity/agent";
import { CandidCanister } from "@bundly/ares-core";
import { _SERVICE, idlFactory } from "../declarations/events/events.did.js";

export type EventsActor = ActorSubclass<_SERVICE>;

export const events: CandidCanister = {
  idlFactory,
  actorConfig: {
    canisterId: process.env.NEXT_PUBLIC_EVENTS_CANISTER_ID!,
  },
}; 