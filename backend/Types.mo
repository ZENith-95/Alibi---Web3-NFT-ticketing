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

  // Event and Ticket types
  public type Error = {
    #NotFound;
    #AlreadyExists;
    #NotAuthorized;
    #SoldOut;
    #InvalidInput;
    #CannotModify;
    #SystemError;
  };

  public type Result<T> = Result.Result<T, Error>;

  public type TicketType = {
    id : Nat;
    name : Text;
    price : Nat;
    capacity : Nat;
    sold : Nat;
    description : ?Text;
  };

  public type CreateTicketTypeRequest = {
    name : Text;
    price : Nat;
    capacity : Nat;
    description : ?Text;
  };

  public type Event = {
    id : Nat;
    name : Text;
    description : Text;
    date : Text;
    time : Text;
    location : Text;
    organizer : Principal;
    imageUrl : ?Text;
    artStyle : Text;
    ticketTypes : [TicketType];
    totalCapacity : Nat;
    ticketsSold : Nat;
    isActive : Bool;
    createdAt : Nat64;
  };

  public type CreateEventRequest = {
    name : Text;
    description : Text;
    date : Text;
    time : Text;
    location : Text;
    imageUrl : ?Text;
    artStyle : Text;
    ticketTypes : [CreateTicketTypeRequest];
  };

  public type TicketMetadata = {
    name : Text;
    description : Text;
    imageUrl : ?Text;
    attributes : [(Text, Text)];
  };

  public type Ticket = {
    id : Nat;
    eventId : Nat;
    ticketTypeId : Nat;
    owner : Principal;
    isUsed : Bool;
    metadata : TicketMetadata;
    mintedAt : Nat64;
  };

  public type MintTicketRequest = {
    eventId : Nat;
    ticketTypeId : Nat;
    imageUrl : Text;
  };
};
