import {
  ActionRowBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction
} from "discord.js";
import { listHouses } from "../../services/houseService.js";
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

  if (interaction.customId === crownCustomIds.editHouse) {
    await interaction.reply({
      content: "Select the House the Crown wishes to shape.",
      components: [await createEditHouseSelectRow()],
      ephemeral: true
    });
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

async function createEditHouseSelectRow(): Promise<ActionRowBuilder<StringSelectMenuBuilder>> {
  const houses = await listHouses();
  const options = houses.slice(0, 25).map((house) => ({
    label: house.name,
    value: house.id,
    description: house.words ?? house.status
  }));

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(crownCustomIds.editHouseSelect)
      .setPlaceholder("Choose a recognized House")
      .setMinValues(1)
      .setMaxValues(1)
      .setOptions(options.length > 0 ? options : [{ label: "No Houses recognized", value: "none" }])
      .setDisabled(options.length === 0)
  );
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
