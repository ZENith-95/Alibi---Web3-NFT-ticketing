import { idlFactory } from "@/declarations/events";
import { Actor } from "@dfinity/agent";
import { createAgent } from "./shared"
import { EventType } from "@/types/events";


type EventCanisterServices = {
    createEvent: (request: any) => Promise<bigint>
    createProfile: (username: string, bio: string) => Promise<any>
    getAllEvents: () => Promise<EventType[]>
    deleteEvent: (id: bigint) => Promise<void>
    getEvent: (eventId: bigint) => Promise<any>
    getOrganizerEvents: (organizer: any) => Promise<any[]>
    getProfile: () => Promise<any>
    getTicket: (ticketId: bigint) => Promise<any>
    getUserTickets: (user: any) => Promise<any[]>
    mintTicket: (request: any) => Promise<any>
    verifyTicket: (ticketId: bigint) => Promise<any>
}
export const eventsCanister = Actor.createActor<EventCanisterServices>(idlFactory, {
    canisterId: process.env.NEXT_PUBLIC_EVENTS_CANISTER_ID || "a4tbr-q4aaa-aaaaa-qaafq-cai",
    agent: createAgent()
});