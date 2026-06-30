import { loadRealm, saveRealm } from "../data/ravenStore.js";
import type { HuntStatus, RealmState, RoyalHuntState, RoyalTributeState } from "../data/ravenTypes.js";
import type { RecordChronicleEntryInput } from "./chronicleService.js";
import { recordChronicleEntry } from "./chronicleService.js";

export interface RealmStatus {
  currentAge: string;
  crownHouse: string;
  ruler: string;
  currentTribute: RoyalTributeState;
  nextHunt: RoyalHuntState;
  recognizedHouseCount: number;
  recognizedHouseNames: string[];
}

export interface UpdateTributeStatusInput {
  status: RoyalTributeState["status"];
  summary?: string;
  updatedAt?: string | null;
}

export interface ScheduleRoyalHuntInput {
  boss: string;
  scheduledFor: string;
  age?: string;
  summary?: string;
  status?: Extract<HuntStatus, "Scheduled">;
}

export interface CompleteRoyalHuntInput {
  boss?: string;
  completedAt?: string;
  summary?: string;
  nextAge?: string;
  involvedHouses?: string[];
  involvedPlayers?: string[];
  approvedBy?: string;
}

export async function getRealmStatus(): Promise<RealmStatus> {
  const realm = await loadRealm();

  return {
    currentAge: realm.currentAge,
    crownHouse: realm.crownHouse,
    ruler: realm.ruler,
    currentTribute: realm.currentTribute,
    nextHunt: realm.nextHunt,
    recognizedHouseCount: realm.recognizedHouses.length,
    recognizedHouseNames: realm.recognizedHouses
  };
}

export async function setCurrentAge(age: string): Promise<RealmState> {
  const trimmedAge = age.trim();
  if (!trimmedAge) {
    throw new Error("Current Age is required.");
  }

  const realm = await loadRealm();
  realm.currentAge = trimmedAge;
  await saveRealm(realm);
  return realm;
}

export async function updateTributeStatus(input: UpdateTributeStatusInput): Promise<RoyalTributeState> {
  const realm = await loadRealm();
  realm.currentTribute = {
    status: input.status,
    summary: input.summary ?? realm.currentTribute.summary,
    updatedAt: input.updatedAt ?? new Date().toISOString()
  };

  await saveRealm(realm);
  return realm.currentTribute;
}

export async function scheduleRoyalHunt(input: ScheduleRoyalHuntInput): Promise<RoyalHuntState> {
  const boss = input.boss.trim();
  if (!boss) {
    throw new Error("Royal Hunt boss is required.");
  }

  const realm = await loadRealm();
  const agePrefix = input.age ? `${input.age}: ` : "";
  realm.nextHunt = {
    boss,
    status: input.status ?? "Scheduled",
    scheduledFor: input.scheduledFor,
    summary: input.summary ?? `${agePrefix}Royal Hunt scheduled for ${boss}.`
  };

  await saveRealm(realm);
  return realm.nextHunt;
}

export async function completeRoyalHunt(input: CompleteRoyalHuntInput): Promise<{
  realm: RealmState;
  chronicleEntryId: string;
}> {
  const realm = await loadRealm();
  const boss = input.boss?.trim() || realm.nextHunt.boss || "Unknown Boss";
  const completedAt = input.completedAt ?? new Date().toISOString();
  const summary = input.summary ?? `Royal Hunt completed: ${boss}.`;

  realm.nextHunt = {
    ...realm.nextHunt,
    boss,
    status: "Completed",
    summary
  };

  if (input.nextAge) {
    const nextAge = input.nextAge.trim();
    if (!nextAge) {
      throw new Error("Next Age cannot be blank when provided.");
    }
    realm.currentAge = nextAge;
  }

  await saveRealm(realm);

  const chronicleInput: RecordChronicleEntryInput = {
    date: completedAt,
    type: "royal_hunt",
    summary,
    source: "admin"
  };
  if (input.involvedHouses) {
    chronicleInput.involvedHouses = input.involvedHouses;
  }
  if (input.involvedPlayers) {
    chronicleInput.involvedPlayers = input.involvedPlayers;
  }
  if (input.approvedBy) {
    chronicleInput.approvedBy = input.approvedBy;
  }

  const chronicleEntry = await recordChronicleEntry(chronicleInput);

  return {
    realm,
    chronicleEntryId: chronicleEntry.id
  };
}
