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
        ticketTypes = request.ticketTypes;
        status = #active;
      };

      events.put(eventId, newEvent);
      
      #ok(newEvent);
    } catch (e) {
      Debug.print("Error creating event: " # debug_show(e));
      #err(#systemError); 
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
}; 