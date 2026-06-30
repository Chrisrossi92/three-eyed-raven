import type { Client } from "discord.js";
import type { Logger } from "../utils/logger.js";

export function registerReadyEvent(client: Client, logger: Logger): void {
  client.once("ready", (readyClient) => {
    logger.info("The Raven is watching.", {
      userTag: readyClient.user.tag,
      guildCount: readyClient.guilds.cache.size
    });
  });
}
