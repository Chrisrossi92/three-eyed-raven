import {
  type AnyKnowledgeDomain,
  type KnowledgeDomainName,
  type RavenKeywordTrigger,
  type RavenModeDefinition,
  knowledgeDomainMetadata
} from "./knowledgeDomains.js";
import { KnowledgeRepository } from "./knowledgeRepository.js";

export type KnowledgeReferenceIssue = {
  sourceDomain: KnowledgeDomainName;
  sourceId: string;
  reference: unknown;
  message: string;
};

export type KnowledgeReferenceValidationResult = {
  issues: KnowledgeReferenceIssue[];
  checkedReferenceCount: number;
};

type ReferenceSource = {
  sourceDomain: KnowledgeDomainName;
  sourceId: string;
  references: unknown[];
};

export class KnowledgeIntegrityValidator {
  constructor(private readonly repository: KnowledgeRepository) {}

  async validateDomainReferences(): Promise<KnowledgeReferenceValidationResult> {
    const domains = await this.repository.readAllDomains();
    const addressableIds = new Map<KnowledgeDomainName, Set<string>>();

    for (const domain of domains) {
      addressableIds.set(domain.domain, new Set(addressableRecordIds(domain)));
    }

    const sources = domains.flatMap(referenceSourcesFromDomain);
    const issues: KnowledgeReferenceIssue[] = [];
    let checkedReferenceCount = 0;

    for (const source of sources) {
      const referencesInSource = new Set<string>();

      for (const reference of source.references) {
        checkedReferenceCount += 1;

        if (typeof reference !== "string") {
          issues.push({
            ...source,
            reference,
            message: "Reference must be a string."
          });
          continue;
        }

        if (referencesInSource.has(reference)) {
          issues.push({
            ...source,
            reference,
            message: "Duplicate reference in the same record."
          });
          continue;
        }

        referencesInSource.add(reference);

        const parts = reference.split(":");

        if (parts.length !== 2 || !parts[0] || !parts[1]) {
          issues.push({
            ...source,
            reference,
            message: "Reference must use the format domain:id."
          });
          continue;
        }

        const [domainName, recordId] = parts;

        if (!isKnowledgeDomainName(domainName)) {
          issues.push({
            ...source,
            reference,
            message: `Unknown domain "${domainName}".`
          });
          continue;
        }

        const domainRecordIds = addressableIds.get(domainName);

        if (!domainRecordIds?.has(recordId)) {
          issues.push({
            ...source,
            reference,
            message: `Record "${recordId}" does not exist in ${domainName}.`
          });
        }
      }
    }

    return {
      issues,
      checkedReferenceCount
    };
  }
}

function referenceSourcesFromDomain(domain: AnyKnowledgeDomain): ReferenceSource[] {
  switch (domain.domain) {
    case "realm-canon":
      return domain.records
        .filter((record) => record.domainReferences && record.domainReferences.length > 0)
        .map((record) => ({
          sourceDomain: "realm-canon",
          sourceId: record.id,
          references: record.domainReferences ?? []
        }));
    case "chronicle":
    case "realm-state":
    case "raven-mind":
    case "world-intelligence":
      return [];
  }
}

function addressableRecordIds(domain: AnyKnowledgeDomain): string[] {
  switch (domain.domain) {
    case "realm-canon":
      return domain.records.map((record) => record.id);
    case "chronicle":
      return domain.events.map((event) => event.id);
    case "realm-state":
      return [
        "current-king",
        "active-boss-gate",
        ...domain.knownRoles.map((role) => `role-${normalizeId(role.role)}-${normalizeId(role.holder)}`),
        ...domain.activeHouses.map((house) => house.id),
        ...domain.pendingDecisions.map((decision) => decision.id)
      ];
    case "raven-mind":
      return [
        ...domain.modes.map(recordIdFromRavenMode),
        ...domain.keywordTriggers.map(recordIdFromKeywordTrigger)
      ];
    case "world-intelligence":
      return ["server-status", ...domain.recentEvents.map((event) => event.id)];
  }
}

function isKnowledgeDomainName(value: string): value is KnowledgeDomainName {
  return value in knowledgeDomainMetadata;
}

function recordIdFromRavenMode(mode: RavenModeDefinition): string {
  return `mode-${mode.name}`;
}

function recordIdFromKeywordTrigger(trigger: RavenKeywordTrigger): string {
  return `trigger-${normalizeId(trigger.phrase)}`;
}

function normalizeId(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
