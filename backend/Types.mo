import Result "mo:base/Result";
import Principal "mo:base/Principal";
module {
  // Profile types
  public type Profile = {
    username : Text;
    bio : Text;
  };

  public type CreateProfileResponse = Result.Result<Bool, CreateProfileError>;
  public type GetProfileResponse = Result.Result<Profile, GetProfileError>;

  public type GetProfileError = {
    #userNotAuthenticated;
    #profileNotFound;
  };

  public type CreateProfileError = {
    #profileAlreadyExists;
    #userNotAuthenticated;
  };

  // Event types
  public type EventId = Text;

  public type EventStatus = {
    #active;
    #cancelled;
    #completed;
  };

  public type TicketType = {
    id : Text;
    name : Text;
    price : Nat;
    capacity : Nat;
    sold : Nat;
    description : ?Text;
  };

  public type Event = {
    id : EventId;
    name : Text;
    description : Text;
    date : Text;
    time : Text;
    location : Text;
    imageUrl : ?Text;
    artStyle : Text;
    organizer : Principal;
    ticketTypes : [TicketType];
    status : EventStatus;
  };

  public type CreateEventRequest = {
    name : Text;
    description : Text;
    date : Text;
    time : Text;
    location : Text;
    imageUrl : ?Text;
    artStyle : Text;
    ticketTypes : [{
      name : Text;
      price : Nat;
      capacity : Nat;
      description : ?Text;
    }];
  };

  public type CreateEventResponse = Result.Result<Event, CreateEventError>;
  public type GetEventResponse = Result.Result<Event, GetEventError>;
  public type GetEventsResponse = Result.Result<[Event], GetEventError>;

  public type CreateEventError = {
    #userNotAuthenticated;
    #invalidInput;
    #systemError;
  };

  public type GetEventError = {
    #eventNotFound;
    #userNotAuthenticated;
  };

  // Ticket types
  public type TicketId = Text;

  public type TicketMetadata = {
    name : Text;
    description : Text;
    imageUrl : ?Text;
    attributes : [(Text, Text)];
  };

  public type Ticket = {
    id : TicketId;
    eventId : EventId;
    ticketTypeId : Text;
    owner : Principal;
    isUsed : Bool;
    metadata : TicketMetadata;
    mintedAt : Int;
  };

  public type MintTicketRequest = {
    eventId : EventId;
    ticketTypeId : Text;
  };

  public type MintTicketResponse = Result.Result<Ticket, MintTicketError>;
  public type GetTicketResponse = Result.Result<Ticket, GetTicketError>;
  public type GetTicketsResponse = Result.Result<[Ticket], GetTicketError>;
  public type VerifyTicketResponse = Result.Result<Bool, VerifyTicketError>;

  public type MintTicketError = {
    #notFound;
    #soldOut;
    #userNotAuthenticated;
    #eventNotActive;
    #systemError;
  };

  public type GetTicketError = {
    #ticketNotFound;
    #userNotAuthenticated;
  };

  public type VerifyTicketError = {
    #ticketNotFound;
    #userNotAuthenticated;
  };
};
