import "dotenv/config";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { realmCommand } from "./commands/realmCommand.js";

const token = getRequiredEnv("DISCORD_TOKEN");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Three-Eyed Raven bot shell is ready as ${readyClient.user.tag}.`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  try {
    if (interaction.commandName === realmCommand.data.name) {
      await realmCommand.execute(interaction);
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

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(response);
    } else {
      await interaction.reply(response);
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
