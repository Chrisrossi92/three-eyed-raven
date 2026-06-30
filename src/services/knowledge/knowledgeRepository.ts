import { join } from "node:path";
import type { z } from "zod";
import { JsonRepository } from "../../data/json-repository.js";
import {
  type AnyKnowledgeDomain,
  type ChronicleDomain,
  type KnowledgeDomainName,
  type RavenMindDomain,
  type RealmCanonDomain,
  type RealmStateDomain,
  type WorldIntelligenceDomain,
  knowledgeDomainFileNames
} from "./knowledgeDomains.js";
import {
  chronicleDomainSchema,
  realmCanonDomainSchema,
  realmStateDomainSchema,
  ravenMindDomainSchema,
  worldIntelligenceDomainSchema
} from "./knowledgeSchemas.js";

const domainSchemas = {
  "realm-canon": realmCanonDomainSchema,
  chronicle: chronicleDomainSchema,
  "realm-state": realmStateDomainSchema,
  "raven-mind": ravenMindDomainSchema,
  "world-intelligence": worldIntelligenceDomainSchema
} as const;

export type KnowledgeRepositoryOptions = {
  knowledgeDir: string;
};

export class KnowledgeRepository {
  constructor(private readonly options: KnowledgeRepositoryOptions) {}

  async readDomain(domainName: "realm-canon"): Promise<RealmCanonDomain>;
  async readDomain(domainName: "chronicle"): Promise<ChronicleDomain>;
  async readDomain(domainName: "realm-state"): Promise<RealmStateDomain>;
  async readDomain(domainName: "raven-mind"): Promise<RavenMindDomain>;
  async readDomain(domainName: "world-intelligence"): Promise<WorldIntelligenceDomain>;
  async readDomain(domainName: KnowledgeDomainName): Promise<AnyKnowledgeDomain>;
  async readDomain(domainName: KnowledgeDomainName): Promise<AnyKnowledgeDomain> {
    const repository = this.createDomainRepository(domainName);
    return repository.read(this.emptyDomain(domainName));
  }

  async readAllDomains(): Promise<AnyKnowledgeDomain[]> {
    const domainNames = Object.keys(knowledgeDomainFileNames) as KnowledgeDomainName[];
    return Promise.all(domainNames.map((domainName) => this.readDomain(domainName)));
  }

  private createDomainRepository(domainName: KnowledgeDomainName): JsonRepository<AnyKnowledgeDomain> {
    const fileName = knowledgeDomainFileNames[domainName];
    const path = join(this.options.knowledgeDir, fileName);
    const schema = domainSchemas[domainName] as unknown as z.ZodType<AnyKnowledgeDomain>;

    return new JsonRepository<AnyKnowledgeDomain>(path, schema);
  }

  private emptyDomain(domainName: KnowledgeDomainName): AnyKnowledgeDomain {
    switch (domainName) {
      case "realm-canon":
        return {
          domain: "realm-canon",
          version: 1,
          description: "Permanent server truth for the realm.",
          records: []
        };
      case "chronicle":
        return {
          domain: "chronicle",
          version: 1,
          description: "Validated historical memory of the realm.",
          events: []
        };
      case "realm-state":
        return {
          domain: "realm-state",
          version: 1,
          description: "Current living status of the realm.",
          currentKing: {
            name: "Unclaimed",
            since: null,
            source: "staff"
          },
          handOfTheKing: null,
          kingsguard: [],
          knownRoles: [],
          activeHouses: [],
          currentAlliances: [],
          currentWars: [],
          activeBossGate: {
            boss: "Eikthyr",
            status: "not-started",
            updatedAt: null
          },
          season: {
            name: "Preseason",
            status: "setup",
            startedAt: null
          },
          pendingDecisions: []
        };
      case "raven-mind":
        return {
          domain: "raven-mind",
          version: 1,
          description: "Personality and response logic for the Raven.",
          modes: [],
          silenceRules: [],
          keywordTriggers: [],
          responseBoundaries: {
            defaultVisibility: "public",
            preferPrivateFor: [],
            neverInventFacts: true,
            fallbackMessage: "I do not yet hold that memory.",
            privateAdminGuidance: "Admin-only context may include drafts, pending decisions, and unresolved rulings."
          }
        };
      case "world-intelligence":
        return {
          domain: "world-intelligence",
          version: 1,
          description: "Future live telemetry and GameOps Bridge input.",
          serverStatus: {
            state: "unknown",
            uptimeSeconds: null,
            updatedAt: null
          },
          onlinePlayers: [],
          recentEvents: [],
          gameOpsBridge: {
            enabled: false,
            lastSuccessfulSyncAt: null,
            lastEventId: null
          }
        };
    }
  }
}
