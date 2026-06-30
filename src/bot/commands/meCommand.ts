import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { loadHouses } from "../../data/ravenStore.js";
import { formatPlayerLegacy } from "../../formatters/discordFormatters.js";
import { getPlayerByDiscordId } from "../../services/houseService.js";
import { listAchievements } from "../../services/legacyService.js";
import { toDiscordReplyPayload } from "../discordMessageAdapter.js";

export const meCommand = {
  data: new SlashCommandBuilder()
    .setName("me")
    .setDescription("Show a player's Realm identity.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Player to view.")
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const targetUser = interaction.options.getUser("user") ?? interaction.user;
    const player = await getPlayerByDiscordId(targetUser.id);

    if (!player) {
      await interaction.reply({
        content:
          "The Raven does not know your Realm identity yet.\nA Crown member can assign you to a House once you swear allegiance.",
        ephemeral: true
      });
      return;
    }

    const [achievements, houses] = await Promise.all([listAchievements(), loadHouses()]);
    await interaction.reply(
      toDiscordReplyPayload(formatPlayerLegacy(player, achievements, { houses }), {
        ephemeral: true
      })
    );
  }
};
