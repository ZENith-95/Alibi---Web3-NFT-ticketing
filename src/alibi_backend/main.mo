import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Types "./types";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Nat64 "mo:base/Nat64";
import Int "mo:base/Int";

actor {
  // State variables
  private stable var nextProfileId : Nat = 0;

  // Role definitions
  private type Role = {
    #Admin;
    #User;
  };
  
  // Enhanced profile with roles and more fields
  private type ProfileInternal = {
    id : Nat;
    username : Text;
    bio : Text;
    role : Role;
    email : ?Text;
    avatarUrl : ?Text;
    createdAt : Nat64;
    updatedAt : Nat64;
  };
  
  // Admin principals (hardcoded for now, but could be made configurable)
  private let adminPrincipals : [Principal] = [
    Principal.fromText("2vxsx-fae") // Replace with a real admin principal in production
  ];
  
  private let profiles = HashMap.HashMap<Principal, ProfileInternal>(10, Principal.equal, Principal.hash);
  private let usernameToProfile = HashMap.HashMap<Text, Principal>(10, Text.equal, Text.hash);
  
  // Helper to check if a principal is an admin
  private func isAdmin(principal : Principal) : Bool {
    for (adminPrincipal in adminPrincipals.vals()) {
      if (Principal.equal(principal, adminPrincipal)) {
        return true;
      };
    };
    
    // Also check if a user has admin role in their profile
    switch (profiles.get(principal)) {
      case (?profile) {
        switch (profile.role) {
          case (#Admin) { return true; };
          case (_) { return false; };
        };
      };
      case (null) { return false; };
    };
  };
  
  // Validate username format
  private func validateUsername(username : Text) : Bool {
    if (Text.size(username) < 3 or Text.size(username) > 20) {
      return false;
    };
    
    // Check if username already exists
    switch (usernameToProfile.get(username)) {
      case (?_) { return false; };
      case (null) { return true; };
    };
  };
  
  // Validate profile data
  private func validateProfileData(username : Text, bio : Text) : Types.Result<Bool> {
    if (Text.size(username) < 3) {
      return #err(#InvalidInput { message = "Username is too short (minimum 3 characters)" });
    };
    
    if (Text.size(username) > 20) {
      return #err(#InvalidInput { message = "Username is too long (maximum 20 characters)" });
    };
    
    // Check if username already exists
    switch (usernameToProfile.get(username)) {
      case (?_) { 
        return #err(#AlreadyExists { message = "Username already taken" });
      };
      case (null) {};
    };
    
    if (Text.size(bio) > 500) {
      return #err(#InvalidInput { message = "Bio is too long (maximum 500 characters)" });
    };
    
    #ok(true);
  };
  
  // Convert internal profile to public profile
  private func toPublicProfile(profile : ProfileInternal) : Types.Profile {
    {
      username = profile.username;
      bio = profile.bio;
    };
  };
  
  // Create a new profile
  public shared ({ caller }) func createProfile(username : Text, bio : Text) : async Types.CreateProfileResponse {
    if (Principal.isAnonymous(caller)) return #err(#userNotAuthenticated);

    let profile = profiles.get(caller);

    if (profile != null) return #err(#profileAlreadyExists);
    
    // Validate profile data
    switch (validateProfileData(username, bio)) {
      case (#err(error)) {
        return #err(#profileAlreadyExists);
      };
      case (#ok(_)) {};
    };
    
    let currentTime = Nat64.fromNat(Int.abs(Time.now()));
    
    // Create new profile
    let newProfileInternal : ProfileInternal = {
      id = nextProfileId;
      username = username;
      bio = bio;
      role = #User;
      email = null;
      avatarUrl = null;
      createdAt = currentTime;
      updatedAt = currentTime;
    };
    
    nextProfileId += 1;
    
    profiles.put(caller, newProfileInternal);
    usernameToProfile.put(username, caller);

    #ok(true);
  };

  // Get the caller's profile
  public query ({ caller }) func getProfile() : async Types.GetProfileResponse {
    if (Principal.isAnonymous(caller)) return #err(#userNotAuthenticated);

    let profile = profiles.get(caller);

    switch profile {
      case (?profile) {
        #ok(toPublicProfile(profile));
      };
      case null {
        #err(#profileNotFound);
      };
    };
  };

  // Get profile by principal (with access control)
  public query ({ caller }) func getProfileByPrincipal(principal : Principal) : async Types.GetProfileResponse {
    if (Principal.isAnonymous(caller) and not Principal.equal(caller, principal) and not isAdmin(caller)) {
      return #err(#userNotAuthenticated);
    };

    let profile = profiles.get(principal);

    switch profile {
      case (?profile) {
        #ok(toPublicProfile(profile));
      };
      case null {
        #err(#profileNotFound);
      };
    };
  };
  
  // Get profile by username
  public query func getProfileByUsername(username : Text) : async Types.GetProfileResponse {
    switch (usernameToProfile.get(username)) {
      case (?principal) {
        switch (profiles.get(principal)) {
          case (?profile) {
            #ok(toPublicProfile(profile));
          };
          case (null) {
            #err(#profileNotFound);
          };
        };
      };
      case (null) {
        #err(#profileNotFound);
      };
    };
  };
  
  // Update user's own profile
  public shared ({ caller }) func updateProfile(bio : Text) : async Types.Result<Bool> {
    if (Principal.isAnonymous(caller)) {
      return #err(#NotAuthorized { message = "Authentication required" });
    };
    
    switch (profiles.get(caller)) {
      case (null) {
        return #err(#NotFound { message = "Profile not found" });
      };
      case (?profile) {
        if (Text.size(bio) > 500) {
          return #err(#InvalidInput { message = "Bio is too long (maximum 500 characters)" });
        };
        
        let currentTime = Nat64.fromNat(Int.abs(Time.now()));
        
        let updatedProfile : ProfileInternal = {
          id = profile.id;
          username = profile.username;
          bio = bio;
          role = profile.role;
          email = profile.email;
          avatarUrl = profile.avatarUrl;
          createdAt = profile.createdAt;
          updatedAt = currentTime;
        };
        
        profiles.put(caller, updatedProfile);
        
        return #ok(true);
      };
    };
  };
  
  // Update profile avatar URL
  public shared ({ caller }) func updateAvatar(avatarUrl : Text) : async Types.Result<Bool> {
    if (Principal.isAnonymous(caller)) {
      return #err(#NotAuthorized { message = "Authentication required" });
    };
    
    switch (profiles.get(caller)) {
      case (null) {
        return #err(#NotFound { message = "Profile not found" });
      };
      case (?profile) {
        let currentTime = Nat64.fromNat(Int.abs(Time.now()));
        
        let updatedProfile : ProfileInternal = {
          id = profile.id;
          username = profile.username;
          bio = profile.bio;
          role = profile.role;
          email = profile.email;
          avatarUrl = ?avatarUrl;
          createdAt = profile.createdAt;
          updatedAt = currentTime;
        };
        
        profiles.put(caller, updatedProfile);
        
        return #ok(true);
      };
    };
  };
  
  // Update profile email (with validation)
  public shared ({ caller }) func updateEmail(email : Text) : async Types.Result<Bool> {
    if (Principal.isAnonymous(caller)) {
      return #err(#NotAuthorized { message = "Authentication required" });
    };
    
    // Very basic email validation (would use a more robust approach in production)
    if (not Text.contains(email, #text "@") or not Text.contains(email, #text ".")) {
      return #err(#InvalidInput { message = "Invalid email format" });
    };
    
    switch (profiles.get(caller)) {
      case (null) {
        return #err(#NotFound { message = "Profile not found" });
      };
      case (?profile) {
        let currentTime = Nat64.fromNat(Int.abs(Time.now()));
        
        let updatedProfile : ProfileInternal = {
          id = profile.id;
          username = profile.username;
          bio = profile.bio;
          role = profile.role;
          email = ?email;
          avatarUrl = profile.avatarUrl;
          createdAt = profile.createdAt;
          updatedAt = currentTime;
        };
        
        profiles.put(caller, updatedProfile);
        
        return #ok(true);
      };
    };
  };
  
  // Admin functions
  
  // Grant admin privileges (only callable by existing admins)
  public shared ({ caller }) func grantAdminRole(principal : Principal) : async Types.Result<Bool> {
    if (not isAdmin(caller)) {
      return #err(#NotAuthorized { message = "Only admins can grant admin privileges" });
    };
    
    switch (profiles.get(principal)) {
      case (null) {
        return #err(#NotFound { message = "Profile not found" });
      };
      case (?profile) {
        let currentTime = Nat64.fromNat(Int.abs(Time.now()));
        
        let updatedProfile : ProfileInternal = {
          id = profile.id;
          username = profile.username;
          bio = profile.bio;
          role = #Admin;
          email = profile.email;
          avatarUrl = profile.avatarUrl;
          createdAt = profile.createdAt;
          updatedAt = currentTime;
        };
        
        profiles.put(principal, updatedProfile);
        
        return #ok(true);
      };
    };
  };
  
  // List all profiles (admin only)
  public query ({ caller }) func listAllProfiles() : async Types.Result<[Types.Profile]> {
    if (not isAdmin(caller)) {
      return #err(#NotAuthorized { message = "Only admins can list all profiles" });
    };
    
    let profilesArray = Iter.toArray(profiles.vals());
    let publicProfiles = Array.map<ProfileInternal, Types.Profile>(
      profilesArray,
      func(profile : ProfileInternal) : Types.Profile {
        toPublicProfile(profile);
      }
    );
    
    return #ok(publicProfiles);
  };
};
