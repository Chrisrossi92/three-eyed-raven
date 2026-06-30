import {
  type AnyKnowledgeDomain,
  type ChronicleEvent,
  type KnowledgeDomainMap,
  type KnowledgeDomainName,
  type RavenKeywordTrigger,
  type RavenModeDefinition,
  type RealmCanonRecord,
  type RealmRoleAssignment,
  type ActiveHouse,
  type PendingDecision,
  knowledgeDomainMetadata
} from "./knowledgeDomains.js";
import { KnowledgeRepository } from "./knowledgeRepository.js";

export type KnowledgeRecordKind =
  | "canon-record"
  | "chronicle-event"
  | "realm-role"
  | "active-house"
  | "pending-decision"
  | "raven-mode"
  | "keyword-trigger"
  | "world-status";

export type KnowledgeRecord = {
  domain: KnowledgeDomainName;
  kind: KnowledgeRecordKind;
  id: string;
  title: string;
  summary: string;
  aliases?: string[];
  relatedCommands?: string[];
  domainReferences?: string[];
  tags: string[];
  status: string;
};

export type KnowledgeSummary = {
  domainCount: number;
  domains: Array<{
    name: KnowledgeDomainName;
    label: string;
    purpose: string;
  }>;
  publicFacts: string[];
};

export type AdminKnowledgeSummary = KnowledgeSummary & {
  counts: Record<KnowledgeDomainName, number>;
  pendingDecisionIds: string[];
  draftCanonRecordIds: string[];
};

export type ProgressionSummary = {
  topic: string;
  records: KnowledgeRecord[];
  suggestedTopics: string[];
};

export type RoleSummary = {
  role: string;
  records: KnowledgeRecord[];
  suggestedRoles: string[];
};

export type OnboardingSummary = KnowledgeSummary & {
  commandHints: string[];
};

export type RulesSummary = {
  topic: string;
  records: KnowledgeRecord[];
  suggestedTopics: string[];
};

export type GuideFaqSummary = {
  query: string;
  records: KnowledgeRecord[];
};

export class KnowledgeService {
  constructor(private readonly repository: KnowledgeRepository) {}

  async getDomain(domainName: "realm-canon"): Promise<KnowledgeDomainMap["realm-canon"]>;
  async getDomain(domainName: "chronicle"): Promise<KnowledgeDomainMap["chronicle"]>;
  async getDomain(domainName: "realm-state"): Promise<KnowledgeDomainMap["realm-state"]>;
  async getDomain(domainName: "raven-mind"): Promise<KnowledgeDomainMap["raven-mind"]>;
  async getDomain(domainName: "world-intelligence"): Promise<KnowledgeDomainMap["world-intelligence"]>;
  async getDomain(domainName: KnowledgeDomainName): Promise<AnyKnowledgeDomain>;
  async getDomain(domainName: KnowledgeDomainName): Promise<AnyKnowledgeDomain> {
    return this.repository.readDomain(domainName);
  }

  async getRecordById(domainName: KnowledgeDomainName, id: string): Promise<KnowledgeRecord | null> {
    const domain = await this.repository.readDomain(domainName);
    return this.recordsFromDomain(domain).find((record) => record.id === id) ?? null;
  }

  async findRecordsByTag(domainName: KnowledgeDomainName, tag: string): Promise<KnowledgeRecord[]> {
    const normalizedTag = normalize(tag);
    const domain = await this.repository.readDomain(domainName);

    return this.recordsFromDomain(domain).filter((record) =>
      record.tags.some((candidate) => normalize(candidate) === normalizedTag)
    );
  }

  async searchRecords(query: string): Promise<KnowledgeRecord[]> {
    const normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      return [];
    }

    const domains = await this.repository.readAllDomains();

    return domains
      .flatMap((domain) => this.recordsFromDomain(domain))
      .filter((record) => this.recordSearchText(record).includes(normalizedQuery));
  }

  async getGuideFaqSummary(query?: string): Promise<GuideFaqSummary> {
    const normalizedQuery = normalize(query ?? "");

    if (!normalizedQuery) {
      return {
        query: normalizedQuery,
        records: []
      };
    }

    const [canon, state] = await Promise.all([
      this.repository.readDomain("realm-canon"),
      this.repository.readDomain("realm-state")
    ]);
    const stateRecords = this.recordsFromDomain(state);
    const faqRecords = canon.records
      .filter((record) => record.category === "guide_faq")
      .map(recordFromCanon)
      .map((record) => ({
        record,
        score: scoreGuideFaqRecord(record, normalizedQuery)
      }))
      .filter((candidate) => candidate.score > 0)
      .sort((left, right) => right.score - left.score || left.record.title.localeCompare(right.record.title))
      .map((candidate) => candidate.record);
    const primaryFaqRecords = faqRecords.slice(0, 2);
    const referencedRecords = primaryFaqRecords.flatMap((record) => resolveGuideReferences(record, stateRecords));

    return {
      query: normalizedQuery,
      records: uniqueRecordsById([...primaryFaqRecords, ...referencedRecords])
    };
  }

  async getPublicKnowledgeSummary(): Promise<KnowledgeSummary> {
    const [realmCanon, realmState] = await Promise.all([
      this.repository.readDomain("realm-canon"),
      this.repository.readDomain("realm-state")
    ]);

    const activeCanon = realmCanon.records.filter((record) => record.status === "active");

    return {
      domainCount: Object.keys(knowledgeDomainMetadata).length,
      domains: Object.values(knowledgeDomainMetadata).map((metadata) => ({
        name: metadata.name,
        label: metadata.label,
        purpose: metadata.purpose
      })),
      publicFacts: [
        `Current ruler: ${realmState.currentKing.name}`,
        `Launch phase: ${realmState.season.name}`,
        `Active boss gate: ${realmState.activeBossGate.boss}`,
        `Active canon records: ${activeCanon.length}`
      ]
    };
  }

  async getAdminKnowledgeSummary(): Promise<AdminKnowledgeSummary> {
    const domains = await this.repository.readAllDomains();
    const records = domains.flatMap((domain) => this.recordsFromDomain(domain));
    const publicSummary = await this.getPublicKnowledgeSummary();

    return {
      ...publicSummary,
      counts: {
        "realm-canon": records.filter((record) => record.domain === "realm-canon").length,
        chronicle: records.filter((record) => record.domain === "chronicle").length,
        "realm-state": records.filter((record) => record.domain === "realm-state").length,
        "raven-mind": records.filter((record) => record.domain === "raven-mind").length,
        "world-intelligence": records.filter((record) => record.domain === "world-intelligence").length
      },
      pendingDecisionIds: records
        .filter((record) => record.tags.includes("pending-decision") || record.status === "needs_decision")
        .map((record) => record.id),
      draftCanonRecordIds: records
        .filter((record) => record.domain === "realm-canon" && record.status === "draft")
        .map((record) => record.id)
    };
  }

  async getProgressionSummary(topic?: string): Promise<ProgressionSummary> {
    const normalizedTopic = normalize(topic ?? "overview");
    const [canon, state] = await Promise.all([
      this.repository.readDomain("realm-canon"),
      this.repository.readDomain("realm-state")
    ]);
    const canonRecords = canon.records.map(recordFromCanon);
    const stateRecords = this.recordsFromDomain(state);
    const allPublicRecords = [...canonRecords, ...stateRecords];
    const topicRecords = progressionRecordsForTopic(allPublicRecords, normalizedTopic);

    return {
      topic: normalizedTopic,
      records: topicRecords,
      suggestedTopics: ["overview", "bosses", "rebellion", "throne", "new player", "current gate"]
    };
  }

  async getRoleSummary(role?: string): Promise<RoleSummary> {
    const normalizedRole = normalize(role ?? "overview");
    const [canon, state] = await Promise.all([
      this.repository.readDomain("realm-canon"),
      this.repository.readDomain("realm-state")
    ]);
    const canonRoleRecords = canon.records.map(recordFromCanon).filter(isRolePublicRecord);
    const stateRoleRecords = this.recordsFromDomain(state).filter(isRolePublicRecord);
    const allPublicRoleRecords = [...canonRoleRecords, ...stateRoleRecords];
    const roleRecords = roleRecordsForTopic(allPublicRoleRecords, normalizedRole);

    return {
      role: normalizedRole,
      records: roleRecords,
      suggestedRoles: ["king", "hand", "kingsguard", "house leader", "house member"]
    };
  }

  async getOnboardingSummary(): Promise<OnboardingSummary> {
    const [canon, state] = await Promise.all([
      this.repository.readDomain("realm-canon"),
      this.repository.readDomain("realm-state")
    ]);
    const records = canon.records.map(recordFromCanon);
    const byId = new Map(records.map((record) => [record.id, record]));
    const serverPremise = byId.get("canon-server-premise");
    const onboarding = byId.get("canon-new-player-onboarding");
    const houseMember = byId.get("role-house-member");
    const progression = byId.get("canon-boss-progression-concept");
    const roleplay = byId.get("canon-roleplay-expectations");
    const houseNames = state.activeHouses.map((house) => house.name).join(", ") || "houses are still forming";

    return {
      domainCount: Object.keys(knowledgeDomainMetadata).length,
      domains: Object.values(knowledgeDomainMetadata).map((metadata) => ({
        name: metadata.name,
        label: metadata.label,
        purpose: metadata.purpose
      })),
      publicFacts: [
        `Server: ${serverPremise?.summary ?? "A Thrones-inspired Valheim roleplay realm."}`,
        `Start here: ${onboarding?.summary ?? "Learn the premise, choose a house path, and ask staff what is final for launch."}`,
        `Houses: ${houseNames}. ${houseMember?.summary ?? "House members help gather, build, defend, explore, and roleplay."}`,
        `Progression: ${progression?.summary ?? "Progression follows survival, building, bosses, influence, alliances, and throne pressure."}`,
        `Current gate: ${state.activeBossGate.boss} is ${state.activeBossGate.status}.`,
        `Roleplay: ${roleplay?.summary ?? "Keep roleplay useful, respectful, and clear when rules matter."}`
      ],
      commandHints: [
        "/raven ask question:<question>",
        "/raven house name:<house>",
        "/raven roles role:<role>",
        "/raven progression topic:<topic>"
      ]
    };
  }

  async getRulesSummary(topic?: string): Promise<RulesSummary> {
    const normalizedTopic = normalize(topic ?? "overview");
    const canon = await this.repository.readDomain("realm-canon");
    const canonRecords = canon.records.map(recordFromCanon);
    const ruleRecords = rulesRecordsForTopic(canonRecords, normalizedTopic);

    return {
      topic: normalizedTopic,
      records: ruleRecords,
      suggestedTopics: ["overview", "protected areas", "roleplay", "rebellion", "pvp", "raiding", "launch"]
    };
  }


  private recordsFromDomain(domain: AnyKnowledgeDomain): KnowledgeRecord[] {
    switch (domain.domain) {
      case "realm-canon":
        return domain.records.map(recordFromCanon);
      case "chronicle":
        return domain.events.map(recordFromChronicleEvent);
      case "realm-state":
        return [
          {
            domain: "realm-state",
            kind: "realm-role",
            id: "current-king",
            title: "Current King",
            summary: domain.currentKing.name,
            tags: ["king", "ruler", "realm-state"],
            status: "current"
          },
          {
            domain: "realm-state",
            kind: "world-status",
            id: "active-boss-gate",
            title: "Active Boss Gate",
            summary: `${domain.activeBossGate.boss} is ${domain.activeBossGate.status}.`,
            tags: ["progression", "bosses", "current-gate", "realm-state"],
            status: domain.activeBossGate.status
          },
          ...domain.knownRoles.map(recordFromRoleAssignment),
          ...domain.activeHouses.map(recordFromActiveHouse),
          ...domain.pendingDecisions.map(recordFromPendingDecision)
        ];
      case "raven-mind":
        return [
          ...domain.modes.map(recordFromRavenMode),
          ...domain.keywordTriggers.map(recordFromKeywordTrigger)
        ];
      case "world-intelligence":
        return [
          {
            domain: "world-intelligence",
            kind: "world-status",
            id: "server-status",
            title: "Server Status",
            summary: domain.serverStatus.state,
            tags: ["world-intelligence", "server-status", "gameops"],
            status: domain.gameOpsBridge.enabled ? "gameops-enabled" : "gameops-disabled"
          }
        ];
    }
  }

  private recordSearchText(record: KnowledgeRecord): string {
    return normalize(
      `${record.id} ${record.title} ${record.summary} ${(record.aliases ?? []).join(" ")} ${record.tags.join(" ")} ${record.status}`
    );
  }
}

function recordFromCanon(record: RealmCanonRecord): KnowledgeRecord {
  const guideCommands = record.relatedCommands?.length ? ` Ask next: ${record.relatedCommands.join(" | ")}.` : "";

  return {
    domain: "realm-canon",
    kind: "canon-record",
    id: record.id,
    title: record.title,
    summary: `${record.answer ?? record.summary}${guideCommands}`,
    ...(record.aliases ? { aliases: record.aliases } : {}),
    ...(record.relatedCommands ? { relatedCommands: record.relatedCommands } : {}),
    ...(record.domainReferences ? { domainReferences: record.domainReferences } : {}),
    tags: record.tags,
    status: record.status
  };
}

function recordFromChronicleEvent(event: ChronicleEvent): KnowledgeRecord {
  return {
    domain: "chronicle",
    kind: "chronicle-event",
    id: event.id,
    title: event.title,
    summary: event.summary,
    tags: event.tags,
    status: event.status
  };
}

function recordFromRoleAssignment(role: RealmRoleAssignment): KnowledgeRecord {
  return {
    domain: "realm-state",
    kind: "realm-role",
    id: `role-${normalizeId(role.role)}-${normalizeId(role.holder)}`,
    title: role.role,
    summary: `${role.holder} holds or is tied to ${role.role}.`,
    tags: ["roles", "realm-state", role.status, ...(role.houseId ? [role.houseId] : [])],
    status: role.status
  };
}

function recordFromActiveHouse(house: ActiveHouse): KnowledgeRecord {
  return {
    domain: "realm-state",
    kind: "active-house",
    id: house.id,
    title: house.name,
    summary: `${house.name} is ${house.status}. Members: ${house.members.join(", ") || "none recorded"}.`,
    tags: ["houses", "realm-state", house.status],
    status: house.status
  };
}

function recordFromPendingDecision(decision: PendingDecision): KnowledgeRecord {
  return {
    domain: "realm-state",
    kind: "pending-decision",
    id: decision.id,
    title: decision.title,
    summary: decision.summary,
    tags: decision.tags,
    status: "pending"
  };
}

function recordFromRavenMode(mode: RavenModeDefinition): KnowledgeRecord {
  return {
    domain: "raven-mind",
    kind: "raven-mode",
    id: `mode-${mode.name}`,
    title: mode.name,
    summary: mode.purpose,
    tags: ["raven-mind", "mode", mode.name],
    status: "active"
  };
}

function recordFromKeywordTrigger(trigger: RavenKeywordTrigger): KnowledgeRecord {
  return {
    domain: "raven-mind",
    kind: "keyword-trigger",
    id: `trigger-${normalizeId(trigger.phrase)}`,
    title: trigger.phrase,
    summary: trigger.responseHint,
    tags: ["raven-mind", "keyword-trigger", trigger.mode],
    status: trigger.enabled ? "enabled" : "disabled"
  };
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeId(value: string): string {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function scoreGuideFaqRecord(record: KnowledgeRecord, normalizedQuery: string): number {
  const queryWords = wordsFrom(normalizedQuery);
  const title = normalize(record.title);
  const aliases = record.aliases ?? [];
  const tags = record.tags.map(normalize);
  const searchText = normalize(`${record.id} ${record.title} ${record.summary} ${aliases.join(" ")} ${tags.join(" ")}`);
  let score = 0;

  if (title === normalizedQuery || aliases.some((alias) => normalize(alias) === normalizedQuery)) {
    score += 100;
  }

  if (title.includes(normalizedQuery) || aliases.some((alias) => normalize(alias).includes(normalizedQuery))) {
    score += 40;
  }

  for (const tag of tags) {
    if (normalizedQuery.includes(tag) || tag.includes(normalizedQuery)) {
      score += 12;
    }
  }

  for (const word of queryWords) {
    if (searchText.includes(word)) {
      score += 4;
    }
  }

  return score;
}

function resolveGuideReferences(record: KnowledgeRecord, stateRecords: KnowledgeRecord[]): KnowledgeRecord[] {
  return (record.domainReferences ?? [])
    .map((reference) => {
      const [domain, id] = reference.split(":");

      if (domain !== "realm-state" || !id) {
        return null;
      }

      return stateRecords.find((candidate) => candidate.id === id) ?? null;
    })
    .filter((candidate): candidate is KnowledgeRecord => candidate !== null);
}

function uniqueRecordsById(records: KnowledgeRecord[]): KnowledgeRecord[] {
  const seen = new Set<string>();
  const uniqueRecords: KnowledgeRecord[] = [];

  for (const record of records) {
    const key = `${record.domain}:${record.id}`;

    if (!seen.has(key)) {
      seen.add(key);
      uniqueRecords.push(record);
    }
  }

  return uniqueRecords;
}

function wordsFrom(value: string): string[] {
  return value
    .split(/[^a-z0-9]+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 3);
}

function progressionRecordsForTopic(records: KnowledgeRecord[], normalizedTopic: string): KnowledgeRecord[] {
  const topic = normalizedTopic.trim();
  const baseRecords = records.filter(isProgressionPublicRecord);

  if (!topic || topic === "overview" || topic === "progression") {
    return baseRecords.filter((record) =>
      [
        "canon-boss-progression-concept",
        "canon-rebellion-concept",
        "canon-throne-challenge-concept",
        "canon-new-player-onboarding",
        "active-boss-gate"
      ].includes(record.id)
    );
  }

  if (topic.includes("boss")) {
    return baseRecords.filter((record) => record.tags.includes("bosses") || record.id === "active-boss-gate");
  }

  if (topic.includes("current") || topic.includes("gate") || topic.includes("eikthyr")) {
    return baseRecords.filter((record) => record.id === "active-boss-gate" || record.tags.includes("bosses"));
  }

  if (topic.includes("rebellion")) {
    return baseRecords.filter((record) => record.tags.includes("rebellion"));
  }

  if (topic.includes("throne") || topic.includes("challenge")) {
    return baseRecords.filter((record) => record.tags.includes("throne") || record.tags.includes("challenge"));
  }

  if (topic.includes("new") || topic.includes("player") || topic.includes("onboarding")) {
    return baseRecords.filter((record) => record.tags.includes("onboarding") || record.tags.includes("new-players"));
  }

  return baseRecords.filter((record) =>
    [record.id, record.title, record.summary, ...record.tags].some((part) => normalize(part).includes(topic))
  );
}

function isProgressionPublicRecord(record: KnowledgeRecord): boolean {
  return (
    record.id === "active-boss-gate" ||
    record.tags.includes("progression") ||
    record.tags.includes("bosses") ||
    record.tags.includes("rebellion") ||
    record.tags.includes("throne") ||
    record.tags.includes("challenge") ||
    record.tags.includes("onboarding") ||
    record.tags.includes("new-players")
  );
}

function rulesRecordsForTopic(records: KnowledgeRecord[], normalizedTopic: string): KnowledgeRecord[] {
  const topic = normalizedTopic.trim();
  const baseRecords = records.filter(isRulesPublicRecord);

  if (!topic || topic === "overview" || topic === "rules") {
    return baseRecords.filter((record) =>
      [
        "canon-protected-neutral-areas",
        "canon-roleplay-expectations",
        "canon-rebellion-concept",
        "canon-pvp-raiding-placeholder",
        "canon-launch-status-rules"
      ].includes(record.id)
    );
  }

  if (topic.includes("protected") || topic.includes("neutral") || topic.includes("safe")) {
    return baseRecords.filter(
      (record) => record.tags.includes("protected-areas") || record.tags.includes("neutral-areas")
    );
  }

  if (topic.includes("roleplay") || topic.includes("rp") || topic.includes("expectation")) {
    return baseRecords.filter((record) => record.tags.includes("roleplay") || record.tags.includes("expectations"));
  }

  if (topic.includes("rebellion") || topic.includes("rebel")) {
    return baseRecords.filter((record) => record.tags.includes("rebellion"));
  }

  if (topic.includes("pvp") || topic.includes("combat")) {
    return baseRecords.filter((record) => record.tags.includes("pvp"));
  }

  if (topic.includes("raid")) {
    return baseRecords.filter((record) => record.tags.includes("raiding"));
  }

  if (topic.includes("launch") || topic.includes("draft") || topic.includes("final")) {
    return baseRecords.filter((record) => record.tags.includes("launch") || record.status !== "active");
  }

  return baseRecords.filter((record) =>
    [record.id, record.title, record.summary, ...record.tags, record.status].some((part) =>
      normalize(part).includes(topic)
    )
  );
}

function isRulesPublicRecord(record: KnowledgeRecord): boolean {
  return (
    record.tags.includes("rules") ||
    record.tags.includes("protected-areas") ||
    record.tags.includes("neutral-areas") ||
    record.tags.includes("roleplay") ||
    record.tags.includes("expectations") ||
    record.tags.includes("rebellion") ||
    record.tags.includes("pvp") ||
    record.tags.includes("raiding") ||
    record.tags.includes("launch")
  );
}

function roleRecordsForTopic(records: KnowledgeRecord[], normalizedRole: string): KnowledgeRecord[] {
  const role = normalizedRole.trim();

  if (!role || role === "overview" || role === "roles") {
    return records.filter((record) =>
      [
        "role-king",
        "role-hand-of-the-king",
        "role-kingsguard",
        "role-house-leader",
        "role-house-member",
        "current-king",
        "role-server-owner-launch-king-chris",
        "role-hand-of-the-king-shiryo",
        "role-commander-of-the-kingsguard-kriatiri"
      ].includes(record.id)
    );
  }

  if (role.includes("king") && !role.includes("guard")) {
    return records.filter((record) => record.tags.includes("king") || record.id.includes("launch-king"));
  }

  if (role.includes("hand")) {
    return records.filter((record) => record.tags.includes("hand") || record.title.toLowerCase().includes("hand"));
  }

  if (role.includes("guard")) {
    return records.filter((record) => record.tags.includes("kingsguard") || record.title.toLowerCase().includes("guard"));
  }

  if (role.includes("leader")) {
    return records.filter((record) => record.id === "role-house-leader" || record.tags.includes("leadership"));
  }

  if (role.includes("member")) {
    return records.filter((record) => record.id === "role-house-member" || record.tags.includes("players"));
  }

  return records.filter((record) =>
    [record.id, record.title, record.summary, ...record.tags].some((part) => normalize(part).includes(role))
  );
}

function isRolePublicRecord(record: KnowledgeRecord): boolean {
  return record.tags.includes("roles") || record.kind === "realm-role" || record.id === "current-king";
}
