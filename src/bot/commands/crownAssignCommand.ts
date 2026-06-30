import {
  SlashCommandBuilder,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction
} from "discord.js";
import { loadHouses } from "../../data/ravenStore.js";
import { recordChronicleEntry } from "../../services/chronicleService.js";
import type { AssignPlayerToHouseInput } from "../../services/houseService.js";
import { assignPlayerToHouse, listHouses } from "../../services/houseService.js";
import type { AddLegacyNoteInput } from "../../services/legacyService.js";
import { addLegacyNote } from "../../services/legacyService.js";
import { canUseCrown } from "./crownCommand.js";
import { createHouseAutocompleteChoices, resolveHouseSearch } from "../houseSearch.js";

export const crownAssignCommand = {
  data: new SlashCommandBuilder()
    .setName("crown-assign")
    .setDescription("Assign a Discord user to a recognized House.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Discord user to assign.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("house")
        .setDescription("Recognized House.")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("realm-name")
        .setDescription("Player's Realm name.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("notes")
        .setDescription("Optional legacy note.")
        .setRequired(false)
    ),

  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    if (!canUseCrown(interaction)) {
      await interaction.respond([]);
      return;
    }

    const focusedOption = interaction.options.getFocused(true);
    if (focusedOption.name !== "house") {
      await interaction.respond([]);
      return;
    }

    const houses = await listHouses();
    await interaction.respond(createHouseAutocompleteChoices(houses, String(focusedOption.value)));
  },

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!canUseCrown(interaction)) {
      await interaction.reply({
        content: "Only the Crown's administrators may use this command.",
        ephemeral: true
      });
      return;
    }

    const user = interaction.options.getUser("user", true);
    const houseInput = interaction.options.getString("house", true).trim();
    const realmName = interaction.options.getString("realm-name", true).trim();
    const notes = interaction.options.getString("notes")?.trim();

    try {
      if (!realmName) {
        throw new Error("Realm Name is required.");
      }

      const houses = await loadHouses();
      const house = resolveHouseSearch(houses, houseInput);
      if (!house) {
        throw new Error(`Unknown House: ${houseInput}`);
      }

      const serverNickname = await resolveServerNickname(interaction, user.id);
      const assignmentInput: AssignPlayerToHouseInput = {
        discordId: user.id,
        discordUsername: user.username,
        realmName,
        houseId: house.id
      };
      if (serverNickname) {
        assignmentInput.serverNickname = serverNickname;
      }

      await assignPlayerToHouse(assignmentInput);

      if (notes) {
        const noteInput: AddLegacyNoteInput = {
          discordId: user.id,
          discordUsername: user.username,
          realmName,
          note: notes,
          source: "crown-member-assignment"
        };
        if (serverNickname) {
          noteInput.serverNickname = serverNickname;
        }

        await addLegacyNote(noteInput);
      }

      await recordChronicleEntry({
        type: "house_membership",
        summary: `${realmName} has sworn allegiance to ${house.name}.`,
        involvedHouses: [house.id],
        involvedPlayers: [user.id],
        approvedBy: interaction.user.id,
        source: "admin"
      });

      await interaction.reply({
        content: `The Raven now knows ${realmName} of ${house.name}.`,
        ephemeral: true
      });
    } catch (error: unknown) {
      await interaction.reply({
        content: getFriendlyError(error),
        ephemeral: true
      });
    }
  }
};

async function resolveServerNickname(
  interaction: ChatInputCommandInteraction,
  userId: string
): Promise<string | undefined> {
  const optionMember = interaction.options.getMember("user");
  if (optionMember && "nickname" in optionMember && optionMember.nickname) {
    return optionMember.nickname;
  }

  const cachedMember = interaction.guild?.members.cache.get(userId);
  if (cachedMember?.nickname) {
    return cachedMember.nickname;
  }

  const fetchedMember = await interaction.guild?.members.fetch(userId).catch(() => undefined);
  return fetchedMember?.nickname ?? undefined;
}

function getFriendlyError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("required")) {
      return error.message;
    }
    if (error.message.includes("Unknown House")) {
      return error.message;
    }
  }

  return "The Crown could not assign that member.";
}
