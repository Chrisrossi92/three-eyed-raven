import {
  loadHouses,
  loadPlayers,
  loadRealm,
  saveHouses,
  savePlayers,
  saveRealm
} from "../data/ravenStore.js";
import type { House, HouseStatus, Player } from "../data/ravenTypes.js";

export interface RecognizeHouseInput {
  id: string;
  name: string;
  leaderDiscordId?: string | null;
  leaderRealmName?: string | null;
  leaderDisplayName?: string | null;
  settlementName?: string | null;
  status?: HouseStatus;
  branchOf?: string | null;
  foundedAt?: string | null;
}

export interface UpdateHouseInput {
  id: string;
  leaderDiscordId?: string | null;
  leaderRealmName?: string | null;
  leaderDisplayName?: string | null;
  status?: HouseStatus;
  settlementName?: string | null;
  currentGoal?: string | null;
  alliances?: string[];
  rivals?: string[];
  branchOf?: string | null;
  lastCheckInAt?: string | null;
}

export interface AssignPlayerToHouseInput {
  discordId: string;
  displayName?: string | null;
  discordUsername?: string | null;
  serverNickname?: string | null;
  realmName?: string | null;
  houseId: string;
}

export async function listHouses(): Promise<House[]> {
  return loadHouses();
}

export async function getHouseById(id: string): Promise<House | undefined> {
  const houses = await loadHouses();
  return houses.find((house) => house.id === id);
}

export async function getHouseByName(name: string): Promise<House | undefined> {
  const houses = await loadHouses();
  const normalizedName = normalizeName(name);
  return houses.find((house) => normalizeName(house.name) === normalizedName);
}

export async function recognizeHouse(input: RecognizeHouseInput): Promise<House> {
  const id = input.id.trim();
  const name = input.name.trim();
  if (!id) {
    throw new Error("House id is required.");
  }
  if (!name) {
    throw new Error("House name is required.");
  }

  const houses = await loadHouses();
  if (houses.some((house) => house.id === id)) {
    throw new Error(`House id already exists: ${id}`);
  }
  if (houses.some((house) => normalizeName(house.name) === normalizeName(name))) {
    throw new Error(`House name already exists: ${name}`);
  }

  const house: House = {
    id,
    name,
    leaderDiscordId: input.leaderDiscordId ?? null,
    leaderRealmName: input.leaderRealmName ?? null,
    leaderDisplayName: input.leaderDisplayName ?? null,
    memberDiscordIds: [],
    status: input.status ?? "Active",
    settlementName: input.settlementName ?? null,
    currentGoal: null,
    alliances: [],
    rivals: [],
    branchOf: input.branchOf ?? null,
    foundedAt: input.foundedAt ?? new Date().toISOString(),
    lastCheckInAt: null
  };

  houses.push(house);
  await saveHouses(houses);

  const realm = await loadRealm();
  if (!realm.recognizedHouses.some((houseName) => normalizeName(houseName) === normalizeName(name))) {
    realm.recognizedHouses.push(name);
    await saveRealm(realm);
  }

  return house;
}

export async function updateHouse(input: UpdateHouseInput): Promise<House> {
  const houses = await loadHouses();
  const index = houses.findIndex((house) => house.id === input.id);
  if (index < 0) {
    throw new Error(`Unknown House id: ${input.id}`);
  }

  const existing = houses[index];
  if (!existing) {
    throw new Error(`Unknown House id: ${input.id}`);
  }

  const updated: House = { ...existing };
  if ("leaderDiscordId" in input) {
    updated.leaderDiscordId = input.leaderDiscordId ?? null;
  }
  if ("leaderRealmName" in input) {
    updated.leaderRealmName = input.leaderRealmName ?? null;
  }
  if ("leaderDisplayName" in input) {
    updated.leaderDisplayName = input.leaderDisplayName ?? null;
  }
  if ("status" in input && input.status) {
    updated.status = input.status;
  }
  if ("settlementName" in input) {
    updated.settlementName = input.settlementName ?? null;
  }
  if ("currentGoal" in input) {
    updated.currentGoal = input.currentGoal ?? null;
  }
  if ("alliances" in input && input.alliances) {
    updated.alliances = input.alliances;
  }
  if ("rivals" in input && input.rivals) {
    updated.rivals = input.rivals;
  }
  if ("branchOf" in input) {
    updated.branchOf = input.branchOf ?? null;
  }
  if ("lastCheckInAt" in input) {
    updated.lastCheckInAt = input.lastCheckInAt ?? null;
  }

  houses[index] = updated;
  await saveHouses(houses);
  return updated;
}

export async function assignPlayerToHouse(input: AssignPlayerToHouseInput): Promise<Player> {
  const houseId = input.houseId.trim();
  const houses = await loadHouses();
  const targetHouse = houses.find((house) => house.id === houseId);
  if (!targetHouse) {
    throw new Error(`Unknown House id: ${houseId}`);
  }

  const players = await loadPlayers();
  const existingPlayer = players.find((player) => player.discordId === input.discordId);
  const player: Player = existingPlayer
    ? applyPlayerIdentity(existingPlayer, input, houseId)
    : createPlayerFromAssignment(input, houseId);

  const nextPlayers = existingPlayer
    ? players.map((existing) => (existing.discordId === input.discordId ? player : existing))
    : [...players, player];

  const nextHouses = houses.map((house) => {
    const memberDiscordIds = house.memberDiscordIds.filter((discordId) => discordId !== input.discordId);
    if (house.id === houseId) {
      memberDiscordIds.push(input.discordId);
    }

    return {
      ...house,
      memberDiscordIds
    };
  });

  await savePlayers(nextPlayers);
  await saveHouses(nextHouses);
  return player;
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function createPlayerFromAssignment(input: AssignPlayerToHouseInput, houseId: string): Player {
  const player: Player = {
    discordId: input.discordId,
    houseId,
    achievements: [],
    currentTitle: null,
    legacyNotes: []
  };

  return applyPlayerIdentity(player, input, houseId);
}

function applyPlayerIdentity(
  player: Player,
  input: AssignPlayerToHouseInput,
  houseId: string
): Player {
  const updated: Player = {
    ...player,
    houseId
  };

  if ("displayName" in input) {
    updated.displayName = input.displayName ?? null;
  }
  if ("discordUsername" in input) {
    updated.discordUsername = input.discordUsername ?? null;
  }
  if ("serverNickname" in input) {
    updated.serverNickname = input.serverNickname ?? null;
  }
  if ("realmName" in input) {
    updated.realmName = input.realmName ?? null;
  }

  return updated;
}
