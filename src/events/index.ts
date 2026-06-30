import type { Client } from "discord.js";
import type { Logger } from "../utils/logger.js";
import { registerReadyEvent } from "./ready.js";

export function registerEvents(client: Client, logger: Logger): void {
  registerReadyEvent(client, logger);
}
