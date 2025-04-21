import Bool "mo:base/Bool";
import Array "mo:base/Array";
import Types "./Types";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Debug "mo:base/Debug";
import Result "mo:base/Result";
import Buffer "mo:base/Buffer";
import Time "mo:base/Time";

import Events "canister:events";

actor Tickets {
  type Event = Types.Event;
  type EventId = Types.EventId;
  type Ticket = Types.Ticket;
  type TicketId = Types.TicketId;
  type TicketMetadata = Types.TicketMetadata;
  type MintTicketRequest = Types.MintTicketRequest;
  type MintTicketResponse = Types.MintTicketResponse;
  type GetTicketResponse = Types.GetTicketResponse;
  type GetTicketsResponse = Types.GetTicketsResponse;
  type VerifyTicketResponse = Types.VerifyTicketResponse;
  type MintTicketError = Types.MintTicketError;
  type GetTicketError = Types.GetTicketError;
  type VerifyTicketError = Types.VerifyTicketError;

  // External actor reference for the Events canister
  type EventsActor = actor {
    getEvent : (EventId) -> async Types.GetEventResponse;
  };
  let eventsActor : EventsActor = actor("bkyz2-fmaaa-aaaaa-qaaaq-cai"); // Events canister ID

  // Storage for tickets
  private stable var ticketEntries : [(TicketId, Ticket)] = [];
  private var tickets = HashMap.HashMap<TicketId, Ticket>(10, Text.equal, Text.hash);
  private stable var nextTicketId : Nat = 1;

  // Initialize the tickets HashMap from stable storage
  system func preupgrade() {
    ticketEntries := Iter.toArray(tickets.entries());
  };

  system func postupgrade() {
    tickets := HashMap.fromIter<TicketId, Ticket>(ticketEntries.vals(), 10, Text.equal, Text.hash);
    ticketEntries := [];
  };

  // Function to generate a new unique ticket ID
  private func generateTicketId() : TicketId {
    let id = nextTicketId;
    nextTicketId += 1;
    Nat.toText(id);
  };

  // Backward compatibility method for the original mint function
  public shared func mint(owner : Principal, svg : Text) : async Text {
    let ticketId = generateTicketId();
    
    let metadata : TicketMetadata = {
      name = "Legacy Ticket";
      description = "Legacy ticket with SVG data";
      imageUrl = ?svg;
      attributes = [
        ("Owner", Principal.toText(owner)),
        ("Created", Int.toText(Time.now())),
      ];
    };
    
    let ticket : Ticket = {
      id = ticketId;
      eventId = "1"; // Default event
      ticketTypeId = "1"; // Default ticket type
      owner = owner;
      isUsed = false;
      metadata = metadata;
      mintedAt = Time.now();
    };
    
    tickets.put(ticketId, ticket);
    
    return "Ticket minted successfully!";
  };

  // Mint a new ticket
  public shared(msg) func mintTicket(request : MintTicketRequest) : async MintTicketResponse {
    let caller = msg.caller;

    // Ensure the user is authenticated
    if (Principal.isAnonymous(caller)) {
      return #err(#userNotAuthenticated);
    };

    // Get the event from Events canister
    let eventResult = await eventsActor.getEvent(request.eventId);

    switch (eventResult) {
      case (#err(error)) {
        #err(#notFound);
      };
      case (#ok(event)) {
        // Check if event is active
        switch (event.status) {
          case (#active) {};
          case (_) { return #err(#eventNotActive) };
        };

        // Find the requested ticket type
        let ticketType = Array.find<Types.TicketType>(
          event.ticketTypes, 
          func(tt) { tt.id == request.ticketTypeId }
        );

        switch (ticketType) {
          case (null) { #err(#notFound) };
          case (?tt) {
            // Check if tickets are sold out
            if (tt.sold >= tt.capacity) {
              return #err(#soldOut);
            };

            try {
              let ticketId = generateTicketId();

              // Create metadata for the ticket
              let metadata : TicketMetadata = {
                name = event.name # " - " # tt.name;
                description = "Ticket for " # event.name;
                imageUrl = event.imageUrl;
                attributes = [
                  ("Event", event.name),
                  ("Type", tt.name),
                  ("Date", event.date),
                  ("Time", event.time),
                  ("Location", event.location),
                  ("Art Style", event.artStyle),
                  ("Price", Nat.toText(tt.price)),
                ];
              };

              // Create the ticket
              let ticket : Ticket = {
                id = ticketId;
                eventId = request.eventId;
                ticketTypeId = request.ticketTypeId;
                owner = caller;
                isUsed = false;
                metadata = metadata;
                mintedAt = Time.now();
              };

              tickets.put(ticketId, ticket);

              // TODO: Update the event ticket sales count
              // In a production system, you'd want to call back to the Events canister
              // to increment the sold count for this ticket type

              #ok(ticket);
            } catch (_) {
              #err(#systemError);
            };
          };
        };
      };
    };
  };

  // Get a specific ticket by ID
  public query(msg) func getTicket(ticketId : TicketId) : async GetTicketResponse {
    let caller = msg.caller;

    switch (tickets.get(ticketId)) {
      case (null) { #err(#ticketNotFound) };
      case (?ticket) {
        // Only ticket owner or organizer can view ticket details
        // In a full implementation, we'd check if caller is the event organizer as well
        if (Principal.equal(caller, ticket.owner)) {
          #ok(ticket);
        } else {
          #err(#userNotAuthenticated);
        };
      };
    };
  };

  // Get all tickets owned by the caller
  public query(msg) func getUserTickets() : async GetTicketsResponse {
    let caller = msg.caller;

    // Ensure the user is authenticated
    if (Principal.isAnonymous(caller)) {
      return #err(#userNotAuthenticated);
    };

    let userTickets = Buffer.Buffer<Ticket>(0);
    
    for ((_, ticket) in tickets.entries()) {
      if (Principal.equal(caller, ticket.owner)) {
        userTickets.add(ticket);
      };
    };

    #ok(Buffer.toArray(userTickets));
  };

  // Backward compatibility method for the original verify function
  public shared func verify(qrHash : Text) : async Bool {
    let ticket = Array.find(
      Iter.toArray(tickets.vals()),
      func(t : Ticket) : Bool {
        t.id == qrHash;
      },
    );
    
    return ticket != null;
  };

  // Verify a ticket (e.g., at event check-in)
  public shared(msg) func verifyTicket(ticketId : TicketId) : async VerifyTicketResponse {
    let caller = msg.caller;

    switch (tickets.get(ticketId)) {
      case (null) { #err(#ticketNotFound) };
      case (?ticket) {
        // TODO: In a production system, implement proper authorization
        // Only the event organizer should be able to verify tickets
        // For now, we'll allow any authenticated user to verify

        if (Principal.isAnonymous(caller)) {
          return #err(#userNotAuthenticated);
        };

        // Check if ticket has already been used
        if (ticket.isUsed) {
          return #ok(false); // Ticket already used
        };

        // Mark ticket as used
        let updatedTicket : Ticket = {
          id = ticket.id;
          eventId = ticket.eventId;
          ticketTypeId = ticket.ticketTypeId;
          owner = ticket.owner;
          isUsed = true; // Mark as used
          metadata = ticket.metadata;
          mintedAt = ticket.mintedAt;
        };

        tickets.put(ticketId, updatedTicket);
        #ok(true); // Ticket verified successfully
      };
    };
  };
};
