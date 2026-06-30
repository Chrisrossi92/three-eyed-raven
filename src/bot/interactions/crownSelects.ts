import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type StringSelectMenuInteraction
} from "discord.js";
import { getHouseById } from "../../services/houseService.js";
import { canUseCrown, crownCustomIds, crownModalFieldIds } from "../commands/crownCommand.js";

export async function handleCrownSelect(interaction: StringSelectMenuInteraction): Promise<boolean> {
  if (interaction.customId !== crownCustomIds.editHouseSelect) {
    return false;
  }

  if (!canUseCrown(interaction)) {
    await interaction.reply({
      content: "Only the Crown's administrators may use this control.",
      ephemeral: true
    });
    return true;
  }

  const houseId = interaction.values[0];
  if (!houseId || houseId === "none") {
    await interaction.reply({
      content: "No recognized House was selected.",
      ephemeral: true
    });
    return true;
  }

  const house = await getHouseById(houseId);
  if (!house) {
    await interaction.reply({
      content: "The Raven could not find that House.",
      ephemeral: true
    });
    return true;
  }

  await interaction.showModal(createEditHouseModal(house));
  return true;
}

function createEditHouseModal(house: NonNullable<Awaited<ReturnType<typeof getHouseById>>>): ModalBuilder {
  return new ModalBuilder()
    .setCustomId(`${crownCustomIds.editHouseSelect}:${house.id}`)
    .setTitle(`Edit ${house.name}`)
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(crownModalFieldIds.houseWords)
          .setLabel("Words")
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
          .setValue(house.words ?? "")
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(crownModalFieldIds.houseSeat)
          .setLabel("Seat")
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
          .setValue(house.seat ?? house.settlementName ?? "")
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(crownModalFieldIds.houseDescription)
          .setLabel("Description")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false)
          .setValue(house.description ?? "")
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(crownModalFieldIds.houseCurrentGoal)
          .setLabel("Current Goal")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false)
          .setValue(house.currentGoal ?? "")
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(crownModalFieldIds.houseSigil)
          .setLabel("Sigil")
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
          .setValue(house.sigil ?? "")
      )
    );
}
