import { REST, Routes } from "discord.js";
import { getCommandDefinitions } from "./index.js";
import { loadConfig } from "../config/env.js";
import { createLogger } from "../utils/logger.js";

const config = loadConfig(process.env);
const logger = createLogger(config.logLevel);

if (!config.discordClientId) {
  throw new Error("DISCORD_CLIENT_ID is required to register Discord commands.");
}

const rest = new REST({ version: "10" }).setToken(config.discordToken);
const commandPayload = getCommandDefinitions().map((command) => command.data.toJSON());

const route = config.discordGuildId
  ? Routes.applicationGuildCommands(config.discordClientId, config.discordGuildId)
  : Routes.applicationCommands(config.discordClientId);

await rest.put(route, {
  body: commandPayload
});

logger.info("Registered Discord commands.", {
  commandCount: commandPayload.length,
  scope: config.discordGuildId ? "guild" : "global"
});
