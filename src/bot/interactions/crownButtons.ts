import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, type ButtonInteraction } from "discord.js";
import { canUseCrown, crownCustomIds, crownModalFieldIds } from "../commands/crownCommand.js";

export async function handleCrownButton(interaction: ButtonInteraction): Promise<boolean> {
  if (!isCrownButton(interaction.customId)) {
    return false;
  }

  if (!canUseCrown(interaction)) {
    await interaction.reply({
      content: "Only the Crown's administrators may use this control.",
      ephemeral: true
    });
    return true;
  }

  if (interaction.customId === crownCustomIds.recognizeHouse) {
    await interaction.showModal(createRecognizeHouseModal());
    return true;
  }

  if (interaction.customId === crownCustomIds.assignMember) {
    await interaction.reply({
      content: "Use /crown-assign to assign a Discord user with the proper user picker.",
      ephemeral: true
    });
    return true;
  }

  if (interaction.customId === crownCustomIds.changeAge) {
    await interaction.showModal(createChangeAgeModal());
    return true;
  }

  await interaction.reply({
    content: "This Crown function will arrive in a future Raven update.",
    ephemeral: true
  });
  return true;
}

function isCrownButton(customId: string): boolean {
  return Object.values(crownCustomIds).includes(customId as (typeof crownCustomIds)[keyof typeof crownCustomIds]);
}

function createRecognizeHouseModal(): ModalBuilder {
  return new ModalBuilder()
    .setCustomId(crownCustomIds.recognizeHouseModal)
    .setTitle("Recognize House")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(crownModalFieldIds.houseName)
          .setLabel("House Name")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(crownModalFieldIds.houseLeader)
          .setLabel("Leader")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(crownModalFieldIds.houseSettlement)
          .setLabel("Settlement")
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      )
    );
}

function createChangeAgeModal(): ModalBuilder {
  return new ModalBuilder()
    .setCustomId(crownCustomIds.changeAgeModal)
    .setTitle("Change Realm Age")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(crownModalFieldIds.newAge)
          .setLabel("New Age")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(crownModalFieldIds.ageReason)
          .setLabel("Reason")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(crownModalFieldIds.recordChronicle)
          .setLabel("Record Chronicle? yes/no")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setValue("yes")
      )
    );
}
