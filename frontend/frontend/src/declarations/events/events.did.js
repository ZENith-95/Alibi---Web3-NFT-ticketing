export const idlFactory = ({ IDL }) => {
  const CreateTicketTypeRequest = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Opt(IDL.Text),
    'capacity' : IDL.Nat,
    'price' : IDL.Nat,
  });
  const CreateEventRequest = IDL.Record({
    'ticketTypes' : IDL.Vec(CreateTicketTypeRequest),
    'date' : IDL.Text,
    'name' : IDL.Text,
    'time' : IDL.Text,
    'description' : IDL.Text,
    'imageUrl' : IDL.Opt(IDL.Text),
    'artStyle' : IDL.Text,
    'location' : IDL.Text,
  });
  const Error = IDL.Variant({
    'InvalidInput' : IDL.Null,
    'SoldOut' : IDL.Null,
    'SystemError' : IDL.Null,
    'NotFound' : IDL.Null,
    'NotAuthorized' : IDL.Null,
    'AlreadyExists' : IDL.Null,
    'CannotModify' : IDL.Null,
  });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : Error });
  const TicketType = IDL.Record({
    'id' : IDL.Nat,
    'name' : IDL.Text,
    'sold' : IDL.Nat,
    'description' : IDL.Opt(IDL.Text),
    'capacity' : IDL.Nat,
    'price' : IDL.Nat,
  });
  const Event = IDL.Record({
    'id' : IDL.Nat,
    'organizer' : IDL.Principal,
    'ticketTypes' : IDL.Vec(TicketType),
    'date' : IDL.Text,
    'name' : IDL.Text,
    'createdAt' : IDL.Nat64,
    'time' : IDL.Text,
    'description' : IDL.Text,
    'isActive' : IDL.Bool,
    'imageUrl' : IDL.Opt(IDL.Text),
    'artStyle' : IDL.Text,
    'location' : IDL.Text,
    'ticketsSold' : IDL.Nat,
    'totalCapacity' : IDL.Nat,
  });
  const Result_3 = IDL.Variant({ 'ok' : Event, 'err' : Error });
  const TicketMetadata = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Text,
    'imageUrl' : IDL.Opt(IDL.Text),
    'attributes' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
  });
  const Ticket = IDL.Record({
    'id' : IDL.Nat,
    'eventId' : IDL.Nat,
    'ticketTypeId' : IDL.Nat,
    'owner' : IDL.Principal,
    'metadata' : TicketMetadata,
    'isUsed' : IDL.Bool,
    'mintedAt' : IDL.Nat64,
  });
  const Result_2 = IDL.Variant({ 'ok' : Ticket, 'err' : Error });
  const MintTicketRequest = IDL.Record({
    'eventId' : IDL.Nat,
    'ticketTypeId' : IDL.Nat,
    'imageUrl' : IDL.Text,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Bool, 'err' : Error });
  return IDL.Service({
    'createEvent' : IDL.Func([CreateEventRequest], [Result_1], []),
    'getAllEvents' : IDL.Func([], [IDL.Vec(Event)], ['query']),
    'getEvent' : IDL.Func([IDL.Nat], [Result_3], ['query']),
    'getOrganizerEvents' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Event)],
        ['query'],
      ),
    'getTicket' : IDL.Func([IDL.Nat], [Result_2], ['query']),
    'getTicketQRCode' : IDL.Func([IDL.Nat], [IDL.Text], ['query']),
    'getUserTickets' : IDL.Func([IDL.Principal], [IDL.Vec(Ticket)], ['query']),
    'mintTicket' : IDL.Func([MintTicketRequest], [Result_1], []),
    'verifyTicket' : IDL.Func([IDL.Nat], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
