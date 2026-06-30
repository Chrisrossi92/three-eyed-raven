import type { Client } from "discord.js";
import { createRavenCommand, ravenCommandData } from "./raven.js";
import type { ChronicleApprovalService } from "../services/chronicle/chronicleApprovalService.js";
import type { ChronicleDraftService } from "../services/chronicle/chronicleDraftService.js";
import type { DiscordPermissionService } from "../services/discord/discordPermissionService.js";
import type { DutyService } from "../services/duties/dutyService.js";
import type { RavenCommandPlanner } from "../services/raven/ravenCommandPlanner.js";
import type { Logger } from "../utils/logger.js";
import type { RavenCommand } from "./types.js";

export type CommandDependencies = {
  ravenPlanner: RavenCommandPlanner;
  discordPermissions: DiscordPermissionService;
  chronicleDraftService: ChronicleDraftService;
  chronicleApprovalService: ChronicleApprovalService;
  dutyService: DutyService;
};

export function registerCommands(client: Client, logger: Logger, dependencies: CommandDependencies): void {
  const commands = createCommands(dependencies);

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command = commands.find((candidate) => candidate.data.name === interaction.commandName);

    if (!command) {
      logger.warn("Received unknown command interaction.", {
        commandName: interaction.commandName
      });
      return;
    }

    try {
      await command.execute({ interaction });
    } catch (error: unknown) {
      logger.error("Command execution failed.", {
        commandName: interaction.commandName,
        error
      });

      const response = {
        content: "I could not read that thread of fate. The King may need to inspect the logs.",
        ephemeral: true
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(response);
        return;
      }

      await interaction.reply(response);
    }
  });
}

export function createCommands(dependencies: CommandDependencies): RavenCommand[] {
  return [
    createRavenCommand(
      dependencies.ravenPlanner,
      dependencies.discordPermissions,
      dependencies.chronicleDraftService,
      dependencies.chronicleApprovalService,
      dependencies.dutyService
    )
  ];
}

export function getCommandDefinitions(): RavenCommand[] {
  return [{ data: ravenCommandData, execute: async () => undefined }];
}
