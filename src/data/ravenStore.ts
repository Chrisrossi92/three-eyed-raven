import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type {
  AchievementAward,
  ChronicleEntry,
  ChronicleSubmission,
  House,
  Player,
  RealmState
} from "./ravenTypes.js";

const dataDir = join(process.cwd(), "data");

const paths = {
  realm: join(dataDir, "realm.json"),
  houses: join(dataDir, "houses.json"),
  players: join(dataDir, "players.json"),
  chronicle: join(dataDir, "chronicle.json"),
  achievements: join(dataDir, "achievements.json"),
  submissions: join(dataDir, "submissions.json")
};

const defaultRealm: RealmState = {
  currentAge: "Age of Eikthyr",
  crownHouse: "House Baratheon",
  ruler: "CDAWG9000",
  currentTribute: {
    status: "Not Started",
    summary: "No Royal Tribute is currently active.",
    updatedAt: null
  },
  nextHunt: {
    boss: null,
    status: "Not Scheduled",
    scheduledFor: null,
    summary: "No Royal Hunt is currently scheduled."
  },
  recognizedHouses: ["House Baratheon", "House Stark", "House Lannister"],
  decrees: [],
  successionState: "Not Active"
};

const defaultHouses: House[] = [
  createStarterHouse("house-baratheon", "House Baratheon", "Active"),
  createStarterHouse("house-stark", "House Stark", "Active"),
  createStarterHouse("house-lannister", "House Lannister", "Active")
];

const defaultPlayers: Player[] = [];
const defaultChronicle: ChronicleEntry[] = [];
const defaultAchievements: AchievementAward[] = [];
const defaultSubmissions: ChronicleSubmission[] = [];

export async function loadRealm(): Promise<RealmState> {
  return readJsonFile(paths.realm, defaultRealm);
}

export async function saveRealm(realm: RealmState): Promise<void> {
  await writeJsonFile(paths.realm, realm);
}

export async function loadHouses(): Promise<House[]> {
  return readJsonFile(paths.houses, defaultHouses);
}

export async function saveHouses(houses: House[]): Promise<void> {
  await writeJsonFile(paths.houses, houses);
}

export async function loadPlayers(): Promise<Player[]> {
  return readJsonFile(paths.players, defaultPlayers);
}

export async function savePlayers(players: Player[]): Promise<void> {
  await writeJsonFile(paths.players, players);
}

export async function loadChronicle(): Promise<ChronicleEntry[]> {
  return readJsonFile(paths.chronicle, defaultChronicle);
}

export async function saveChronicle(chronicle: ChronicleEntry[]): Promise<void> {
  await writeJsonFile(paths.chronicle, chronicle);
}

export async function loadAchievements(): Promise<AchievementAward[]> {
  return readJsonFile(paths.achievements, defaultAchievements);
}

export async function saveAchievements(achievements: AchievementAward[]): Promise<void> {
  await writeJsonFile(paths.achievements, achievements);
}

export async function loadSubmissions(): Promise<ChronicleSubmission[]> {
  return readJsonFile(paths.submissions, defaultSubmissions);
}

export async function saveSubmissions(submissions: ChronicleSubmission[]): Promise<void> {
  await writeJsonFile(paths.submissions, submissions);
}

async function readJsonFile<T>(path: string, defaultValue: T): Promise<T> {
  try {
    const raw = await readFile(path, "utf8");
    return parseJson<T>(path, raw);
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === "ENOENT") {
      await writeJsonFile(path, defaultValue);
      return defaultValue;
    }

    throw error;
  }
}

async function writeJsonFile<T>(path: string, value: T): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function parseJson<T>(path: string, raw: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSON in ${path}: ${detail}`);
  }
}

function createStarterHouse(id: string, name: string, status: House["status"]): House {
  return {
    id,
    name,
    leaderDiscordId: null,
    memberDiscordIds: [],
    status,
    settlementName: null,
    currentGoal: null,
    alliances: [],
    rivals: [],
    branchOf: null,
    foundedAt: null,
    lastCheckInAt: null
  };
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
