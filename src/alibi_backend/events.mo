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
import Debug "mo:base/Debug";
import Option "mo:base/Option";

actor Events {
  // State variables
  private stable var nextEventId : Nat = 0;
  private stable var nextTicketId : Nat = 0;
  
  // Storage
  private let events = TrieMap.TrieMap<Nat, Types.Event>(Nat.equal, Int.hash);
  private let tickets = TrieMap.TrieMap<Nat, Types.Ticket>(Nat.equal, Int.hash);
  
  // Cache for recent events query results
  private var cachedEvents : ?[Types.Event] = null;
  private var cacheTimestamp : Nat64 = 0;
  private let CACHE_TTL : Nat64 = 300_000_000_000; // 5 minutes in nanoseconds
  
  // Helper function to validate a CreateEventRequest
  private func validateCreateEventRequest(request : Types.CreateEventRequest) : Types.Result<Bool> {
    if (Text.size(request.name) < 3) return #err(#InvalidInput { message = "Event name is too short" });
    if (Text.size(request.description) < 10) return #err(#InvalidInput { message = "Event description is too short" });
    if (Text.size(request.date) == 0) return #err(#InvalidInput { message = "Event date is required" });
    if (Text.size(request.time) == 0) return #err(#InvalidInput { message = "Event time is required" });
    if (Text.size(request.location) == 0) return #err(#InvalidInput { message = "Event location is required" });
    if (request.ticketTypes.size() == 0) return #err(#InvalidInput { message = "At least one ticket type is required" });
    
    for (ticketType in Iter.fromArray(request.ticketTypes)) {
      if (Text.size(ticketType.name) < 2) return #err(#InvalidInput { message = "Ticket type name is too short" });
      if (ticketType.capacity == 0) return #err(#InvalidInput { message = "Ticket capacity must be greater than 0" });
    };
    
    return #ok(true);
  };
  
  // Create a new event
  public shared({ caller }) func createEvent(request : Types.CreateEventRequest) : async Types.Result<Nat> {
    if (Principal.isAnonymous(caller)) return #err(#NotAuthorized { message = "Authentication required" });
    
    switch (validateCreateEventRequest(request)) {
      case (#err(error)) { return #err(error) };
      case (#ok(_)) {};
    };
    
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
    
    // Invalidate cache when new event is created
    cachedEvents := null;
    
    #ok(eventId);
  };
  
  // Get events with pagination
  public query func getEvents(offset : Nat, limit : Nat) : async Types.PaginatedEvents {
    let eventsArray = Iter.toArray(events.vals());
    let totalEvents = eventsArray.size();
    
    let actualLimit = if (limit > 50) 50 else limit; // Limit maximum to 50 items
    let actualOffset = if (offset >= totalEvents) 0 else offset;
    
    let endIndex = Nat.min(actualOffset + actualLimit, totalEvents);
    
    let page = if (actualOffset < totalEvents) {
      Array.tabulate<Types.Event>(
        endIndex - actualOffset,
        func(i : Nat) : Types.Event {
          eventsArray[actualOffset + i];
        }
      );
    } else {
      [];
    };
    
    {
      events = page;
      total = totalEvents;
      offset = actualOffset;
      limit = actualLimit;
    };
  };
  
  // Get all events (with caching)
  public query func getAllEvents() : async [Types.Event] {
    let currentTime = Nat64.fromNat(Int.abs(Time.now()));
    
    switch (cachedEvents) {
      case (?events) {
        // Return cached events if cache is not expired
        if (currentTime < cacheTimestamp + CACHE_TTL) {
          return events;
        };
      };
      case (null) {};
    };
    
    // Cache expired or not set, fetch new data
    let eventsArray = Iter.toArray(events.vals());
    cachedEvents := ?eventsArray;
    cacheTimestamp := currentTime;
    
    eventsArray;
  };
  
  // Get event by ID
  public query func getEvent(eventId : Nat) : async Types.Result<Types.Event> {
    switch (events.get(eventId)) {
      case (?event) { #ok(event) };
      case null { #err(#NotFound { message = "Event not found" }) };
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
    if (Principal.isAnonymous(caller)) return #err(#NotAuthorized { message = "Authentication required" });
    
    // Get the event
    switch (events.get(request.eventId)) {
      case (null) { return #err(#NotFound { message = "Event not found" }) };
      case (?event) {
        // Check if event is active
        if (not event.isActive) {
          return #err(#InvalidInput { message = "Event is not active" });
        };
        
        // Check if ticket type exists
        if (request.ticketTypeId >= event.ticketTypes.size()) {
          return #err(#InvalidInput { message = "Invalid ticket type" });
        };
        
        let ticketType = event.ticketTypes[request.ticketTypeId];
        
        // Check if tickets are available
        if (ticketType.sold >= ticketType.capacity) {
          return #err(#SoldOut { message = "This ticket type is sold out" });
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
        cachedEvents := null; // Invalidate cache
        
        return #ok(ticketId);
      };
    };
  };
  
  // Get tickets with pagination
  public query func getTickets(offset : Nat, limit : Nat) : async Types.PaginatedTickets {
    let ticketsArray = Iter.toArray(tickets.vals());
    let totalTickets = ticketsArray.size();
    
    let actualLimit = if (limit > 50) 50 else limit; // Limit maximum to 50 items
    let actualOffset = if (offset >= totalTickets) 0 else offset;
    
    let endIndex = Nat.min(actualOffset + actualLimit, totalTickets);
    
    let page = if (actualOffset < totalTickets) {
      Array.tabulate<Types.Ticket>(
        endIndex - actualOffset,
        func(i : Nat) : Types.Ticket {
          ticketsArray[actualOffset + i];
        }
      );
    } else {
      [];
    };
    
    {
      tickets = page;
      total = totalTickets;
      offset = actualOffset;
      limit = actualLimit;
    };
  };
  
  // Get ticket by ID
  public query func getTicket(ticketId : Nat) : async Types.Result<Types.Ticket> {
    switch (tickets.get(ticketId)) {
      case (?ticket) { #ok(ticket) };
      case null { #err(#NotFound { message = "Ticket not found" }) };
    };
  };
  
  // Get tickets owned by a specific principal
  public query func getUserTickets(user : Principal) : async [Types.Ticket] {
    if (Principal.isAnonymous(user)) {
      return [];
    };
    
    let userTickets = Array.filter<Types.Ticket>(
      Iter.toArray(tickets.vals()),
      func(ticket : Types.Ticket) : Bool {
        Principal.equal(ticket.owner, user)
      }
    );
    userTickets;
  };
  
  public shared({ caller }) func deleteEvent(eventId : Nat) : async Types.Result<Bool> {
    if (Principal.isAnonymous(caller)) return #err(#NotAuthorized { message = "Authentication required" });
    
    switch (events.get(eventId)) {
      case (null) { return #err(#NotFound { message = "Event not found" }) };
      case (?event) {
        if (not Principal.equal(caller, event.organizer)) {
          return #err(#NotAuthorized { message = "Only the event organizer can delete this event" });
        };
        
        // Check if there are tickets already minted
        let eventTickets = Array.filter<Types.Ticket>(
          Iter.toArray(tickets.vals()),
          func(ticket : Types.Ticket) : Bool {
            ticket.eventId == eventId;
          }
        );
        
        if (eventTickets.size() > 0) {
          return #err(#CannotModify { message = "Cannot delete event with existing tickets" });
        };
        
        ignore events.remove(eventId);
        cachedEvents := null; // Invalidate cache
        
        return #ok(true);
      };
    };
  };
  
  // Verify a ticket (mark as used)
  public shared({ caller }) func verifyTicket(ticketId : Nat) : async Types.Result<Bool> {
    if (Principal.isAnonymous(caller)) return #err(#NotAuthorized { message = "Authentication required" });
    
    switch (tickets.get(ticketId)) {
      case (null) { return #err(#NotFound { message = "Ticket not found" }) };
      case (?ticket) {
        // Check if ticket is already used
        if (ticket.isUsed) {
          return #err(#InvalidInput { message = "Ticket already used" });
        };
        
        // Check if the event organizer is making the verification
        switch (events.get(ticket.eventId)) {
          case (null) { return #err(#NotFound { message = "Event not found" }) };
          case (?event) {
            if (not Principal.equal(caller, event.organizer)) {
              return #err(#NotAuthorized { message = "Only the event organizer can verify tickets" });
            };
            
            // Mark ticket as used
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
            return #ok(true);
          };
        };
      };
    };
  };
  
  // System functions for resilience
  system func preupgrade() {
    // Reset cache before upgrade
    cachedEvents := null;
  };
  
  system func postupgrade() {
    // Initialize cache timestamp after upgrade
    cacheTimestamp := Nat64.fromNat(Int.abs(Time.now()));
  };
}