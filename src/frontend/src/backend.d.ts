import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Sport = {
    __kind__: "basketball";
    basketball: null;
} | {
    __kind__: "other";
    other: string;
} | {
    __kind__: "football";
    football: null;
} | {
    __kind__: "athletics";
    athletics: null;
} | {
    __kind__: "cricket";
    cricket: null;
};
export interface Score {
    mental: bigint;
    playerId: Principal;
    tactical: bigint;
    technical: bigint;
    totalScore: bigint;
    physical: bigint;
    assessmentId: string;
}
export interface PlayerProfile {
    age: bigint;
    bio: string;
    name: string;
    sport: Sport;
    village: string;
}
export interface SponsorProfile {
    id: Principal;
    orgName: string;
    description: string;
    sport: Sport;
}
export interface VideoMetadata {
    id: Principal;
    title: string;
    playerId: Principal;
    description: string;
    sport: Sport;
    timestamp: bigint;
    blobId: string;
}
export interface Assessment {
    id: string;
    date: bigint;
    name: string;
    scout: Principal;
    sport: Sport;
}
export interface UserProfile {
    appRole: AppRole;
    name: string;
}
export enum AppRole {
    player = "player",
    scout = "scout",
    sponsor = "sponsor"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignScore(assessmentId: string, playerId: Principal, physical: bigint, technical: bigint, tactical: bigint, mental: bigint): Promise<void>;
    createAssessment(id: string, name: string, sport: Sport, date: bigint): Promise<void>;
    createOrUpdatePlayer(name: string, sport: Sport, village: string, bio: string, age: bigint): Promise<void>;
    createSponsorProfile(orgName: string, sport: Sport, description: string): Promise<void>;
    getAllAssessments(): Promise<Array<[string, Assessment]>>;
    getAllPlayers(): Promise<Array<[Principal, PlayerProfile]>>;
    getAllSponsors(): Promise<Array<[Principal, SponsorProfile]>>;
    getAllVideos(): Promise<Array<VideoMetadata>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLeaderboard(sport: Sport | null): Promise<Array<Score>>;
    getPlayer(id: Principal): Promise<PlayerProfile | null>;
    getPlayerScores(playerId: Principal): Promise<Array<Score>>;
    getShortlistedPlayers(sponsorId: Principal): Promise<Array<Principal>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideosByPlayer(playerId: Principal): Promise<Array<VideoMetadata>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    shortlistPlayer(playerId: Principal): Promise<void>;
    uploadVideo(title: string, description: string, sport: Sport, blobId: string, timestamp: bigint): Promise<void>;
}
