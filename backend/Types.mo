import Result "mo:base/Result";
module {
  public type Ticket = {
    owner : Principal;
    metadata : [(Text, Text)];
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

  public type Profile = {
    username : Text;
    bio : Text;
  };

};
