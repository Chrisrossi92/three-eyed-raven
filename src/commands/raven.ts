import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import type { ChronicleApprovalService } from "../services/chronicle/chronicleApprovalService.js";
import type { ChronicleDraftService } from "../services/chronicle/chronicleDraftService.js";
import type { DiscordPermissionService } from "../services/discord/discordPermissionService.js";
import type { DutyService } from "../services/duties/dutyService.js";
import type { RavenCommandPlanner } from "../services/raven/ravenCommandPlanner.js";
import { planRavenAdminSummary } from "./ravenAdminSummaryAdapter.js";
import { planRavenChronicleDraft } from "./ravenChronicleDraftAdapter.js";
import { formatChronicleApprovalPreview, planRavenChroniclePreview } from "./ravenChroniclePreviewAdapter.js";
import { planRavenDuties } from "./ravenDutiesAdapter.js";
import {
  toRavenAdminSummaryPlanRequest,
  toRavenAskPlanRequest,
  toRavenHousePlanRequest,
  toRavenOnboardingPlanRequest,
  toRavenProgressionPlanRequest,
  toRavenRolesPlanRequest,
  toRavenRulesPlanRequest,
  toRavenSummaryPlanRequest,
  truncateDiscordContent
} from "./ravenAskAdapter.js";
import type { RavenCommand } from "./types.js";

const addModeOption = (option: SlashCommandStringOption) =>
  option
    .setName("mode")
    .setDescription("How the Raven should answer.")
    .setRequired(false)
    .addChoices(
      { name: "plain", value: "plain" },
      { name: "lore", value: "lore" },
      { name: "snark", value: "snark" }
    );

export const ravenCommandData = new SlashCommandBuilder()
  .setName("raven")
  .setDescription("Ask the Three-Eyed Raven about the realm.")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("ask")
      .setDescription("Ask a public-safe question about the realm.")
      .addStringOption((option) =>
        option
          .setName("question")
          .setDescription("What should the Raven answer?")
          .setRequired(true)
          .setMaxLength(300)
      )
      .addStringOption(addModeOption)
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("summary")
      .setDescription("Show a public-safe overview of the realm.")
      .addStringOption(addModeOption)
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("house")
      .setDescription("Show public-safe information about a house.")
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("House name to ask about.")
          .setRequired(true)
          .setMaxLength(100)
      )
      .addStringOption(addModeOption)
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("progression")
      .setDescription("Explain public progression, boss gates, and throne paths.")
      .addStringOption((option) =>
        option
          .setName("topic")
          .setDescription("Optional topic, such as bosses, rebellion, throne, or current gate.")
          .setRequired(false)
          .setMaxLength(100)
      )
      .addStringOption(addModeOption)
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("roles")
      .setDescription("Explain public roleplay and server roles.")
      .addStringOption((option) =>
        option
          .setName("role")
          .setDescription("Optional role, such as king, hand, kingsguard, house leader, or house member.")
          .setRequired(false)
          .setMaxLength(100)
      )
      .addStringOption(addModeOption)
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("onboarding")
      .setDescription("Give new players a public start-here path.")
      .addStringOption(addModeOption)
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("rules")
      .setDescription("Explain public server rules and launch-status caveats.")
      .addStringOption((option) =>
        option
          .setName("topic")
          .setDescription("Optional topic, such as protected areas, roleplay, rebellion, pvp, raiding, or launch.")
          .setRequired(false)
          .setMaxLength(100)
      )
      .addStringOption(addModeOption)
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("duties")
      .setDescription("Review admin duties and reminders.")
      .addStringOption((option) =>
        option
          .setName("category")
          .setDescription("Optional duty category, such as houses, rules, chronicle, or events.")
          .setRequired(false)
          .setMaxLength(80)
      )
      .addStringOption((option) =>
        option
          .setName("priority")
          .setDescription("Optional priority: low, medium, high, or critical.")
          .setRequired(false)
          .setMaxLength(40)
      )
      .addStringOption(addModeOption)
  )
  .addSubcommandGroup((group) =>
    group
      .setName("admin")
      .setDescription("Private Raven tools for the Small Council.")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("summary")
          .setDescription("Show a private admin summary.")
          .addStringOption(addModeOption)
      )
  )
  .addSubcommandGroup((group) =>
    group
      .setName("chronicle")
      .setDescription("Private Chronicle drafting tools for the Small Council.")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("draft")
          .setDescription("Draft a Chronicle event without recording it.")
          .addStringOption((option) =>
            option
              .setName("event")
              .setDescription("Plain-language event description.")
              .setRequired(true)
              .setMaxLength(800)
          )
          .addStringOption((option) =>
            option
              .setName("type")
              .setDescription("Optional event type, such as boss_kill, alliance, battle, or ruling.")
              .setRequired(false)
              .setMaxLength(80)
          )
          .addStringOption((option) =>
            option
              .setName("house")
              .setDescription("Optional related house.")
              .setRequired(false)
              .setMaxLength(120)
          )
          .addStringOption((option) =>
            option
              .setName("players")
              .setDescription("Optional comma-separated players.")
              .setRequired(false)
              .setMaxLength(300)
          )
          .addStringOption(addModeOption)
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("preview")
          .setDescription("Preview whether a Chronicle event is ready to record later.")
          .addStringOption((option) =>
            option
              .setName("event")
              .setDescription("Plain-language event description.")
              .setRequired(true)
              .setMaxLength(800)
          )
          .addStringOption((option) =>
            option
              .setName("type")
              .setDescription("Event type, such as boss_kill, alliance, battle, or ruling.")
              .setRequired(true)
              .setMaxLength(80)
          )
          .addStringOption((option) =>
            option
              .setName("title")
              .setDescription("Optional record title.")
              .setRequired(false)
              .setMaxLength(160)
          )
          .addStringOption((option) =>
            option
              .setName("house")
              .setDescription("Optional related house.")
              .setRequired(false)
              .setMaxLength(120)
          )
          .addStringOption((option) =>
            option
              .setName("players")
              .setDescription("Optional comma-separated players.")
              .setRequired(false)
              .setMaxLength(300)
          )
          .addStringOption((option) =>
            option
              .setName("occurred_at")
              .setDescription("Optional occurrence time or date.")
              .setRequired(false)
              .setMaxLength(120)
          )
          .addStringOption((option) =>
            option
              .setName("tags")
              .setDescription("Optional comma-separated tags.")
              .setRequired(false)
              .setMaxLength(300)
          )
          .addStringOption(addModeOption)
      )
  );

async function replyWithPlannedResponse(
  interaction: Parameters<RavenCommand["execute"]>[0]["interaction"],
  planner: RavenCommandPlanner,
  planRequest:
    | ReturnType<typeof toRavenAskPlanRequest>
    | ReturnType<typeof toRavenSummaryPlanRequest>
    | ReturnType<typeof toRavenHousePlanRequest>
    | ReturnType<typeof toRavenOnboardingPlanRequest>
    | ReturnType<typeof toRavenProgressionPlanRequest>
    | ReturnType<typeof toRavenRolesPlanRequest>
    | ReturnType<typeof toRavenRulesPlanRequest>
    | ReturnType<typeof toRavenAdminSummaryPlanRequest>,
  ephemeral = false
): Promise<void> {
  const result = await planner.plan(planRequest);

  await interaction.reply({
    content: truncateDiscordContent(result.response.content),
    ephemeral,
    allowedMentions: { parse: [] }
  });
}

function isRavenSubcommand(
  subcommand: string
): subcommand is "ask" | "summary" | "house" | "progression" | "roles" | "onboarding" | "rules" {
  return (
    subcommand === "ask" ||
    subcommand === "summary" ||
    subcommand === "house" ||
    subcommand === "progression" ||
    subcommand === "roles" ||
    subcommand === "onboarding" ||
    subcommand === "rules"
  );
}

function getPlanRequestForInteraction(
  interaction: Parameters<RavenCommand["execute"]>[0]["interaction"]
) {
  const subcommand = interaction.options.getSubcommand();

  if (!isRavenSubcommand(subcommand)) {
    return null;
  }

  const mode = interaction.options.getString("mode");

  if (subcommand === "ask") {
    return toRavenAskPlanRequest({
      question: interaction.options.getString("question", true),
      mode
    });
  }

  if (subcommand === "house") {
    return toRavenHousePlanRequest({
      name: interaction.options.getString("name", true),
      mode
    });
  }

  if (subcommand === "progression") {
    return toRavenProgressionPlanRequest({
      topic: interaction.options.getString("topic"),
      mode
    });
  }

  if (subcommand === "roles") {
    return toRavenRolesPlanRequest({
      role: interaction.options.getString("role"),
      mode
    });
  }

  if (subcommand === "onboarding") {
    return toRavenOnboardingPlanRequest({
      mode
    });
  }

  if (subcommand === "rules") {
    return toRavenRulesPlanRequest({
      topic: interaction.options.getString("topic"),
      mode
    });
  }

  return toRavenSummaryPlanRequest({
    mode
  });
}

function getMemberRoleIds(member: unknown): string[] {
  if (!member || typeof member !== "object" || !("roles" in member)) {
    return [];
  }

  const roles = (member as { roles?: unknown }).roles;

  if (Array.isArray(roles)) {
    return roles.filter((role): role is string => typeof role === "string");
  }

  if (roles && typeof roles === "object" && "cache" in roles) {
    const cache = (roles as { cache?: unknown }).cache;

    if (cache instanceof Map) {
      return [...cache.keys()].filter((role): role is string => typeof role === "string");
    }
  }

  return [];
}

function isAdminSummaryInteraction(interaction: Parameters<RavenCommand["execute"]>[0]["interaction"]): boolean {
  return interaction.options.getSubcommandGroup(false) === "admin" && interaction.options.getSubcommand() === "summary";
}

function isChronicleDraftInteraction(interaction: Parameters<RavenCommand["execute"]>[0]["interaction"]): boolean {
  return interaction.options.getSubcommandGroup(false) === "chronicle" && interaction.options.getSubcommand() === "draft";
}

function isChroniclePreviewInteraction(interaction: Parameters<RavenCommand["execute"]>[0]["interaction"]): boolean {
  return interaction.options.getSubcommandGroup(false) === "chronicle" && interaction.options.getSubcommand() === "preview";
}

function isDutiesInteraction(interaction: Parameters<RavenCommand["execute"]>[0]["interaction"]): boolean {
  return interaction.options.getSubcommandGroup(false) === null && interaction.options.getSubcommand() === "duties";
}

export function createRavenCommand(
  planner: RavenCommandPlanner,
  permissions: DiscordPermissionService,
  chronicleDraftService: ChronicleDraftService,
  chronicleApprovalService: ChronicleApprovalService,
  dutyService: DutyService
): RavenCommand {
  return {
    data: ravenCommandData,
    async execute({ interaction }) {
      if (isAdminSummaryInteraction(interaction)) {
        const decision = planRavenAdminSummary(
          {
            userId: interaction.user.id,
            memberRoleIds: getMemberRoleIds(interaction.member),
            channelId: interaction.channelId,
            mode: interaction.options.getString("mode")
          },
          permissions
        );

        if (!decision.allowed) {
          await interaction.reply({
            content: decision.message,
            ephemeral: decision.ephemeral,
            allowedMentions: { parse: [] }
          });
          return;
        }

        await replyWithPlannedResponse(interaction, planner, decision.planRequest, decision.ephemeral);
        return;
      }

      if (isChronicleDraftInteraction(interaction)) {
        const decision = planRavenChronicleDraft(
          {
            userId: interaction.user.id,
            memberRoleIds: getMemberRoleIds(interaction.member),
            channelId: interaction.channelId,
            event: interaction.options.getString("event", true),
            type: interaction.options.getString("type"),
            house: interaction.options.getString("house"),
            players: interaction.options.getString("players"),
            mode: interaction.options.getString("mode")
          },
          permissions
        );

        if (!decision.allowed) {
          await interaction.reply({
            content: decision.message,
            ephemeral: decision.ephemeral,
            allowedMentions: { parse: [] }
          });
          return;
        }

        const draft = chronicleDraftService.createDraft(decision.draftRequest);

        await interaction.reply({
          content: truncateDiscordContent(draft.text),
          ephemeral: decision.ephemeral,
          allowedMentions: { parse: [] }
        });
        return;
      }

      if (isChroniclePreviewInteraction(interaction)) {
        const decision = planRavenChroniclePreview(
          {
            userId: interaction.user.id,
            memberRoleIds: getMemberRoleIds(interaction.member),
            channelId: interaction.channelId,
            event: interaction.options.getString("event", true),
            type: interaction.options.getString("type", true),
            title: interaction.options.getString("title"),
            house: interaction.options.getString("house"),
            players: interaction.options.getString("players"),
            occurredAt: interaction.options.getString("occurred_at"),
            tags: interaction.options.getString("tags")
          },
          permissions
        );

        if (!decision.allowed) {
          await interaction.reply({
            content: decision.message,
            ephemeral: decision.ephemeral,
            allowedMentions: { parse: [] }
          });
          return;
        }

        const preview = chronicleApprovalService.createApprovalPreview(decision.previewRequest);

        await interaction.reply({
          content: truncateDiscordContent(formatChronicleApprovalPreview(preview)),
          ephemeral: decision.ephemeral,
          allowedMentions: { parse: [] }
        });
        return;
      }

      if (isDutiesInteraction(interaction)) {
        const decision = planRavenDuties(
          {
            userId: interaction.user.id,
            memberRoleIds: getMemberRoleIds(interaction.member),
            channelId: interaction.channelId,
            category: interaction.options.getString("category"),
            priority: interaction.options.getString("priority"),
            mode: interaction.options.getString("mode")
          },
          permissions
        );

        if (!decision.allowed) {
          await interaction.reply({
            content: decision.message,
            ephemeral: decision.ephemeral,
            allowedMentions: { parse: [] }
          });
          return;
        }

        const summary = await dutyService.getAdminDutiesSummary(decision.dutiesRequest);

        await interaction.reply({
          content: truncateDiscordContent(
            dutyService.formatAdminDutiesSummary(summary, decision.dutiesRequest.mode)
          ),
          ephemeral: decision.ephemeral,
          allowedMentions: { parse: [] }
        });
        return;
      }

      const planRequest = getPlanRequestForInteraction(interaction);

      if (!planRequest) {
        await interaction.reply({
          content: "I do not yet hold that path.",
          ephemeral: true
        });
        return;
      }

      await replyWithPlannedResponse(interaction, planner, planRequest);
    }
  };
}
