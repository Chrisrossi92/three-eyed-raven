import type { RavenCommandPlanRequest } from "../services/raven/ravenCommandPlanner.js";
import type { RavenResponseMode } from "../services/raven/responseTypes.js";

export type RavenAskAdapterInput = {
  question: string;
  mode?: string | null;
};

export type RavenSummaryAdapterInput = {
  mode?: string | null;
};

export type RavenAdminSummaryAdapterInput = {
  mode?: string | null;
};

export type RavenHouseAdapterInput = {
  name: string;
  mode?: string | null;
};

export type RavenProgressionAdapterInput = {
  topic?: string | null;
  mode?: string | null;
};

export type RavenRolesAdapterInput = {
  role?: string | null;
  mode?: string | null;
};

export type RavenOnboardingAdapterInput = {
  mode?: string | null;
};

export type RavenRulesAdapterInput = {
  topic?: string | null;
  mode?: string | null;
};

const ravenModes: RavenResponseMode[] = ["plain", "lore", "snark"];

export function toRavenAskPlanRequest(input: RavenAskAdapterInput): RavenCommandPlanRequest {
  const mode = normalizeRavenMode(input.mode);

  return {
    intent: "ask",
    query: input.question,
    mode,
    audience: "public"
  };
}

export function toRavenSummaryPlanRequest(input: RavenSummaryAdapterInput): RavenCommandPlanRequest {
  const mode = normalizeRavenMode(input.mode);

  return {
    intent: "public_summary",
    mode,
    audience: "public"
  };
}

export function toRavenAdminSummaryPlanRequest(input: RavenAdminSummaryAdapterInput): RavenCommandPlanRequest {
  const mode = normalizeRavenMode(input.mode);

  return {
    intent: "admin_summary",
    mode,
    audience: "private_admin"
  };
}

export function toRavenHousePlanRequest(input: RavenHouseAdapterInput): RavenCommandPlanRequest {
  const mode = normalizeRavenMode(input.mode);

  return {
    intent: "house",
    query: input.name,
    mode,
    audience: "public"
  };
}

export function toRavenProgressionPlanRequest(input: RavenProgressionAdapterInput): RavenCommandPlanRequest {
  const mode = normalizeRavenMode(input.mode);

  return {
    intent: "progression_summary",
    ...(input.topic ? { query: input.topic } : {}),
    mode,
    audience: "public"
  };
}

export function toRavenRolesPlanRequest(input: RavenRolesAdapterInput): RavenCommandPlanRequest {
  const mode = normalizeRavenMode(input.mode);

  return {
    intent: "roles_summary",
    ...(input.role ? { query: input.role } : {}),
    mode,
    audience: "public"
  };
}

export function toRavenOnboardingPlanRequest(input: RavenOnboardingAdapterInput): RavenCommandPlanRequest {
  const mode = normalizeRavenMode(input.mode);

  return {
    intent: "onboarding",
    mode,
    audience: "public"
  };
}

export function toRavenRulesPlanRequest(input: RavenRulesAdapterInput): RavenCommandPlanRequest {
  const mode = normalizeRavenMode(input.mode);

  return {
    intent: "rules_summary",
    ...(input.topic ? { query: input.topic } : {}),
    mode,
    audience: "public"
  };
}

export function normalizeRavenMode(mode?: string | null): RavenResponseMode {
  if (mode && ravenModes.includes(mode as RavenResponseMode)) {
    return mode as RavenResponseMode;
  }

  return "plain";
}

export function truncateDiscordContent(content: string, maxLength = 1900): string {
  if (content.length <= maxLength) {
    return content;
  }

  return `${content.slice(0, maxLength - 3).trimEnd()}...`;
}
