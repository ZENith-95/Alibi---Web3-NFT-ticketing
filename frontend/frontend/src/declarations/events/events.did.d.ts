import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface CreateEventRequest {
  'ticketTypes' : Array<CreateTicketTypeRequest>,
  'date' : string,
  'name' : string,
  'time' : string,
  'description' : string,
  'imageUrl' : [] | [string],
  'artStyle' : string,
  'location' : string,
}
export interface CreateTicketTypeRequest {
  'name' : string,
  'description' : [] | [string],
  'capacity' : bigint,
  'price' : bigint,
}
export type Error = { 'InvalidInput' : null } |
  { 'SoldOut' : null } |
  { 'SystemError' : null } |
  { 'NotFound' : null } |
  { 'NotAuthorized' : null } |
  { 'AlreadyExists' : null } |
  { 'CannotModify' : null };
export interface Event {
  'id' : bigint,
  'organizer' : Principal,
  'ticketTypes' : Array<TicketType>,
  'date' : string,
  'name' : string,
  'createdAt' : bigint,
  'time' : string,
  'description' : string,
  'isActive' : boolean,
  'imageUrl' : [] | [string],
  'artStyle' : string,
  'location' : string,
  'ticketsSold' : bigint,
  'totalCapacity' : bigint,
}
export interface MintTicketRequest {
  'eventId' : bigint,
  'ticketTypeId' : bigint,
  'imageUrl' : string,
}
export type Result = { 'ok' : boolean } |
  { 'err' : Error };
export type Result_1 = { 'ok' : bigint } |
  { 'err' : Error };
export type Result_2 = { 'ok' : Ticket } |
  { 'err' : Error };
export type Result_3 = { 'ok' : Event } |
  { 'err' : Error };
export interface Ticket {
  'id' : bigint,
  'eventId' : bigint,
  'ticketTypeId' : bigint,
  'owner' : Principal,
  'metadata' : TicketMetadata,
  'isUsed' : boolean,
  'mintedAt' : bigint,
}
export interface TicketMetadata {
  'name' : string,
  'description' : string,
  'imageUrl' : [] | [string],
  'attributes' : Array<[string, string]>,
}
export interface TicketType {
  'id' : bigint,
  'name' : string,
  'sold' : bigint,
  'description' : [] | [string],
  'capacity' : bigint,
  'price' : bigint,
}
export interface _SERVICE {
  'createEvent' : ActorMethod<[CreateEventRequest], Result_1>,
  'getAllEvents' : ActorMethod<[], Array<Event>>,
  'getEvent' : ActorMethod<[bigint], Result_3>,
  'getOrganizerEvents' : ActorMethod<[Principal], Array<Event>>,
  'getTicket' : ActorMethod<[bigint], Result_2>,
  'getTicketQRCode' : ActorMethod<[bigint], string>,
  'getUserTickets' : ActorMethod<[Principal], Array<Ticket>>,
  'mintTicket' : ActorMethod<[MintTicketRequest], Result_1>,
  'verifyTicket' : ActorMethod<[bigint], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
