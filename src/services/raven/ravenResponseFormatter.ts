import type {
  AdminKnowledgeSummary,
  KnowledgeRecord,
  KnowledgeSummary,
  OnboardingSummary
} from "../knowledge/knowledgeService.js";
import type {
  RavenAudience,
  RavenResponse,
  RavenResponseMode,
  RavenResponseRequest,
  RavenResponseSource
} from "./responseTypes.js";

const fallbackMessage = "I do not yet hold that memory.";

export class RavenResponseFormatter {
  format(request: RavenResponseRequest): RavenResponse {
    const visibleRecords = this.visibleRecords(request.records ?? [], request.audience);

    if (visibleRecords.length > 0) {
      return this.formatRecords(request.mode, request.audience, visibleRecords);
    }

    if (request.summary) {
      return this.formatSummary(request.mode, request.audience, request.summary);
    }

    return this.formatFallback(request.mode, request.audience, request.fallbackTopic);
  }

  private formatRecords(
    mode: RavenResponseMode,
    audience: RavenAudience,
    records: KnowledgeRecord[]
  ): RavenResponse {
    const primary = records[0];

    if (!primary) {
      return this.formatFallback(mode, audience);
    }

    const content = records.map((record) => this.formatRecordLine(mode, audience, record)).join("\n");

    return {
      mode,
      audience,
      title: primary.title,
      content,
      sources: records.map(sourceFromRecord),
      isFallback: false
    };
  }

  private formatSummary(
    mode: RavenResponseMode,
    audience: RavenAudience,
    summary: KnowledgeSummary | AdminKnowledgeSummary | OnboardingSummary
  ): RavenResponse {
    const publicLines = summary.publicFacts.map((fact) => `- ${fact}`);
    const adminLines =
      audience === "private_admin" && isAdminSummary(summary)
        ? [
            `- Pending decisions: ${summary.pendingDecisionIds.length}`,
            `- Draft canon records: ${summary.draftCanonRecordIds.length}`
          ]
        : [];

    const onboardingLines = isOnboardingSummary(summary)
      ? [`- Ask next: ${summary.commandHints.join(" | ")}`]
      : [];
    const body = [...publicLines, ...onboardingLines, ...adminLines].join("\n");
    const content = this.applyModePrefix(mode, audience, body || fallbackMessage);

    return {
      mode,
      audience,
      title: isOnboardingSummary(summary)
        ? "New Player Onboarding"
        : audience === "private_admin"
          ? "Admin Knowledge Summary"
          : "Realm Knowledge Summary",
      content,
      sources: [],
      isFallback: false
    };
  }

  private formatFallback(
    mode: RavenResponseMode,
    audience: RavenAudience,
    topic?: string
  ): RavenResponse {
    const topicText = topic ? ` for "${topic}"` : "";
    const base = `${fallbackMessage}${topicText}.`;

    return {
      mode,
      audience,
      title: "Memory Not Found",
      content: this.applyModePrefix(mode, audience, base),
      sources: [],
      isFallback: true
    };
  }

  private formatRecordLine(
    mode: RavenResponseMode,
    audience: RavenAudience,
    record: KnowledgeRecord
  ): string {
    const statusNote = this.statusNote(record, audience);
    const base = `${record.title}: ${record.summary}${statusNote}`;
    return this.applyModePrefix(mode, audience, base);
  }

  private applyModePrefix(mode: RavenResponseMode, audience: RavenAudience, text: string): string {
    const audiencePrefix = audience === "private_admin" ? "[Admin] " : "";

    switch (mode) {
      case "plain":
        return `${audiencePrefix}${text}`;
      case "lore":
        return `${audiencePrefix}The realm remembers: ${text}`;
      case "snark":
        return `${audiencePrefix}${text} Even the swamp could have warned us.`;
    }
  }

  private visibleRecords(records: KnowledgeRecord[], audience: RavenAudience): KnowledgeRecord[] {
    if (audience === "private_admin") {
      return records;
    }

    return records.filter((record) => !isAdminOnlyRecord(record));
  }

  private statusNote(record: KnowledgeRecord, audience: RavenAudience): string {
    if (record.status === "active" || record.status === "current" || record.status === "enabled") {
      return "";
    }

    if (audience === "private_admin") {
      return ` Status: ${record.status}.`;
    }

    if (record.status === "draft" || record.status === "needs_decision") {
      return " This is not finalized yet.";
    }

    return "";
  }
}

function sourceFromRecord(record: KnowledgeRecord): RavenResponseSource {
  return {
    domain: record.domain,
    id: record.id,
    title: record.title,
    status: record.status
  };
}

function isAdminOnlyRecord(record: KnowledgeRecord): boolean {
  return (
    record.kind === "pending-decision" ||
    record.tags.includes("admin-drafts") ||
    record.tags.includes("sensitive-player-records")
  );
}

function isAdminSummary(
  summary: KnowledgeSummary | AdminKnowledgeSummary | OnboardingSummary
): summary is AdminKnowledgeSummary {
  return "pendingDecisionIds" in summary && "draftCanonRecordIds" in summary;
}

function isOnboardingSummary(
  summary: KnowledgeSummary | AdminKnowledgeSummary | OnboardingSummary
): summary is OnboardingSummary {
  return "commandHints" in summary;
}
