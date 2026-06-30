import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ButtonInteraction,
  type InteractionReplyOptions,
  type InteractionUpdateOptions
} from "discord.js";
import { loadHouses, loadPlayers } from "../../data/ravenStore.js";
import { formatChronicleEntryList } from "../../formatters/discordFormatters.js";
import { listChronicleEntries } from "../../services/chronicleService.js";
import { toDiscordReplyPayload } from "../discordMessageAdapter.js";

const chronicleCustomIds = {
  show5: "chronicle:show:5",
  show10: "chronicle:show:10"
} as const;

export function createChronicleButtons(): ActionRowBuilder<ButtonBuilder>[] {
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(chronicleCustomIds.show5)
        .setLabel("Show 5")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(chronicleCustomIds.show10)
        .setLabel("Show 10")
        .setStyle(ButtonStyle.Secondary)
    )
  ];
}

export async function createChronicleReply(count: number): Promise<InteractionReplyOptions> {
  const [entries, houses, players] = await Promise.all([
    listChronicleEntries(),
    loadHouses(),
    loadPlayers()
  ]);
  const recentEntries = [...entries]
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, Math.min(Math.max(count, 1), 10));

  return {
    ...toDiscordReplyPayload(formatChronicleEntryList(recentEntries, { houses, players }), {
      ephemeral: true
    }),
    components: createChronicleButtons()
  };
}

export async function handleChronicleButton(interaction: ButtonInteraction): Promise<boolean> {
  if (interaction.customId !== chronicleCustomIds.show5 && interaction.customId !== chronicleCustomIds.show10) {
    return false;
  }

  const count = interaction.customId === chronicleCustomIds.show10 ? 10 : 5;
  const reply = await createChronicleReply(count);
  const update: InteractionUpdateOptions = {};
  if (reply.embeds) {
    update.embeds = reply.embeds;
  }
  if (reply.components) {
    update.components = reply.components;
  }

  await interaction.update(update);
  return true;
}
