import {
  SlashCommandBuilder,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction
} from "discord.js";
import { formatHouseStatus } from "../../formatters/discordFormatters.js";
import {
  getHouseById,
  getHouseByName,
  getPlayerByDiscordId,
  listHouses
} from "../../services/houseService.js";
import { toDiscordReplyPayload } from "../discordMessageAdapter.js";
import { createHouseAutocompleteChoices } from "../houseSearch.js";

export const houseCommand = {
  data: new SlashCommandBuilder()
    .setName("house")
    .setDescription("Show recognized House information.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("House name to view.")
        .setRequired(false)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const focusedOption = interaction.options.getFocused(true);
    if (focusedOption.name !== "name") {
      await interaction.respond([]);
      return;
    }

    const focusedValue = String(focusedOption.value);
    const houses = await listHouses();
    await interaction.respond(createHouseAutocompleteChoices(houses, focusedValue));
  },

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const requestedName = interaction.options.getString("name")?.trim();

    if (requestedName) {
      const house = await getHouseByName(requestedName);
      if (!house) {
        await interaction.reply({
          content: await formatHouseNotFound(requestedName),
          ephemeral: true
        });
        return;
      }

      await interaction.reply(toDiscordReplyPayload(formatHouseStatus(house), { ephemeral: true }));
      return;
    }

    const player = await getPlayerByDiscordId(interaction.user.id);
    if (player?.houseId) {
      const house = await getHouseById(player.houseId);
      if (house) {
        await interaction.reply(toDiscordReplyPayload(formatHouseStatus(house), { ephemeral: true }));
        return;
      }
    }

    await interaction.reply({
      content: await formatHouseListPrompt(),
      ephemeral: true
    });
  }
};

async function formatHouseNotFound(requestedName: string): Promise<string> {
  const houses = await listHouses();
  return `The Raven does not know a recognized House named "${requestedName}".\n\n${formatRecognizedHouses(houses)}`;
}

async function formatHouseListPrompt(): Promise<string> {
  const houses = await listHouses();
  return `No House is recorded for you yet. Use \`/house name\` to view a recognized House.\n\n${formatRecognizedHouses(houses)}`;
}

function formatRecognizedHouses(houses: Awaited<ReturnType<typeof listHouses>>): string {
  if (houses.length === 0) {
    return "No Houses are recognized yet.";
  }

  return `Recognized Houses: ${houses.map((house) => house.name).join(", ")}`;
}
