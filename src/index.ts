import { Client, GatewayIntentBits } from "discord.js";
import { loadConfig } from "./config/env.js";
import { registerCommands } from "./commands/index.js";
import { registerEvents } from "./events/index.js";
import { ChronicleApprovalService } from "./services/chronicle/chronicleApprovalService.js";
import { ChronicleDraftService } from "./services/chronicle/chronicleDraftService.js";
import { DiscordPermissionService } from "./services/discord/discordPermissionService.js";
import { DutyRepository } from "./services/duties/dutyRepository.js";
import { DutyService } from "./services/duties/dutyService.js";
import { KnowledgeRepository } from "./services/knowledge/knowledgeRepository.js";
import { KnowledgeService } from "./services/knowledge/knowledgeService.js";
import { RavenCommandPlanner } from "./services/raven/ravenCommandPlanner.js";
import { RavenResponseFormatter } from "./services/raven/ravenResponseFormatter.js";
import { createLogger } from "./utils/logger.js";

const config = loadConfig(process.env);
const logger = createLogger(config.logLevel);
const knowledgeRepository = new KnowledgeRepository({ knowledgeDir: config.dataDir });
const knowledgeService = new KnowledgeService(knowledgeRepository);
const ravenResponseFormatter = new RavenResponseFormatter();
const ravenPlanner = new RavenCommandPlanner(knowledgeService, ravenResponseFormatter);
const chronicleDraftService = new ChronicleDraftService();
const chronicleApprovalService = new ChronicleApprovalService();
const dutyRepository = new DutyRepository({ dutyFile: "./src/data/admin/duties.json" });
const dutyService = new DutyService(dutyRepository);
const discordPermissions = new DiscordPermissionService({
  adminUserIds: config.adminUserIds,
  adminRoleIds: config.adminRoleIds,
  ...(config.smallCouncilChannelId ? { smallCouncilChannelId: config.smallCouncilChannelId } : {})
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

registerCommands(client, logger, {
  ravenPlanner,
  discordPermissions,
  chronicleDraftService,
  chronicleApprovalService,
  dutyService
});
registerEvents(client, logger);

client.login(config.discordToken).catch((error: unknown) => {
  logger.error("Failed to log in to Discord.", { error });
  process.exitCode = 1;
});
