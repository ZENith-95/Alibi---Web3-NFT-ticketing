import Types "Types";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Option "mo:base/Option";
import Time "mo:base/Time";
import Nat32 "mo:base/Nat32";
import Debug "mo:base/Debug";
import Buffer "mo:base/Buffer";

actor Events {
  type Event = Types.Event;
  type EventId = Types.EventId;
  type EventStatus = Types.EventStatus;
  type TicketType = Types.TicketType;
  type CreateEventRequest = Types.CreateEventRequest;
  type CreateEventResponse = Types.CreateEventResponse;
  type GetEventResponse = Types.GetEventResponse;
  type GetEventsResponse = Types.GetEventsResponse;
  type CreateEventError = Types.CreateEventError;
  type GetEventError = Types.GetEventError;

  // Storage for events
  private stable var eventEntries : [(EventId, Event)] = [];
  private var events = HashMap.HashMap<EventId, Event>(10, Text.equal, Text.hash);
  private stable var nextEventId : Nat = 1;
  private stable var nextTicketTypeId : Nat = 1;

  // Initialize the events HashMap from stable storage
  system func preupgrade() {
    eventEntries := Iter.toArray(events.entries());
  };

  system func postupgrade() {
    events := HashMap.fromIter<EventId, Event>(eventEntries.vals(), 10, Text.equal, Text.hash);
    eventEntries := [];
  };

  // Function to generate a new unique event ID
  private func generateEventId() : EventId {
    let id = nextEventId;
    nextEventId += 1;
    Nat.toText(id);
  };

  // Function to generate a new unique ticket type ID
  private func generateTicketTypeId() : Text {
    let id = nextTicketTypeId;
    nextTicketTypeId += 1;
    Nat.toText(id);
  };

  // Helper to convert CreateEventRequest.ticketTypes to TicketType array
  private func processTicketTypes(requestTicketTypes : [{
    name : Text;
    price : Nat;
    capacity : Nat;
    description : ?Text;
  }]) : [TicketType] {
    let buffer = Buffer.Buffer<TicketType>(requestTicketTypes.size());
    
    for (ttReq in requestTicketTypes.vals()) {
      let ticketTypeId = generateTicketTypeId();
      let ticketType : TicketType = {
        id = ticketTypeId;
        name = ttReq.name;
        price = ttReq.price;
        capacity = ttReq.capacity;
        sold = 0;
        description = ttReq.description;
      };
      buffer.add(ticketType);
    };
    
    Buffer.toArray(buffer);
  };

  // Create a new event
  public shared(msg) func createEvent(request : CreateEventRequest) : async CreateEventResponse {
    let caller = msg.caller;

    // Ensure the user is authenticated
    if (Principal.isAnonymous(caller)) {
      return #err(#userNotAuthenticated);
    };

    // Validate input
    if (Text.size(request.name) == 0 or Text.size(request.description) == 0 or 
        Text.size(request.date) == 0 or Text.size(request.time) == 0 or 
        Text.size(request.location) == 0 or request.ticketTypes.size() == 0) {
      return #err(#invalidInput);
    };

    try {
      let eventId = generateEventId();
      let ticketTypes = processTicketTypes(request.ticketTypes);
      
      // Create the new event
      let newEvent : Event = {
        id = eventId;
        name = request.name;
        description = request.description;
        date = request.date;
        time = request.time;
        location = request.location;
        imageUrl = request.imageUrl;
        artStyle = request.artStyle;
        organizer = caller;
        ticketTypes = ticketTypes;
        status = #active;
      };

      events.put(eventId, newEvent);
      
      #ok(newEvent);
    } catch (e) {
      Debug.print("Error creating event");
      #err(#systemError); 
    };
  };

  // Update an existing event
  public shared(msg) func updateEvent(eventId : EventId, request : CreateEventRequest) : async CreateEventResponse {
    let caller = msg.caller;

    // Ensure the user is authenticated
    if (Principal.isAnonymous(caller)) {
      return #err(#userNotAuthenticated);
    };

    switch (events.get(eventId)) {
      case (null) { #err(#invalidInput) };
      case (?event) {
        // Verify caller is the organizer
        if (not Principal.equal(caller, event.organizer)) {
          return #err(#userNotAuthenticated);
        };

        // Validate input
        if (Text.size(request.name) == 0 or Text.size(request.description) == 0 or 
            Text.size(request.date) == 0 or Text.size(request.time) == 0 or 
            Text.size(request.location) == 0 or request.ticketTypes.size() == 0) {
          return #err(#invalidInput);
        };

        try {
          // Keep existing ticket types and add new ones
          let existingTicketTypesMap = HashMap.HashMap<Text, TicketType>(10, Text.equal, Text.hash);
          for (tt in event.ticketTypes.vals()) {
            existingTicketTypesMap.put(tt.id, tt);
          };

          // Process new ticket types
          let newTicketTypes = processTicketTypes(request.ticketTypes);
          
          // Merge existing and new ticket types
          let mergedTicketTypes = Buffer.Buffer<TicketType>(event.ticketTypes.size() + newTicketTypes.size());
          
          // Add existing ticket types first
          for (tt in event.ticketTypes.vals()) {
            mergedTicketTypes.add(tt);
          };
          
          // Add new ticket types
          for (tt in newTicketTypes.vals()) {
            mergedTicketTypes.add(tt);
          };
          
          // Create the updated event
          let updatedEvent : Event = {
            id = eventId;
            name = request.name;
            description = request.description;
            date = request.date;
            time = request.time;
            location = request.location;
            imageUrl = request.imageUrl;
            artStyle = request.artStyle;
            organizer = event.organizer; // Keep original organizer
            ticketTypes = Buffer.toArray(mergedTicketTypes);
            status = event.status; // Keep current status
          };

          events.put(eventId, updatedEvent);
          
          #ok(updatedEvent);
        } catch (e) {
          Debug.print("Error updating event");
          #err(#systemError); 
        };
      };
    };
  };

  // Get event by ID
  public query func getEvent(eventId : EventId) : async GetEventResponse {
    switch (events.get(eventId)) {
      case (null) { #err(#eventNotFound) };
      case (?event) { #ok(event) };
    };
  };

  // Get all events
  public query func getAllEvents() : async GetEventsResponse {
    let allEvents = Iter.toArray(events.vals());
    // Filter to only show active events
    let activeEvents = Array.filter<Event>(allEvents, func(event) {
      switch (event.status) {
        case (#active) { true };
        case _ { false };
      }
    });
    #ok(activeEvents);
  };

  // Get events by organizer
  public query func getOrganizerEvents(organizer : Principal) : async GetEventsResponse {
    let allEvents = Iter.toArray(events.vals());
    let organizerEvents = Array.filter<Event>(allEvents, func(event) {
      Principal.equal(event.organizer, organizer)
    });
    #ok(organizerEvents);
  };

  // Update an event's status (e.g., cancel or complete)
  public shared(msg) func updateEventStatus(eventId : EventId, newStatus : EventStatus) : async GetEventResponse {
    let caller = msg.caller;
    
    switch (events.get(eventId)) {
      case (null) { #err(#eventNotFound) };
      case (?event) {
        // Only the organizer can update the event
        if (not Principal.equal(caller, event.organizer)) {
          return #err(#userNotAuthenticated);
        };
        
        // Create updated event with new status
        let updatedEvent : Event = {
          id = event.id;
          name = event.name;
          description = event.description;
          date = event.date;
          time = event.time;
          location = event.location;
          imageUrl = event.imageUrl;
          artStyle = event.artStyle;
          organizer = event.organizer;
          ticketTypes = event.ticketTypes;
          status = newStatus;
        };
        
        events.put(eventId, updatedEvent);
        #ok(updatedEvent);
      };
    };
  };

  // Update a ticket type (e.g., change capacity, price)
  public shared(msg) func updateTicketType(
    eventId : EventId, 
    ticketTypeId : Text, 
    newPrice : ?Nat, 
    newCapacity : ?Nat, 
    newDescription : ?Text
  ) : async GetEventResponse {
    let caller = msg.caller;
    
    switch (events.get(eventId)) {
      case (null) { #err(#eventNotFound) };
      case (?event) {
        // Only the organizer can update the event
        if (not Principal.equal(caller, event.organizer)) {
          return #err(#userNotAuthenticated);
        };
        
        // Find the ticket type
        let ticketTypeIndex = Array.indexOf<TicketType>(
          {
            id = ticketTypeId;
            name = "";
            price = 0;
            capacity = 0;
            sold = 0;
            description = null;
          }, 
          event.ticketTypes, 
          func(a, b) { a.id == b.id }
        );
        
        switch (ticketTypeIndex) {
          case (null) { return #err(#eventNotFound) };
          case (?index) {
            let oldTicketType = event.ticketTypes[index];
            
            // Apply updates to the ticket type
            let updatedTicketType : TicketType = {
              id = oldTicketType.id;
              name = oldTicketType.name;
              price = Option.get(newPrice, oldTicketType.price);
              capacity = Option.get(newCapacity, oldTicketType.capacity);
              sold = oldTicketType.sold;
              description = switch (newDescription) {
                case (?desc) { ?desc };
                case (null) { oldTicketType.description };
              };
            };
            
            // Create a new array with the updated ticket type
            let updatedTicketTypes = Array.tabulate<TicketType>(
              event.ticketTypes.size(),
              func(i) {
                if (i == index) { updatedTicketType } else { event.ticketTypes[i] }
              }
            );
            
            // Create updated event
            let updatedEvent : Event = {
              id = event.id;
              name = event.name;
              description = event.description;
              date = event.date;
              time = event.time;
              location = event.location;
              imageUrl = event.imageUrl;
              artStyle = event.artStyle;
              organizer = event.organizer;
              ticketTypes = updatedTicketTypes;
              status = event.status;
            };
            
            events.put(eventId, updatedEvent);
            #ok(updatedEvent);
          };
        };
      };
    };
  };
}; 