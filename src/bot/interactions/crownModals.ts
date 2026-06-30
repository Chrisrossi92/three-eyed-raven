import type { ModalSubmitInteraction } from "discord.js";
import {
  canUseCrown,
  createCrownPanelReply,
  crownCustomIds,
  crownModalFieldIds
} from "../commands/crownCommand.js";
import { recordChronicleEntry } from "../../services/chronicleService.js";
import { recognizeHouse } from "../../services/houseService.js";
import { setCurrentAge } from "../../services/realmService.js";

export async function handleCrownModal(interaction: ModalSubmitInteraction): Promise<boolean> {
  if (!isCrownModal(interaction.customId)) {
    return false;
  }

  if (!canUseCrown(interaction)) {
    await interaction.reply({
      content: "Only the Crown's administrators may use this control.",
      ephemeral: true
    });
    return true;
  }

  if (interaction.customId === crownCustomIds.recognizeHouseModal) {
    await handleRecognizeHouseModal(interaction);
    return true;
  }

  if (interaction.customId === crownCustomIds.changeAgeModal) {
    await handleChangeAgeModal(interaction);
    return true;
  }

  return false;
}

async function handleRecognizeHouseModal(interaction: ModalSubmitInteraction): Promise<void> {
  const houseName = interaction.fields.getTextInputValue(crownModalFieldIds.houseName).trim();
  const leader = interaction.fields.getTextInputValue(crownModalFieldIds.houseLeader).trim();
  const settlement = interaction.fields.getTextInputValue(crownModalFieldIds.houseSettlement).trim();

  try {
    const house = await recognizeHouse({
      id: createHouseId(houseName),
      name: houseName,
      leaderRealmName: leader,
      leaderDisplayName: leader,
      settlementName: settlement || null
    });

    await recordChronicleEntry({
      type: "house_recognition",
      summary: `${house.name} has been recognized by the Crown.`,
      involvedHouses: [house.id],
      approvedBy: interaction.user.id,
      source: "admin"
    });

    await interaction.reply({
      ...(await createCrownPanelReply()),
      content: `${house.name} has been recognized by the Crown.`
    });
  } catch (error: unknown) {
    await interaction.reply({
      content: getFriendlyError(error),
      ephemeral: true
    });
  }
}

async function handleChangeAgeModal(interaction: ModalSubmitInteraction): Promise<void> {
  const newAge = interaction.fields.getTextInputValue(crownModalFieldIds.newAge).trim();
  const reason = interaction.fields.getTextInputValue(crownModalFieldIds.ageReason).trim();
  const recordChronicle = parseBoolean(
    interaction.fields.getTextInputValue(crownModalFieldIds.recordChronicle)
  );

  try {
    await setCurrentAge(newAge);

    if (recordChronicle) {
      await recordChronicleEntry({
        type: "age_change",
        summary: reason ? `The Realm has entered ${newAge}. Reason: ${reason}` : `The Realm has entered ${newAge}.`,
        approvedBy: interaction.user.id,
        source: "admin"
      });
    }

    await interaction.reply({
      ...(await createCrownPanelReply()),
      content: `The Realm age is now ${newAge}.`
    });
  } catch (error: unknown) {
    await interaction.reply({
      content: getFriendlyError(error),
      ephemeral: true
    });
  }
}

function isCrownModal(customId: string): boolean {
  return (
    customId === crownCustomIds.recognizeHouseModal ||
    customId === crownCustomIds.changeAgeModal
  );
}

function createHouseId(houseName: string): string {
  const slug = houseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug.startsWith("house-") ? slug : `house-${slug || "unknown"}`;
}

function parseBoolean(value: string): boolean {
  return !["false", "no", "n", "0"].includes(value.trim().toLowerCase());
}

function getFriendlyError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("already exists")) {
      return error.message;
    }
    if (error.message.includes("required")) {
      return error.message;
    }
  }

  return "The Crown could not complete that action.";
}
