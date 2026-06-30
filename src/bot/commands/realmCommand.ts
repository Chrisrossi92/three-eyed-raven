import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { formatRealmStatus } from "../../formatters/discordFormatters.js";
import { getRealmStatus } from "../../services/realmService.js";
import { toDiscordReplyPayload } from "../discordMessageAdapter.js";

export const realmCommand = {
  data: new SlashCommandBuilder()
    .setName("realm")
    .setDescription("Show the current Thrones of Valhalla Realm status."),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const realmStatus = await getRealmStatus();
    const message = formatRealmStatus(realmStatus);
    await interaction.reply(toDiscordReplyPayload(message, { ephemeral: true }));
  }
};
