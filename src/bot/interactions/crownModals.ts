import type { ModalSubmitInteraction } from "discord.js";
import { loadHouses } from "../../data/ravenStore.js";
import type { AssignPlayerToHouseInput } from "../../services/houseService.js";
import type { AddLegacyNoteInput } from "../../services/legacyService.js";
import {
  canUseCrown,
  createCrownPanelReply,
  crownCustomIds,
  crownModalFieldIds
} from "../commands/crownCommand.js";
import { recordChronicleEntry } from "../../services/chronicleService.js";
import { assignPlayerToHouse, recognizeHouse } from "../../services/houseService.js";
import { addLegacyNote } from "../../services/legacyService.js";
import { setCurrentAge } from "../../services/realmService.js";
import { resolveHouseSearch } from "../houseSearch.js";

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

  if (interaction.customId === crownCustomIds.assignMemberModal) {
    await handleAssignMemberModal(interaction);
    return true;
  }

  if (interaction.customId === crownCustomIds.changeAgeModal) {
    await handleChangeAgeModal(interaction);
    return true;
  }

  return false;
}

async function handleAssignMemberModal(interaction: ModalSubmitInteraction): Promise<void> {
  const discordInput = interaction.fields.getTextInputValue(crownModalFieldIds.memberDiscordUser).trim();
  const realmName = interaction.fields.getTextInputValue(crownModalFieldIds.memberRealmName).trim();
  const houseInput = interaction.fields.getTextInputValue(crownModalFieldIds.memberHouse).trim();
  const notes = interaction.fields.getTextInputValue(crownModalFieldIds.memberNotes).trim();

  try {
    const discordId = parseDiscordId(discordInput);
    if (!discordId) {
      throw new Error("Enter a valid Discord user mention or ID.");
    }
    if (!realmName) {
      throw new Error("Realm Name is required.");
    }

    const houses = await loadHouses();
    const house = resolveHouseSearch(houses, houseInput);
    if (!house) {
      throw new Error(`Unknown House: ${houseInput}`);
    }

    const memberIdentity = await resolveDiscordIdentity(interaction, discordId);
    const assignmentInput: AssignPlayerToHouseInput = {
      discordId,
      realmName,
      houseId: house.id
    };
    if (memberIdentity.discordUsername) {
      assignmentInput.discordUsername = memberIdentity.discordUsername;
    }
    if (memberIdentity.serverNickname) {
      assignmentInput.serverNickname = memberIdentity.serverNickname;
    }

    await assignPlayerToHouse(assignmentInput);

    if (notes) {
      const noteInput: AddLegacyNoteInput = {
        discordId,
        realmName,
        note: notes,
        source: "crown-member-assignment"
      };
      if (memberIdentity.discordUsername) {
        noteInput.discordUsername = memberIdentity.discordUsername;
      }
      if (memberIdentity.serverNickname) {
        noteInput.serverNickname = memberIdentity.serverNickname;
      }

      await addLegacyNote(noteInput);
    }

    await recordChronicleEntry({
      type: "house_membership",
      summary: `${realmName} has sworn allegiance to ${house.name}.`,
      involvedHouses: [house.id],
      involvedPlayers: [discordId],
      approvedBy: interaction.user.id,
      source: "admin"
    });

    await interaction.reply({
      ...(await createCrownPanelReply()),
      content: `The Raven now knows ${realmName} of ${house.name}.`
    });
  } catch (error: unknown) {
    await interaction.reply({
      content: getFriendlyError(error),
      ephemeral: true
    });
  }
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
    customId === crownCustomIds.assignMemberModal ||
    customId === crownCustomIds.changeAgeModal
  );
}

function parseDiscordId(value: string): string | undefined {
  const mentionMatch = value.match(/^<@!?(\d+)>$/);
  if (mentionMatch?.[1]) {
    return mentionMatch[1];
  }

  return /^\d{5,}$/.test(value) ? value : undefined;
}

async function resolveDiscordIdentity(
  interaction: ModalSubmitInteraction,
  discordId: string
): Promise<{
  discordUsername?: string;
  serverNickname?: string;
}> {
  const member = interaction.guild?.members.cache.get(discordId);
  const cachedUser = member?.user ?? interaction.client.users.cache.get(discordId);
  const fetchedUser = cachedUser ?? (await interaction.client.users.fetch(discordId).catch(() => undefined));
  const identity: {
    discordUsername?: string;
    serverNickname?: string;
  } = {};

  if (fetchedUser?.username) {
    identity.discordUsername = fetchedUser.username;
  }
  if (member?.nickname) {
    identity.serverNickname = member.nickname;
  }

  return identity;
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
    if (error.message.includes("valid Discord")) {
      return error.message;
    }
    if (error.message.includes("Unknown House")) {
      return error.message;
    }
  }

  return "The Crown could not complete that action.";
}
