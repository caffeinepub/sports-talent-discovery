import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";

actor {
  // Extend with required components
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Application-specific role types
  public type AppRole = {
    #player;
    #scout;
    #sponsor;
  };

  // Types
  public type Sport = {
    #football;
    #basketball;
    #athletics;
    #cricket;
    #other : Text;
  };

  public type UserProfile = {
    name : Text;
    appRole : AppRole;
  };

  public type PlayerProfile = {
    name : Text;
    sport : Sport;
    village : Text;
    bio : Text;
    age : Nat;
  };

  public type VideoMetadata = {
    id : Principal;
    title : Text;
    description : Text;
    sport : Sport;
    blobId : Text;
    playerId : Principal;
    timestamp : Int;
  };

  public type Assessment = {
    id : Text;
    name : Text;
    sport : Sport;
    date : Int;
    scout : Principal;
  };

  public type Score = {
    assessmentId : Text;
    playerId : Principal;
    physical : Nat;
    technical : Nat;
    tactical : Nat;
    mental : Nat;
    totalScore : Nat;
  };

  public type SponsorProfile = {
    id : Principal;
    orgName : Text;
    sport : Sport;
    description : Text;
  };

  public type ShortlistEntry = {
    sponsorId : Principal;
    playerId : Principal;
    timestamp : Int;
  };

  module Score {
    public func compare(score1 : Score, score2 : Score) : Order.Order {
      Nat.compare(score2.totalScore, score1.totalScore);
    };
  };

  // Stores
  let userProfiles = Map.empty<Principal, UserProfile>();
  let players = Map.empty<Principal, PlayerProfile>();
  let videos = Map.empty<Principal, VideoMetadata>();
  let assessments = Map.empty<Text, Assessment>();
  let scores = List.empty<Score>();
  let sponsors = Map.empty<Principal, SponsorProfile>();
  let shortlists = List.empty<ShortlistEntry>();

  // Helper function to check application-specific roles
  func hasAppRole(caller : Principal, requiredRole : AppRole) : Bool {
    // Must be at least a user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return false;
    };

    // Check application-specific role
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.appRole == requiredRole };
    };
  };

  func isPlayerRole(caller : Principal) : Bool {
    hasAppRole(caller, #player);
  };

  func isScoutRole(caller : Principal) : Bool {
    hasAppRole(caller, #scout);
  };

  func isSponsorRole(caller : Principal) : Bool {
    hasAppRole(caller, #sponsor);
  };

  // User Profile Management (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Player CRUD
  public shared ({ caller }) func createOrUpdatePlayer(name : Text, sport : Sport, village : Text, bio : Text, age : Nat) : async () {
    if (not isPlayerRole(caller)) {
      Runtime.trap("Unauthorized: Only players can create or update player profiles");
    };

    let profile : PlayerProfile = {
      name;
      sport;
      village;
      bio;
      age;
    };
    players.add(caller, profile);
  };

  public query func getPlayer(id : Principal) : async ?PlayerProfile {
    players.get(id);
  };

  // Video Upload & Listing
  public shared ({ caller }) func uploadVideo(title : Text, description : Text, sport : Sport, blobId : Text, timestamp : Int) : async () {
    if (not isPlayerRole(caller)) {
      Runtime.trap("Unauthorized: Only players can upload videos");
    };

    let video : VideoMetadata = {
      id = caller;
      title;
      description;
      sport;
      blobId = blobId;
      playerId = caller;
      timestamp;
    };
    videos.add(caller, video);
  };

  public query func getVideosByPlayer(playerId : Principal) : async [VideoMetadata] {
    videos.values().toArray().filter(
      func(video) {
        video.playerId == playerId;
      }
    );
  };

  public query func getAllVideos() : async [VideoMetadata] {
    videos.values().toArray();
  };

  // Assessments & Scores
  public shared ({ caller }) func createAssessment(id : Text, name : Text, sport : Sport, date : Int) : async () {
    if (not isScoutRole(caller)) {
      Runtime.trap("Unauthorized: Only scouts can create assessments");
    };
    let assessment : Assessment = {
      id;
      name;
      sport;
      date;
      scout = caller;
    };
    assessments.add(id, assessment);
  };

  public shared ({ caller }) func assignScore(assessmentId : Text, playerId : Principal, physical : Nat, technical : Nat, tactical : Nat, mental : Nat) : async () {
    if (not isScoutRole(caller)) {
      Runtime.trap("Unauthorized: Only scouts can assign scores");
    };

    // Validate score ranges
    if (physical > 100 or technical > 100 or tactical > 100 or mental > 100) {
      Runtime.trap("Invalid score: All scores must be between 0 and 100");
    };

    // Verify assessment exists
    switch (assessments.get(assessmentId)) {
      case (null) {
        Runtime.trap("Assessment not found");
      };
      case (?_) {};
    };

    let totalScore = (physical + technical + tactical + mental) / 4;
    let score : Score = {
      assessmentId;
      playerId;
      physical;
      technical;
      tactical;
      mental;
      totalScore;
    };
    scores.add(score);
  };

  public query func getPlayerScores(playerId : Principal) : async [Score] {
    scores.toArray().filter(func(score) { score.playerId == playerId });
  };

  public query func getLeaderboard(sport : ?Sport) : async [Score] {
    scores.toArray().filter(
      func(entry) {
        switch (sport) {
          case (null) { true };
          case (?s) {
            let player = players.get(entry.playerId);
            switch (player) {
              case (null) { false };
              case (?p) { p.sport == s };
            };
          };
        };
      }
    ).sort();
  };

  // Sponsors & Shortlisting
  public shared ({ caller }) func createSponsorProfile(orgName : Text, sport : Sport, description : Text) : async () {
    if (not isSponsorRole(caller)) {
      Runtime.trap("Unauthorized: Only sponsors can create sponsor profiles");
    };

    let sponsor : SponsorProfile = {
      id = caller;
      orgName;
      sport;
      description;
    };
    sponsors.add(caller, sponsor);
  };

  public shared ({ caller }) func shortlistPlayer(playerId : Principal) : async () {
    if (not isSponsorRole(caller)) {
      Runtime.trap("Unauthorized: Only sponsors can shortlist players");
    };

    // Verify player exists
    switch (players.get(playerId)) {
      case (null) {
        Runtime.trap("Player not found");
      };
      case (?_) {};
    };

    let entry : ShortlistEntry = {
      sponsorId = caller;
      playerId;
      timestamp = Time.now();
    };
    shortlists.add(entry);
  };

  public query func getShortlistedPlayers(sponsorId : Principal) : async [Principal] {
    shortlists.toArray().filter(
      func(entry) {
        entry.sponsorId == sponsorId;
      }
    ).map(func(entry) { entry.playerId });
  };

  // Public Getters
  public query func getAllPlayers() : async [(Principal, PlayerProfile)] {
    players.toArray();
  };

  public query func getAllSponsors() : async [(Principal, SponsorProfile)] {
    sponsors.toArray();
  };

  public query func getAllAssessments() : async [(Text, Assessment)] {
    assessments.toArray();
  };
};
