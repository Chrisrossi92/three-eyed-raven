import type {
  AdminRavenInteractionContext,
  DiscordPermissionService
} from "../services/discord/discordPermissionService.js";
import type { ChronicleDraftRequest } from "../services/chronicle/chronicleTypes.js";
import { normalizeRavenMode } from "./ravenAskAdapter.js";

export type RavenChronicleDraftAdapterInput = AdminRavenInteractionContext & {
  event: string;
  type?: string | null;
  house?: string | null;
  players?: string | null;
  mode?: string | null;
};

export type RavenChronicleDraftDecision =
  | {
      allowed: true;
      ephemeral: true;
      draftRequest: ChronicleDraftRequest;
    }
  | {
      allowed: false;
      ephemeral: true;
      reason: "unauthorized" | "wrong_channel";
      message: string;
    };

const unauthorizedMessage = "The Raven keeps that chronicle for sworn eyes only.";
const wrongChannelMessage = "Bring this draft to the Small Council Chamber.";

export function planRavenChronicleDraft(
  input: RavenChronicleDraftAdapterInput,
  permissions: DiscordPermissionService
): RavenChronicleDraftDecision {
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
    draftRequest: {
      event: input.event,
      ...(input.type ? { type: input.type } : {}),
      ...(input.house ? { house: input.house } : {}),
      ...(input.players ? { players: input.players } : {}),
      mode: normalizeRavenMode(input.mode)
    }
  };
}
