import "dotenv/config";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { chronicleCommand } from "./commands/chronicleCommand.js";
import { crownCommand } from "./commands/crownCommand.js";
import { houseCommand } from "./commands/houseCommand.js";
import { realmCommand } from "./commands/realmCommand.js";
import { handleChronicleButton } from "./interactions/chronicleButtons.js";
import { handleCrownButton } from "./interactions/crownButtons.js";
import { handleCrownModal } from "./interactions/crownModals.js";

const token = getRequiredEnv("DISCORD_TOKEN");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Three-Eyed Raven bot shell is ready as ${readyClient.user.tag}.`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isAutocomplete()) {
      if (interaction.commandName === houseCommand.data.name) {
        await houseCommand.autocomplete(interaction);
        return;
      }

      await interaction.respond([]);
      return;
    }

    if (interaction.isButton() && (await handleChronicleButton(interaction))) {
      return;
    }

    if (interaction.isButton() && (await handleCrownButton(interaction))) {
      return;
    }

    if (interaction.isModalSubmit() && (await handleCrownModal(interaction))) {
      return;
    }

    if (!interaction.isChatInputCommand()) {
      return;
    }

    if (interaction.commandName === crownCommand.data.name) {
      await crownCommand.execute(interaction);
      return;
    }

    if (interaction.commandName === realmCommand.data.name) {
      await realmCommand.execute(interaction);
      return;
    }

    if (interaction.commandName === chronicleCommand.data.name) {
      await chronicleCommand.execute(interaction);
      return;
    }

    if (interaction.commandName === houseCommand.data.name) {
      await houseCommand.execute(interaction);
      return;
    }

    await interaction.reply({
      content: "The Raven does not know that command yet.",
      ephemeral: true
    });
  } catch (error: unknown) {
    console.error("Failed to handle Discord interaction.", error);

    const response = {
      content: "The Raven could not answer that just now.",
      ephemeral: true
    };

    if (interaction.isRepliable()) {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(response);
      } else {
        await interaction.reply(response);
      }
    }
  }
});

console.log("Starting Three-Eyed Raven bot shell.");

client.login(token).catch((error: unknown) => {
  console.error("Failed to log in to Discord. Check DISCORD_TOKEN.", error);
  process.exitCode = 1;
});

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required. Add it to your local .env file.`);
  }

  return value;
}
