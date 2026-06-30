export type HouseStatus =
  | "Active"
  | "Quiet"
  | "Recruiting"
  | "Preparing"
  | "At War"
  | "Needs Crown Attention";

export type TributeStatus =
  | "Not Started"
  | "Gathering"
  | "Partial"
  | "Nearly Complete"
  | "Complete";

export type HuntStatus = "Not Scheduled" | "Scheduled" | "Completed" | "Failed";

export type ChronicleSource = "admin" | "manual" | "story" | "automatic";

export type ChronicleSubmissionStatus = "pending" | "approved" | "rejected";

export type AchievementAwardTargetType = "player" | "house";

export interface RoyalTributeState {
  status: TributeStatus;
  summary: string;
  updatedAt: string | null;
}

export interface RoyalHuntState {
  boss: string | null;
  status: HuntStatus;
  scheduledFor: string | null;
  summary: string;
}

export interface RealmState {
  currentAge: string;
  crownHouse: string;
  ruler: string;
  currentTribute: RoyalTributeState;
  nextHunt: RoyalHuntState;
  recognizedHouses: string[];
  decrees: string[];
  successionState: string;
}

export interface House {
  id: string;
  name: string;
  words?: string | null;
  description?: string | null;
  sigil?: string | null;
  seat?: string | null;
  foundedLabel?: string | null;
  leaderDiscordId?: string | null;
  leaderRealmName?: string | null;
  leaderDisplayName?: string | null;
  memberDiscordIds: string[];
  status: HouseStatus;
  settlementName: string | null;
  currentGoal: string | null;
  alliances: string[];
  rivals: string[];
  branchOf: string | null;
  foundedAt: string | null;
  lastCheckInAt: string | null;
}

export interface Player {
  discordId: string;
  discordUsername?: string | null;
  serverNickname?: string | null;
  realmName?: string | null;
  displayName?: string | null;
  houseId?: string | null;
  achievements: string[];
  currentTitle: string | null;
  legacyNotes: string[];
}

export interface ChronicleEntry {
  id: string;
  date: string;
  type: string;
  summary: string;
  involvedHouses: string[];
  involvedPlayers: string[];
  approvedBy: string;
  source: ChronicleSource;
}

export interface AchievementAward {
  id: string;
  name: string;
  description: string;
  category: string;
  awardedToType: AchievementAwardTargetType;
  awardedToId: string;
  awardedAt: string;
  awardedBy: string;
}

export interface ChronicleSubmission {
  id: string;
  submittedAt: string;
  submittedByDiscordId: string;
  title: string;
  summary: string;
  involvedHouses: string[];
  involvedPlayers: string[];
  status: ChronicleSubmissionStatus;
}
