import {
  loadAchievements,
  loadHouses,
  loadPlayers,
  saveAchievements,
  savePlayers
} from "../data/ravenStore.js";
import type { AchievementAward, AchievementAwardTargetType, Player } from "../data/ravenTypes.js";
import type { RecordChronicleEntryInput } from "./chronicleService.js";
import { recordChronicleEntry } from "./chronicleService.js";

export interface AwardAchievementInput {
  id?: string;
  name: string;
  description: string;
  category: string;
  awardedToType: AchievementAwardTargetType;
  awardedToId: string;
  awardedBy: string;
  awardedAt?: string;
  displayName?: string;
  discordUsername?: string;
  serverNickname?: string;
  realmName?: string;
  recordChronicle?: boolean;
}

export interface GrantTitleInput {
  discordId: string;
  displayName?: string;
  discordUsername?: string;
  serverNickname?: string;
  realmName?: string;
  title: string;
  grantedBy: string;
  grantedAt?: string;
  reason?: string;
  recordChronicle?: boolean;
}

export interface RemoveTitleInput {
  discordId: string;
  reason?: string;
  removedBy?: string;
}

export interface AddLegacyNoteInput {
  discordId: string;
  displayName?: string;
  discordUsername?: string;
  serverNickname?: string;
  realmName?: string;
  note: string;
  source?: string;
  createdAt?: string;
}

export async function listAchievements(): Promise<AchievementAward[]> {
  return loadAchievements();
}

export async function awardAchievement(input: AwardAchievementInput): Promise<AchievementAward> {
  const name = input.name.trim();
  const awardedToId = input.awardedToId.trim();
  if (!name) {
    throw new Error("Achievement name is required.");
  }
  if (!awardedToId) {
    throw new Error("Achievement award target id is required.");
  }
  if (input.awardedToType !== "player" && input.awardedToType !== "house") {
    throw new Error(`Unsupported achievement award target type: ${input.awardedToType}`);
  }

  if (input.awardedToType === "house") {
    await assertKnownHouse(awardedToId);
  } else {
    await ensurePlayer(
      createEnsurePlayerInput({
        discordId: awardedToId,
        displayName: input.displayName,
        discordUsername: input.discordUsername,
        serverNickname: input.serverNickname,
        realmName: input.realmName
      })
    );
  }

  const achievements = await loadAchievements();
  const duplicate = achievements.some(
    (achievement) =>
      normalizeName(achievement.name) === normalizeName(name) &&
      achievement.awardedToType === input.awardedToType &&
      achievement.awardedToId === awardedToId
  );
  if (duplicate) {
    throw new Error(
      `Duplicate achievement award: ${name} for ${input.awardedToType} ${awardedToId}`
    );
  }

  const awardedAt = input.awardedAt ?? new Date().toISOString();
  const achievement: AchievementAward = {
    id: input.id ?? createLegacyId("achievement", name, awardedToId, awardedAt),
    name,
    description: input.description,
    category: input.category,
    awardedToType: input.awardedToType,
    awardedToId,
    awardedAt,
    awardedBy: input.awardedBy
  };

  achievements.push(achievement);
  await saveAchievements(achievements);

  if (input.awardedToType === "player") {
    await addAchievementToPlayer(awardedToId, achievement.id);
  }

  if (input.recordChronicle === true) {
    await recordChronicleEntry({
      type: "achievement",
      summary: `${input.awardedToType === "house" ? "House" : "Player"} ${awardedToId} earned achievement: ${name}.`,
      involvedHouses: input.awardedToType === "house" ? [awardedToId] : [],
      involvedPlayers: input.awardedToType === "player" ? [awardedToId] : [],
      approvedBy: input.awardedBy,
      source: "admin"
    });
  }

  return achievement;
}

export async function grantTitle(input: GrantTitleInput): Promise<Player> {
  const title = input.title.trim();
  if (!title) {
    throw new Error("Title is required.");
  }

  const player = await ensurePlayer(
    createEnsurePlayerInput({
      discordId: input.discordId,
      displayName: input.displayName,
      discordUsername: input.discordUsername,
      serverNickname: input.serverNickname,
      realmName: input.realmName
    })
  );

  const updatedPlayer: Player = {
    ...player,
    currentTitle: title
  };
  await savePlayer(updatedPlayer);

  if (input.recordChronicle === true) {
    const reason = input.reason ? ` Reason: ${input.reason}` : "";
    const chronicleInput: RecordChronicleEntryInput = {
      type: "title",
      summary: `${getPlayerDisplayName(updatedPlayer)} was granted the title ${title}.${reason}`,
      involvedPlayers: [updatedPlayer.discordId],
      approvedBy: input.grantedBy,
      source: "admin"
    };
    if (input.grantedAt) {
      chronicleInput.date = input.grantedAt;
    }

    await recordChronicleEntry(chronicleInput);
  }

  return updatedPlayer;
}

export async function removeTitle(input: RemoveTitleInput): Promise<Player> {
  const players = await loadPlayers();
  const player = players.find((candidate) => candidate.discordId === input.discordId);
  if (!player) {
    throw new Error(`Unknown player: ${input.discordId}`);
  }

  const updatedPlayer: Player = {
    ...player,
    currentTitle: null
  };
  await savePlayer(updatedPlayer);
  return updatedPlayer;
}

export async function addLegacyNote(input: AddLegacyNoteInput): Promise<Player> {
  const note = input.note.trim();
  if (!note) {
    throw new Error("Legacy note is required.");
  }

  const player = await ensurePlayer(
    createEnsurePlayerInput({
      discordId: input.discordId,
      displayName: input.displayName,
      discordUsername: input.discordUsername,
      serverNickname: input.serverNickname,
      realmName: input.realmName
    })
  );

  const createdAt = input.createdAt ?? new Date().toISOString();
  const source = input.source ?? "manual";
  const updatedPlayer: Player = {
    ...player,
    legacyNotes: [...player.legacyNotes, `${createdAt} [${source}] ${note}`]
  };

  await savePlayer(updatedPlayer);
  return updatedPlayer;
}

async function ensurePlayer(input: {
  discordId: string;
  displayName?: string;
  discordUsername?: string;
  serverNickname?: string;
  realmName?: string;
}): Promise<Player> {
  const discordId = input.discordId.trim();
  if (!discordId) {
    throw new Error("Player Discord id is required.");
  }

  const players = await loadPlayers();
  const existingPlayer = players.find((player) => player.discordId === discordId);
  if (existingPlayer) {
    const updatedPlayer = applyPlayerIdentity(existingPlayer, input);
    if (updatedPlayer !== existingPlayer) {
      await savePlayer(updatedPlayer);
    }
    return updatedPlayer;
  }

  if (!hasAnyDisplayIdentity(input)) {
    throw new Error(`Unknown player: ${discordId}`);
  }

  const player: Player = {
    discordId,
    houseId: null,
    achievements: [],
    currentTitle: null,
    legacyNotes: []
  };
  const identifiedPlayer = applyPlayerIdentity(player, input);
  await savePlayers([...players, identifiedPlayer]);
  return identifiedPlayer;
}

function createEnsurePlayerInput(input: {
  discordId: string;
  displayName?: string | undefined;
  discordUsername?: string | undefined;
  serverNickname?: string | undefined;
  realmName?: string | undefined;
}): {
  discordId: string;
  displayName?: string;
  discordUsername?: string;
  serverNickname?: string;
  realmName?: string;
} {
  const output: {
    discordId: string;
    displayName?: string;
    discordUsername?: string;
    serverNickname?: string;
    realmName?: string;
  } = { discordId: input.discordId };

  if (input.displayName !== undefined) {
    output.displayName = input.displayName;
  }
  if (input.discordUsername !== undefined) {
    output.discordUsername = input.discordUsername;
  }
  if (input.serverNickname !== undefined) {
    output.serverNickname = input.serverNickname;
  }
  if (input.realmName !== undefined) {
    output.realmName = input.realmName;
  }

  return output;
}

function applyPlayerIdentity(
  player: Player,
  input: {
    displayName?: string;
    discordUsername?: string;
    serverNickname?: string;
    realmName?: string;
  }
): Player {
  const updated: Player = { ...player };
  let changed = false;

  if (input.displayName !== undefined) {
    updated.displayName = input.displayName || null;
    changed = true;
  }
  if (input.discordUsername !== undefined) {
    updated.discordUsername = input.discordUsername || null;
    changed = true;
  }
  if (input.serverNickname !== undefined) {
    updated.serverNickname = input.serverNickname || null;
    changed = true;
  }
  if (input.realmName !== undefined) {
    updated.realmName = input.realmName || null;
    changed = true;
  }

  return changed ? updated : player;
}

function hasAnyDisplayIdentity(input: {
  displayName?: string;
  discordUsername?: string;
  serverNickname?: string;
  realmName?: string;
}): boolean {
  return Boolean(
    input.realmName?.trim() ||
      input.serverNickname?.trim() ||
      input.displayName?.trim() ||
      input.discordUsername?.trim()
  );
}

function getPlayerDisplayName(player: Player): string {
  return (
    player.realmName?.trim() ||
    player.serverNickname?.trim() ||
    player.displayName?.trim() ||
    player.discordUsername?.trim() ||
    player.discordId
  );
}

async function savePlayer(player: Player): Promise<void> {
  const players = await loadPlayers();
  const existingIndex = players.findIndex((candidate) => candidate.discordId === player.discordId);
  if (existingIndex >= 0) {
    players[existingIndex] = player;
  } else {
    players.push(player);
  }

  await savePlayers(players);
}

async function addAchievementToPlayer(discordId: string, achievementId: string): Promise<void> {
  const players = await loadPlayers();
  const player = players.find((candidate) => candidate.discordId === discordId);
  if (!player) {
    throw new Error(`Unknown player: ${discordId}`);
  }

  if (player.achievements.includes(achievementId)) {
    return;
  }

  await savePlayer({
    ...player,
    achievements: [...player.achievements, achievementId]
  });
}

async function assertKnownHouse(houseId: string): Promise<void> {
  const houses = await loadHouses();
  if (!houses.some((house) => house.id === houseId)) {
    throw new Error(`Unknown House id: ${houseId}`);
  }
}

function createLegacyId(kind: string, name: string, targetId: string, date: string): string {
  return `${kind}-${slugify(name)}-${slugify(targetId)}-${compactTimestamp(date)}`;
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "legacy";
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

function compactTimestamp(value: string): string {
  return value.replace(/[^0-9a-z]/gi, "").toLowerCase();
}
