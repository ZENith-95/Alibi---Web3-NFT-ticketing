import { CandidCanister } from "@bundly/ares-core";
import { EventsActor, events } from "./events";
import { ProfileActor, profile } from "./profile";

// Remove the test import since we're not using it
// import { TestActor, test } from "./test";

export type CandidActors = {
  events: EventsActor;
  profile: ProfileActor;
  // Remove test from the actors
  // test: TestActor;
};

export let candidCanisters: Record<keyof CandidActors, CandidCanister> = {
  events,
  profile,
  // Remove test from the canisters
  // test,
};
