import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { formatChronicleEntryList } from "../../formatters/discordFormatters.js";
import { listChronicleEntries } from "../../services/chronicleService.js";
import { toDiscordReplyPayload } from "../discordMessageAdapter.js";

export const chronicleCommand = {
  data: new SlashCommandBuilder()
    .setName("chronicle")
    .setDescription("Show recent official Realm history.")
    .addIntegerOption((option) =>
      option
        .setName("count")
        .setDescription("Number of recent Chronicle entries to show.")
        .setMinValue(1)
        .setMaxValue(10)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const count = interaction.options.getInteger("count") ?? 5;
    const entries = await listChronicleEntries();
    const recentEntries = [...entries]
      .sort((left, right) => right.date.localeCompare(left.date))
      .slice(0, count);

    await interaction.reply(
      toDiscordReplyPayload(formatChronicleEntryList(recentEntries), {
        ephemeral: true
      })
    );
  }
};
