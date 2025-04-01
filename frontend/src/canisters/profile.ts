import { ActorSubclass } from "@dfinity/agent";
import { CandidCanister } from "@bundly/ares-core";
import { _SERVICE, idlFactory } from "../declarations/profile/profile.did.js";

export type ProfileActor = ActorSubclass<_SERVICE>;

export const profile: CandidCanister = {
  idlFactory,
  actorConfig: {
    canisterId: process.env.NEXT_PUBLIC_PROFILE_CANISTER_ID!,
  },
}; 