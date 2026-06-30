import type {
  AdminRavenInteractionContext,
  DiscordPermissionService
} from "../services/discord/discordPermissionService.js";
import type { RavenCommandPlanRequest } from "../services/raven/ravenCommandPlanner.js";
import { toRavenAdminSummaryPlanRequest } from "./ravenAskAdapter.js";

export type RavenAdminSummaryAdapterInput = AdminRavenInteractionContext & {
  mode?: string | null;
};

export type RavenAdminSummaryDecision =
  | {
      allowed: true;
      ephemeral: true;
      planRequest: RavenCommandPlanRequest;
    }
  | {
      allowed: false;
      ephemeral: true;
      reason: "unauthorized" | "wrong_channel";
      message: string;
    };

const unauthorizedMessage = "The Raven keeps that counsel for sworn eyes only.";
const wrongChannelMessage = "Bring this matter to the Small Council Chamber.";

export function planRavenAdminSummary(
  input: RavenAdminSummaryAdapterInput,
  permissions: DiscordPermissionService
): RavenAdminSummaryDecision {
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
    planRequest: toRavenAdminSummaryPlanRequest({
      ...(input.mode ? { mode: input.mode } : {})
    })
  };
}
