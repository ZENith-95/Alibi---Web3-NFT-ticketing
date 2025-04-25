import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Types "./types";

actor {

  let profiles = HashMap.HashMap<Principal, Types.Profile>(10, Principal.equal, Principal.hash);
  public shared ({ caller }) func createProfile(username : Text, bio : Text) : async Types.CreateProfileResponse {
    if (Principal.isAnonymous(caller)) return #err(#userNotAuthenticated);

    let profile = profiles.get(caller);

    if (profile != null) return #err(#profileAlreadyExists);

    let newProfile : Types.Profile = {
      username = username;
      bio = bio;
    };

    profiles.put(caller, newProfile);

    #ok(true);
  };

  public query ({ caller }) func getProfile() : async Types.GetProfileResponse {
    if (Principal.isAnonymous(caller)) return #err(#userNotAuthenticated);

    let profile = profiles.get(caller);

    switch profile {
      case (?profile) {
        #ok(profile);
      };
      case null {
        #err(#profileNotFound);
      };
    };
  };

  // Added functionality to get profile by principal ID for admin or lookup purposes
  public query func getProfileByPrincipal(principal : Principal) : async Types.GetProfileResponse {
    let profile = profiles.get(principal);

    switch profile {
      case (?profile) {
        #ok(profile);
      };
      case null {
        #err(#profileNotFound);
      };
    };
  };
};
