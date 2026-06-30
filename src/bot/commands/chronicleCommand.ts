import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { createChronicleReply } from "../interactions/chronicleButtons.js";

export const chronicleCommand = {
  data: new SlashCommandBuilder()
    .setName("chronicle")
    .setDescription("Show recent official Realm history."),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply(await createChronicleReply(3));
  }
};
