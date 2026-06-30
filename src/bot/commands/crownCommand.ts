import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type InteractionReplyOptions
} from "discord.js";
import { getRealmStatus, type RealmStatus } from "../../services/realmService.js";

export const crownCustomIds = {
  recognizeHouse: "crown:recognize-house",
  changeAge: "crown:change-age",
  royalHunt: "crown:royal-hunt",
  chronicle: "crown:chronicle",
  awards: "crown:awards",
  recognizeHouseModal: "crown:modal:recognize-house",
  changeAgeModal: "crown:modal:change-age"
} as const;

export const crownModalFieldIds = {
  houseName: "houseName",
  houseLeader: "houseLeader",
  houseSettlement: "houseSettlement",
  newAge: "newAge",
  ageReason: "ageReason",
  recordChronicle: "recordChronicle"
} as const;

export const crownCommand = {
  data: new SlashCommandBuilder()
    .setName("crown")
    .setDescription("Open the Crown Council moderator panel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!canUseCrown(interaction)) {
      await interaction.reply({
        content: "Only the Crown's administrators may use this command.",
        ephemeral: true
      });
      return;
    }

    await interaction.reply(await createCrownPanelReply());
  }
};

export async function createCrownPanelReply(): Promise<InteractionReplyOptions> {
  const status = await getRealmStatus();

  return {
    embeds: [createCrownPanelEmbed(status)],
    components: createCrownPanelComponents(),
    ephemeral: true
  };
}

export function createCrownPanelEmbed(status: RealmStatus): NonNullable<InteractionReplyOptions["embeds"]>[number] {
  return {
    title: "Crown Council",
    fields: [
      {
        name: "Current Age",
        value: status.currentAge,
        inline: true
      },
      {
        name: "Current Ruler",
        value: status.ruler,
        inline: true
      },
      {
        name: "Recognized Houses",
        value: String(status.recognizedHouseCount),
        inline: true
      },
      {
        name: "Royal Tribute",
        value: status.currentTribute.status === "Not Started" ? "None Active" : status.currentTribute.status,
        inline: true
      },
      {
        name: "Royal Hunt",
        value: status.nextHunt.status === "Not Scheduled" ? "None Scheduled" : status.nextHunt.status,
        inline: true
      }
    ]
  };
}

export function createCrownPanelComponents(): ActionRowBuilder<ButtonBuilder>[] {
  const rowOne = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(crownCustomIds.recognizeHouse)
      .setLabel("Recognize House")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(crownCustomIds.changeAge)
      .setLabel("Change Age")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(crownCustomIds.royalHunt)
      .setLabel("Royal Hunt")
      .setStyle(ButtonStyle.Secondary)
  );

  const rowTwo = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(crownCustomIds.chronicle)
      .setLabel("Chronicle")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(crownCustomIds.awards)
      .setLabel("Awards")
      .setStyle(ButtonStyle.Secondary)
  );

  return [rowOne, rowTwo];
}

export function canUseCrown(interaction: {
  memberPermissions: { has(permission: bigint): boolean } | null;
  user: { id: string };
}): boolean {
  if (interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return true;
  }

  return getConfiguredOwnerIds().includes(interaction.user.id);
}

function getConfiguredOwnerIds(): string[] {
  const raw = process.env.RAVEN_ADMIN_USER_IDS;
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
}
