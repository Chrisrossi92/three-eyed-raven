export type MemoryCategory =
  | "server-history"
  | "house"
  | "player"
  | "achievement"
  | "war"
  | "alliance"
  | "betrayal"
  | "boss-progression"
  | "roleplay"
  | "admin-decision";

export type MemoryEntry = {
  id: string;
  category: MemoryCategory;
  title: string;
  summary: string;
  occurredAt: string;
  source: "manual" | "discord" | "gameops";
  confidence: "confirmed" | "claimed" | "inferred";
  tags: string[];
};

export class MemoryService {
  async record(entry: MemoryEntry): Promise<MemoryEntry> {
    return entry;
  }
}
