import type { ChronicleApprovalPreviewRequest } from "../services/chronicle/chronicleApprovalService.js";
import type { ChronicleApprovalPreview } from "../services/chronicle/chronicleTypes.js";
import type {
  AdminRavenInteractionContext,
  DiscordPermissionService
} from "../services/discord/discordPermissionService.js";

export type RavenChroniclePreviewAdapterInput = AdminRavenInteractionContext & {
  event: string;
  type: string;
  title?: string | null;
  house?: string | null;
  players?: string | null;
  occurredAt?: string | null;
  tags?: string | null;
};

export type RavenChroniclePreviewDecision =
  | {
      allowed: true;
      ephemeral: true;
      previewRequest: ChronicleApprovalPreviewRequest;
    }
  | {
      allowed: false;
      ephemeral: true;
      reason: "unauthorized" | "wrong_channel";
      message: string;
    };

const unauthorizedMessage = "The Raven keeps that chronicle preview for sworn eyes only.";
const wrongChannelMessage = "Bring this preview to the Small Council Chamber.";

export function planRavenChroniclePreview(
  input: RavenChroniclePreviewAdapterInput,
  permissions: DiscordPermissionService
): RavenChroniclePreviewDecision {
  if (!permissions.canUseAdminRaven(input)) {
    return {
      allowed: false,
      ephemeral: true,
      reason: "unauthorized",
      message: unauthorizedMessage
    };
  }

  if (permissions.hasSmallCouncilChannel() && !permissions.isSmallCouncilChannel(input.channelId)) {
    return {
      allowed: false,
      ephemeral: true,
      reason: "wrong_channel",
      message: wrongChannelMessage
    };
  }

  return {
    allowed: true,
    ephemeral: true,
    previewRequest: {
      draft: {
        event: input.event,
        type: normalizePreviewType(input.type),
        ...(input.house ? { house: input.house } : {}),
        players: parseList(input.players)
      },
      recordedByUserId: input.userId,
      ...(input.title ? { title: input.title } : {}),
      ...(input.occurredAt ? { occurredAt: input.occurredAt } : {}),
      tags: parseList(input.tags)
    }
  };
}

export function formatChronicleApprovalPreview(preview: ChronicleApprovalPreview): string {
  const readiness = preview.ready ? "Ready: yes" : "Ready: no";
  const missing = preview.missingFields.length > 0 ? `Missing fields: ${preview.missingFields.join(", ")}` : null;
  const record = preview.permanentRecord;
  const recordLines = record
    ? [
        `Type: ${record.type}`,
        `Title: ${record.title}`,
        ...(record.house ? [`House: ${record.house}`] : []),
        ...(record.players.length > 0 ? [`Players: ${record.players.join(", ")}`] : []),
        ...(record.tags.length > 0 ? [`Tags: ${record.tags.join(", ")}`] : []),
        `Factual summary: ${record.factualSummary}`,
        `Lore summary: ${record.loreSummary}`
      ]
    : [];

  return [preview.marker, readiness, ...(missing ? [missing] : []), ...recordLines].join("\n");
}

function normalizePreviewType(type: string): ChronicleApprovalPreviewRequest["draft"]["type"] {
  const normalizedType = type.trim().toLowerCase().replace(/[\s-]+/g, "_");

  switch (normalizedType) {
    case "boss_kill":
    case "alliance":
    case "betrayal":
    case "battle":
    case "ruling":
    case "ceremony":
    case "major_build":
    case "server_event":
      return normalizedType;
    default:
      return "unknown";
  }
}

function parseList(value?: string | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
