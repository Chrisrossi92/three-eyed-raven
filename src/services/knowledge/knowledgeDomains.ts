export type KnowledgeDomainName =
  | "realm-canon"
  | "chronicle"
  | "realm-state"
  | "raven-mind"
  | "world-intelligence";

export type DomainMutability = "low" | "medium" | "high" | "append-first";

export type KnowledgeDomainMetadata = {
  name: KnowledgeDomainName;
  label: string;
  purpose: string;
  owner: string;
  mutability: DomainMutability;
  persistence: string;
};

export type DomainDocumentBase<TName extends KnowledgeDomainName> = {
  domain: TName;
  version: number;
  description: string;
};

export type RealmCanonCategory =
  | "server-premise"
  | "role"
  | "rule"
  | "guide_faq"
  | "house"
  | "boss-progression"
  | "rebellion-mechanic"
  | "protected-area"
  | "roleplay-expectation";

export type RealmCanonRecord = {
  id: string;
  category: RealmCanonCategory;
  title: string;
  summary: string;
  aliases?: string[];
  answer?: string;
  relatedCommands?: string[];
  domainReferences?: string[];
  status: "draft" | "active" | "retired" | "needs_decision";
  tags: string[];
};

export type RealmCanonDomain = DomainDocumentBase<"realm-canon"> & {
  records: RealmCanonRecord[];
};

export type ChronicleCategory =
  | "boss-kill"
  | "alliance"
  | "betrayal"
  | "battle"
  | "throne-change"
  | "ruling"
  | "ceremony"
  | "major-build"
  | "server-wide-event";

export type ChronicleEvent = {
  id: string;
  category: ChronicleCategory;
  title: string;
  summary: string;
  occurredAt: string | null;
  status: "placeholder" | "claimed" | "validated" | "corrected";
  actors: string[];
  houses: string[];
  sources: string[];
  tags: string[];
};

export type ChronicleDomain = DomainDocumentBase<"chronicle"> & {
  events: ChronicleEvent[];
};

export type RealmOfficer = {
  name: string;
  since: string | null;
  source: string;
};

export type ActiveHouse = {
  id: string;
  name: string;
  leader: string | null;
  members: string[];
  status: "forming" | "active" | "inactive" | "fallen";
};

export type RealmRelationship = {
  houses: string[];
  since: string | null;
  source: string;
};

export type BossGate = {
  boss: string;
  status: "not-started" | "active" | "defeated" | "locked";
  updatedAt: string | null;
};

export type RealmSeasonState = {
  name: string;
  status: "setup" | "active" | "paused" | "complete";
  startedAt: string | null;
};

export type RealmRoleAssignment = {
  role: string;
  holder: string;
  houseId: string | null;
  status: "confirmed" | "draft" | "considering";
  source: string;
};

export type PendingDecision = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
};

export type RealmStateDomain = DomainDocumentBase<"realm-state"> & {
  currentKing: RealmOfficer;
  handOfTheKing: RealmOfficer | null;
  kingsguard: RealmOfficer[];
  knownRoles: RealmRoleAssignment[];
  activeHouses: ActiveHouse[];
  currentAlliances: RealmRelationship[];
  currentWars: RealmRelationship[];
  activeBossGate: BossGate;
  season: RealmSeasonState;
  pendingDecisions: PendingDecision[];
};

export type RavenModeName = "plain-guide" | "lore" | "snark";

export type RavenModeDefinition = {
  name: RavenModeName;
  purpose: string;
  maxSentences: number;
};

export type RavenResponseBoundaries = {
  defaultVisibility: "public" | "private";
  preferPrivateFor: string[];
  neverInventFacts: boolean;
  fallbackMessage: string;
  privateAdminGuidance: string;
};

export type RavenKeywordTrigger = {
  phrase: string;
  mode: RavenModeName;
  responseHint: string;
  enabled: boolean;
};

export type RavenMindDomain = DomainDocumentBase<"raven-mind"> & {
  modes: RavenModeDefinition[];
  silenceRules: string[];
  keywordTriggers: RavenKeywordTrigger[];
  responseBoundaries: RavenResponseBoundaries;
};

export type WorldServerStatus = {
  state: "unknown" | "online" | "offline" | "restarting";
  uptimeSeconds: number | null;
  updatedAt: string | null;
};

export type OnlinePlayerSnapshot = {
  playerName: string;
  houseId: string | null;
  joinedAt: string | null;
  lastSeenAt: string | null;
};

export type WorldIntelligenceEvent = {
  id: string;
  type: string;
  observedAt: string;
  source: "gameops" | "manual" | "discord";
  payload: Record<string, unknown>;
};

export type GameOpsBridgeState = {
  enabled: boolean;
  lastSuccessfulSyncAt: string | null;
  lastEventId: string | null;
};

export type WorldIntelligenceDomain = DomainDocumentBase<"world-intelligence"> & {
  serverStatus: WorldServerStatus;
  onlinePlayers: OnlinePlayerSnapshot[];
  recentEvents: WorldIntelligenceEvent[];
  gameOpsBridge: GameOpsBridgeState;
};

export type KnowledgeDomainMap = {
  "realm-canon": RealmCanonDomain;
  chronicle: ChronicleDomain;
  "realm-state": RealmStateDomain;
  "raven-mind": RavenMindDomain;
  "world-intelligence": WorldIntelligenceDomain;
};

export type AnyKnowledgeDomain = KnowledgeDomainMap[KnowledgeDomainName];

export const knowledgeDomainMetadata: Record<KnowledgeDomainName, KnowledgeDomainMetadata> = {
  "realm-canon": {
    name: "realm-canon",
    label: "Realm Canon",
    purpose: "Permanent server truth.",
    owner: "King and staff",
    mutability: "low",
    persistence: "Readable JSON, later versioned admin-managed storage."
  },
  chronicle: {
    name: "chronicle",
    label: "Chronicle",
    purpose: "Validated historical memory.",
    owner: "Staff, chroniclers, and validated event pipelines",
    mutability: "append-first",
    persistence: "Readable JSON timeline, later event store or database."
  },
  "realm-state": {
    name: "realm-state",
    label: "Realm State",
    purpose: "Current living status of the realm.",
    owner: "Staff and validated systems",
    mutability: "medium",
    persistence: "Readable JSON snapshot, later state tables."
  },
  "raven-mind": {
    name: "raven-mind",
    label: "Raven Mind",
    purpose: "Personality and response logic.",
    owner: "Bot maintainers and staff",
    mutability: "medium",
    persistence: "Readable JSON config plus TypeScript response behavior."
  },
  "world-intelligence": {
    name: "world-intelligence",
    label: "World Intelligence",
    purpose: "Future live telemetry and GameOps Bridge input.",
    owner: "GameOps adapters, validation services, and staff reviewers",
    mutability: "high",
    persistence: "Readable JSON snapshot/event buffer, later telemetry store."
  }
};

export const knowledgeDomainFileNames: Record<KnowledgeDomainName, string> = {
  "realm-canon": "realm-canon.json",
  chronicle: "chronicle.json",
  "realm-state": "realm-state.json",
  "raven-mind": "raven-mind.json",
  "world-intelligence": "world-intelligence.json"
};
