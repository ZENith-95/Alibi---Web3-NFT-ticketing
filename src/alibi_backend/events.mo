import Array "mo:base/Array";
import Bool "mo:base/Bool";
import Buffer "mo:base/Buffer";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
// import Option "mo:base/Option";
import Principal "mo:base/Principal";
// import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import TrieMap "mo:base/TrieMap";
import Types "./types";

actor Events {
  // State variables
  private stable var nextEventId : Nat = 0;
  private stable var nextTicketId : Nat = 0;
  
  // Storage
  private let events = TrieMap.TrieMap<Nat, Types.Event>(Nat.equal, Int.hash);
  private let tickets = TrieMap.TrieMap<Nat, Types.Ticket>(Nat.equal, Int.hash);
  
  // Helper function to validate a CreateEventRequest
  private func validateCreateEventRequest(request : Types.CreateEventRequest) : Bool {
    if (Text.size(request.name) == 0) return false;
    if (Text.size(request.description) == 0) return false;
    if (Text.size(request.date) == 0) return false;
    if (Text.size(request.time) == 0) return false;
    if (Text.size(request.location) == 0) return false;
    if (request.ticketTypes.size() == 0) return false;
    
    for (ticketType in Iter.fromArray(request.ticketTypes)) {
      if (Text.size(ticketType.name) == 0) return false;
      if (ticketType.capacity == 0) return false;
    };
    
    return true;
  };
  
  // Create a new event
  public shared({ caller }) func createEvent(request : Types.CreateEventRequest) : async Types.Result<Nat> {
    if (Principal.isAnonymous(caller)) return #err(#NotAuthorized);
    if (not validateCreateEventRequest(request)) return #err(#InvalidInput);
    
    let eventId = nextEventId;
    nextEventId += 1;
    
    // Convert ticketTypes requests to actual TicketTypes
    let ticketTypesBuffer = Buffer.Buffer<Types.TicketType>(request.ticketTypes.size());
    var totalCapacity : Nat = 0;
    
    for (i in Iter.range(0, request.ticketTypes.size() - 1)) {
      let requestTicketType = request.ticketTypes[i];
      let ticketType : Types.TicketType = {
        id = i;
        name = requestTicketType.name;
        price = requestTicketType.price;
        capacity = requestTicketType.capacity;
        sold = 0;
        description = requestTicketType.description;
      };
      ticketTypesBuffer.add(ticketType);
      totalCapacity += requestTicketType.capacity;
    };
    
    let newEvent : Types.Event = {
      id = eventId;
      name = request.name;
      description = request.description;
      date = request.date;
      time = request.time;
      location = request.location;
      organizer = caller;
      imageUrl = request.imageUrl;
      artStyle = request.artStyle;
      ticketTypes = Buffer.toArray(ticketTypesBuffer);
      totalCapacity = totalCapacity;
      ticketsSold = 0;
      isActive = true;
      createdAt = Nat64.fromNat(Int.abs(Time.now()));
    };
    
    events.put(eventId, newEvent);
    #ok(eventId);
  };
  
  // Get all events
  public query func getAllEvents() : async [Types.Event] {
    Iter.toArray(events.vals());
  };
  
  // Get event by ID
  public query func getEvent(eventId : Nat) : async Types.Result<Types.Event> {
    switch (events.get(eventId)) {
      case (?event) { #ok(event) };
      case null { #err(#NotFound) };
    };
  };
  
  // Get events organized by a specific principal
  public query func getOrganizerEvents(organizer : Principal) : async [Types.Event] {
    let organizerEvents = Array.filter<Types.Event>(
      Iter.toArray(events.vals()),
      func(event : Types.Event) : Bool {
        Principal.equal(event.organizer, organizer)
      }
    );
    organizerEvents;
  };
  
  // Mint a new ticket
  public shared({ caller }) func mintTicket(request : Types.MintTicketRequest) : async Types.Result<Nat> {
    if (Principal.isAnonymous(caller)) return #err(#NotAuthorized);
    
    // Get the event
    switch (events.get(request.eventId)) {
      case (null) { return #err(#NotFound) };
      case (?event) {
        // Check if ticket type exists
        if (request.ticketTypeId >= event.ticketTypes.size()) {
          return #err(#InvalidInput);
        };
        
        let ticketType = event.ticketTypes[request.ticketTypeId];
        
        // Check if tickets are available
        if (ticketType.sold >= ticketType.capacity) {
          return #err(#SoldOut);
        };
        
        // Create metadata for the ticket
        let attributes = Buffer.Buffer<(Text, Text)>(4);
        attributes.add(("date", event.date));
        attributes.add(("time", event.time));
        attributes.add(("location", event.location));
        attributes.add(("ticket_type", ticketType.name));
        
        let metadata : Types.TicketMetadata = {
          name = event.name;
          description = event.description;
          imageUrl = ?request.imageUrl;
          attributes = Buffer.toArray(attributes);
        };
        
        // Create the ticket
        let ticketId = nextTicketId;
        nextTicketId += 1;
        
        let newTicket : Types.Ticket = {
          id = ticketId;
          eventId = event.id;
          ticketTypeId = request.ticketTypeId;
          owner = caller;
          isUsed = false;
          metadata = metadata;
          mintedAt = Nat64.fromNat(Int.abs(Time.now()));
        };
        
        tickets.put(ticketId, newTicket);
        
        // Update the event and ticket type
        let updatedTicketTypes = Array.mapEntries<Types.TicketType, Types.TicketType>(
          event.ticketTypes,
          func(t : Types.TicketType, i : Nat) : Types.TicketType {
            if (i == request.ticketTypeId) {
              {
                id = t.id;
                name = t.name;
                price = t.price;
                capacity = t.capacity;
                sold = t.sold + 1;
                description = t.description;
              }
            } else {
              t
            }
          }
        );
        
        let updatedEvent : Types.Event = {
          id = event.id;
          name = event.name;
          description = event.description;
          date = event.date;
          time = event.time;
          location = event.location;
          organizer = event.organizer;
          imageUrl = event.imageUrl;
          artStyle = event.artStyle;
          ticketTypes = updatedTicketTypes;
          totalCapacity = event.totalCapacity;
          ticketsSold = event.ticketsSold + 1;
          isActive = event.isActive;
          createdAt = event.createdAt;
        };
        
        events.put(event.id, updatedEvent);
        return #ok(ticketId);
      };
    };
  };
  
  // Get ticket by ID
  public query func getTicket(ticketId : Nat) : async Types.Result<Types.Ticket> {
    switch (tickets.get(ticketId)) {
      case (?ticket) { #ok(ticket) };
      case null { #err(#NotFound) };
    };
  };
  
  // Get tickets owned by a specific principal
  public query func getUserTickets(user : Principal) : async [Types.Ticket] {
    let userTickets = Array.filter<Types.Ticket>(
      Iter.toArray(tickets.vals()),
      func(ticket : Types.Ticket) : Bool {
        Principal.equal(ticket.owner, user)
      }
    );
    userTickets;
  };
  
  public shared({caller}) func deleteEvent(eventId : Nat) : async Types.Result<Bool> {
    if (Principal.isAnonymous(caller)) return #err(#NotAuthorized);
    
    switch (events.get(eventId)) {
      case (null) { return #err(#NotFound) };
      case (?event) {
        if (not Principal.equal(caller, event.organizer)) {
          return #err(#NotAuthorized);
        };
        
        ignore events.remove(eventId);
        return #ok(true);
      };
    };
  };
  // Verify a ticket (mark as used)
  public shared({ caller }) func verifyTicket(ticketId : Nat) : async Types.Result<Bool> {
    switch (tickets.get(ticketId)) {
      case (null) { return #err(#NotFound) };
      case (?ticket) {
        // Check if the event organizer is making the verification
        switch (events.get(ticket.eventId)) {
          case (null) { return #err(#NotFound) };
          case (?event) {
            if (not Principal.equal(caller, event.organizer)) {
              return #err(#NotAuthorized);
            };
            
            // Check if ticket is already used
            if (ticket.isUsed) {
              return #ok(false);  // Ticket already used
            };
            
            // Mark the ticket as used
            let updatedTicket : Types.Ticket = {
              id = ticket.id;
              eventId = ticket.eventId;
              ticketTypeId = ticket.ticketTypeId;
              owner = ticket.owner;
              isUsed = true;
              metadata = ticket.metadata;
              mintedAt = ticket.mintedAt;
            };
            
            tickets.put(ticketId, updatedTicket);
            return #ok(true);  // Successfully verified
          };
        };
      };
    };
  };
  
  // Get ticket QR code (in a real implementation, this would generate a secure QR code)
  public query func getTicketQRCode(ticketId : Nat) : async Text {
    switch (tickets.get(ticketId)) {
      case (null) { "Error: Ticket not found" };
      case (?ticket) {
        // In a real implementation, we would generate a secure QR code here
        // For now, we just return a simple SVG with the ticket ID
        let qrCode = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' fill='black'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white'>Ticket #" # Nat.toText(ticketId) # "</text></svg>";
        qrCode;
      };
    };
  };


}; 