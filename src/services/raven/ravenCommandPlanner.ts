import type { KnowledgeRecord } from "../knowledge/knowledgeService.js";
import { KnowledgeService } from "../knowledge/knowledgeService.js";
import { RavenResponseFormatter } from "./ravenResponseFormatter.js";
import type { RavenAudience, RavenResponse, RavenResponseMode } from "./responseTypes.js";

export type RavenCommandIntent =
  | "ask"
  | "public_summary"
  | "admin_summary"
  | "house"
  | "progression_summary"
  | "roles_summary"
  | "onboarding"
  | "rules_summary";

export type RavenCommandPlanRequest = {
  intent: RavenCommandIntent;
  query?: string;
  mode?: RavenResponseMode;
  audience: RavenAudience;
};

export type RavenCommandPlanResult = {
  request: RavenCommandPlanRequest;
  response: RavenResponse;
  matchedRecords: KnowledgeRecord[];
};

export type RavenCommandPlannerOptions = {
  maxAskResults?: number;
};

export class RavenCommandPlanner {
  private readonly maxAskResults: number;

  constructor(
    private readonly knowledgeService: KnowledgeService,
    private readonly formatter: RavenResponseFormatter,
    options: RavenCommandPlannerOptions = {}
  ) {
    this.maxAskResults = options.maxAskResults ?? 3;
  }

  async plan(request: RavenCommandPlanRequest): Promise<RavenCommandPlanResult> {
    switch (request.intent) {
      case "ask":
        return this.planAsk(request);
      case "public_summary":
        return this.planPublicSummary(request);
      case "admin_summary":
        return this.planAdminSummary(request);
      case "house":
        return this.planHouse(request);
      case "progression_summary":
        return this.planProgressionSummary(request);
      case "roles_summary":
        return this.planRolesSummary(request);
      case "onboarding":
        return this.planOnboarding(request);
      case "rules_summary":
        return this.planRulesSummary(request);
    }
  }

  private async planAsk(request: RavenCommandPlanRequest): Promise<RavenCommandPlanResult> {
    const query = request.query?.trim();
    const mode = request.mode ?? "plain";

    if (!query) {
      return {
        request,
        response: this.formatter.format({
          mode,
          audience: request.audience,
          fallbackTopic: "empty question"
        }),
        matchedRecords: []
      };
    }

    const guideFaq = await this.knowledgeService.getGuideFaqSummary(query);
    const matchedRecords =
      guideFaq.records.length > 0
        ? guideFaq.records.slice(0, this.maxAskResults)
        : (await this.knowledgeService.searchRecords(query)).slice(0, this.maxAskResults);

    return {
      request,
      response: this.formatter.format({
        mode,
        audience: request.audience,
        records: matchedRecords,
        fallbackTopic: query
      }),
      matchedRecords
    };
  }

  private async planPublicSummary(request: RavenCommandPlanRequest): Promise<RavenCommandPlanResult> {
    const summary = await this.knowledgeService.getPublicKnowledgeSummary();

    return {
      request,
      response: this.formatter.format({
        mode: request.mode ?? "plain",
        audience: request.audience,
        summary
      }),
      matchedRecords: []
    };
  }

  private async planAdminSummary(request: RavenCommandPlanRequest): Promise<RavenCommandPlanResult> {
    const summary = await this.knowledgeService.getAdminKnowledgeSummary();

    return {
      request,
      response: this.formatter.format({
        mode: request.mode ?? "plain",
        audience: request.audience,
        summary
      }),
      matchedRecords: []
    };
  }

  private async planHouse(request: RavenCommandPlanRequest): Promise<RavenCommandPlanResult> {
    const query = request.query?.trim();
    const mode = request.mode ?? "plain";
    const knownHouseRecords = await this.getKnownHouseRecords();

    if (!query) {
      return {
        request,
        response: this.formatHouseFallback(mode, request.audience, "empty house name", knownHouseRecords),
        matchedRecords: []
      };
    }

    const matchedRecords = knownHouseRecords.filter((record) => matchesHouseQuery(record, query));

    if (matchedRecords.length === 0) {
      return {
        request,
        response: this.formatHouseFallback(mode, request.audience, query, knownHouseRecords),
        matchedRecords: []
      };
    }

    return {
      request,
      response: this.formatter.format({
        mode,
        audience: request.audience,
        records: matchedRecords
      }),
      matchedRecords
    };
  }

  private async planProgressionSummary(request: RavenCommandPlanRequest): Promise<RavenCommandPlanResult> {
    const mode = request.mode ?? "plain";
    const topic = request.query?.trim();
    const progressionSummary = await this.knowledgeService.getProgressionSummary(topic);

    if (progressionSummary.records.length === 0) {
      return {
        request,
        response: this.formatProgressionFallback(
          mode,
          request.audience,
          topic ?? "overview",
          progressionSummary.suggestedTopics
        ),
        matchedRecords: []
      };
    }

    return {
      request,
      response: this.formatter.format({
        mode,
        audience: request.audience,
        records: progressionSummary.records
      }),
      matchedRecords: progressionSummary.records
    };
  }

  private async planRolesSummary(request: RavenCommandPlanRequest): Promise<RavenCommandPlanResult> {
    const mode = request.mode ?? "plain";
    const role = request.query?.trim();
    const roleSummary = await this.knowledgeService.getRoleSummary(role);

    if (roleSummary.records.length === 0) {
      return {
        request,
        response: this.formatRolesFallback(mode, request.audience, role ?? "overview", roleSummary.suggestedRoles),
        matchedRecords: []
      };
    }

    return {
      request,
      response: this.formatter.format({
        mode,
        audience: request.audience,
        records: roleSummary.records
      }),
      matchedRecords: roleSummary.records
    };
  }

  private async planOnboarding(request: RavenCommandPlanRequest): Promise<RavenCommandPlanResult> {
    const summary = await this.knowledgeService.getOnboardingSummary();

    return {
      request,
      response: this.formatter.format({
        mode: request.mode ?? "plain",
        audience: request.audience,
        summary
      }),
      matchedRecords: []
    };
  }

  private async planRulesSummary(request: RavenCommandPlanRequest): Promise<RavenCommandPlanResult> {
    const mode = request.mode ?? "plain";
    const topic = request.query?.trim();
    const rulesSummary = await this.knowledgeService.getRulesSummary(topic);

    if (rulesSummary.records.length === 0) {
      return {
        request,
        response: this.formatRulesFallback(mode, request.audience, topic ?? "overview", rulesSummary.suggestedTopics),
        matchedRecords: []
      };
    }

    return {
      request,
      response: this.formatter.format({
        mode,
        audience: request.audience,
        records: rulesSummary.records
      }),
      matchedRecords: rulesSummary.records
    };
  }

  private async getKnownHouseRecords(): Promise<KnowledgeRecord[]> {
    const [canonHouses, stateHouses] = await Promise.all([
      this.knowledgeService.findRecordsByTag("realm-canon", "houses"),
      this.knowledgeService.findRecordsByTag("realm-state", "houses")
    ]);

    return [...canonHouses, ...stateHouses].filter((record) =>
      record.kind === "canon-record" || record.kind === "active-house"
    );
  }

  private formatHouseFallback(
    mode: RavenResponseMode,
    audience: RavenAudience,
    query: string,
    knownHouseRecords: KnowledgeRecord[]
  ): RavenResponse {
    const response = this.formatter.format({
      mode,
      audience,
      fallbackTopic: `house ${query}`
    });
    const knownHouses = uniqueHouseNames(knownHouseRecords);

    if (knownHouses.length === 0) {
      return response;
    }

    return {
      ...response,
      content: `${response.content} Known houses: ${knownHouses.join(", ")}.`
    };
  }

  private formatProgressionFallback(
    mode: RavenResponseMode,
    audience: RavenAudience,
    topic: string,
    suggestedTopics: string[]
  ): RavenResponse {
    const response = this.formatter.format({
      mode,
      audience,
      fallbackTopic: `progression topic ${topic}`
    });

    return {
      ...response,
      content: `${response.content} Suggested topics: ${suggestedTopics.join(", ")}.`
    };
  }

  private formatRolesFallback(
    mode: RavenResponseMode,
    audience: RavenAudience,
    role: string,
    suggestedRoles: string[]
  ): RavenResponse {
    const response = this.formatter.format({
      mode,
      audience,
      fallbackTopic: `role ${role}`
    });

    return {
      ...response,
      content: `${response.content} Suggested roles: ${suggestedRoles.join(", ")}.`
    };
  }

  private formatRulesFallback(
    mode: RavenResponseMode,
    audience: RavenAudience,
    topic: string,
    suggestedTopics: string[]
  ): RavenResponse {
    const response = this.formatter.format({
      mode,
      audience,
      fallbackTopic: `rules topic ${topic}`
    });

    return {
      ...response,
      content: `${response.content} Suggested topics: ${suggestedTopics.join(", ")}.`
    };
  }
}

function matchesHouseQuery(record: KnowledgeRecord, query: string): boolean {
  const normalizedQuery = normalize(query).replace(/^house\s+/, "");
  const searchableParts = [
    record.id,
    record.title,
    record.summary,
    ...record.tags,
    record.title.replace(/^House\s+/i, "")
  ];

  return searchableParts.some((part) => normalize(part).includes(normalizedQuery));
}

function uniqueHouseNames(records: KnowledgeRecord[]): string[] {
  const names = records.map((record) => record.title).filter((title) => title.startsWith("House "));
  return [...new Set(names)].sort((left, right) => left.localeCompare(right));
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}
