import type {
  AdminKnowledgeSummary,
  KnowledgeRecord,
  KnowledgeSummary,
  OnboardingSummary
} from "../knowledge/knowledgeService.js";
import type { KnowledgeDomainName } from "../knowledge/knowledgeDomains.js";

export type RavenResponseMode = "plain" | "lore" | "snark";

export type RavenAudience = "public" | "private_admin";

export type RavenResponseSource = {
  domain: KnowledgeDomainName;
  id: string;
  title: string;
  status: string;
};

export type RavenResponse = {
  mode: RavenResponseMode;
  audience: RavenAudience;
  title: string;
  content: string;
  sources: RavenResponseSource[];
  isFallback: boolean;
};

export type RavenResponseRequest = {
  mode: RavenResponseMode;
  audience: RavenAudience;
  records?: KnowledgeRecord[];
  summary?: KnowledgeSummary | AdminKnowledgeSummary | OnboardingSummary;
  fallbackTopic?: string;
};
