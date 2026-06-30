import "dotenv/config";
import { z } from "zod";

const configSchema = z.object({
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1).optional(),
  DISCORD_GUILD_ID: z.string().min(1).optional(),
  RAVEN_DATA_DIR: z.string().min(1).default("./src/data/knowledge"),
  RAVEN_LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  RAVEN_ADMIN_USER_IDS: z.string().optional(),
  RAVEN_ADMIN_ROLE_IDS: z.string().optional(),
  RAVEN_SMALL_COUNCIL_CHANNEL_ID: z.string().min(1).optional()
});

export type AppConfig = {
  discordToken: string;
  discordClientId?: string;
  discordGuildId?: string;
  dataDir: string;
  logLevel: "debug" | "info" | "warn" | "error";
  adminUserIds: string[];
  adminRoleIds: string[];
  smallCouncilChannelId?: string;
};

export function loadConfig(source: NodeJS.ProcessEnv): AppConfig {
  const parsed = configSchema.parse(source);

  return {
    discordToken: parsed.DISCORD_TOKEN,
    dataDir: parsed.RAVEN_DATA_DIR,
    logLevel: parsed.RAVEN_LOG_LEVEL,
    adminUserIds: parseIdList(parsed.RAVEN_ADMIN_USER_IDS),
    adminRoleIds: parseIdList(parsed.RAVEN_ADMIN_ROLE_IDS),
    ...(parsed.DISCORD_CLIENT_ID ? { discordClientId: parsed.DISCORD_CLIENT_ID } : {}),
    ...(parsed.DISCORD_GUILD_ID ? { discordGuildId: parsed.DISCORD_GUILD_ID } : {}),
    ...(parsed.RAVEN_SMALL_COUNCIL_CHANNEL_ID
      ? { smallCouncilChannelId: parsed.RAVEN_SMALL_COUNCIL_CHANNEL_ID }
      : {})
  };
}

function parseIdList(value?: string): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
