import type {
  AdminRavenInteractionContext,
  DiscordPermissionService
} from "../services/discord/discordPermissionService.js";
import type { RavenResponseMode } from "../services/raven/responseTypes.js";
import { normalizeCategory, normalizePriority } from "../services/duties/dutyService.js";
import { normalizeRavenMode } from "./ravenAskAdapter.js";

export type RavenDutiesAdapterInput = AdminRavenInteractionContext & {
  category?: string | null;
  priority?: string | null;
  mode?: string | null;
};

export type RavenDutiesRequest = {
  category?: string;
  priority?: string;
  mode: RavenResponseMode;
};

export type RavenDutiesDecision =
  | {
      allowed: true;
      ephemeral: true;
      dutiesRequest: RavenDutiesRequest;
    }
  | {
      allowed: false;
      ephemeral: true;
      reason: "unauthorized" | "wrong_channel";
      message: string;
    };

const unauthorizedMessage = "The Raven keeps those duties for sworn eyes only.";
const wrongChannelMessage = "Bring this duty review to the Small Council Chamber.";

export function planRavenDuties(
  input: RavenDutiesAdapterInput,
  permissions: DiscordPermissionService
): RavenDutiesDecision {
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
    dutiesRequest: {
      ...(input.category ? { category: normalizeCategory(input.category) } : {}),
      ...(input.priority ? { priority: normalizePriority(input.priority) } : {}),
      mode: normalizeRavenMode(input.mode)
    }
  };
}
