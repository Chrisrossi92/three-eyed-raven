import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRavenCommand, ravenCommandData } from "../commands/raven.js";
import { planRavenAdminSummary } from "../commands/ravenAdminSummaryAdapter.js";
import { planRavenChronicleDraft } from "../commands/ravenChronicleDraftAdapter.js";
import { formatChronicleApprovalPreview, planRavenChroniclePreview } from "../commands/ravenChroniclePreviewAdapter.js";
import { planRavenDuties } from "../commands/ravenDutiesAdapter.js";
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
} from "../commands/ravenAskAdapter.js";
import { ChronicleApprovalService } from "../services/chronicle/chronicleApprovalService.js";
import { ChronicleDraftService } from "../services/chronicle/chronicleDraftService.js";
import { DiscordPermissionService } from "../services/discord/discordPermissionService.js";
import { DutyRepository } from "../services/duties/dutyRepository.js";
import { DutyService } from "../services/duties/dutyService.js";

const defaultRequest = toRavenAskPlanRequest({
  question: "new player"
});
assert.equal(defaultRequest.intent, "ask");
assert.equal(defaultRequest.query, "new player");
assert.equal(defaultRequest.mode, "plain");
assert.equal(defaultRequest.audience, "public");

const snarkRequest = toRavenAskPlanRequest({
  question: "bonemass",
  mode: "snark"
});
assert.equal(snarkRequest.mode, "snark");
assert.equal(snarkRequest.audience, "public");

const unsafeModeRequest = toRavenAskPlanRequest({
  question: "rules",
  mode: "private_admin"
});
assert.equal(unsafeModeRequest.mode, "plain");
assert.equal(unsafeModeRequest.audience, "public");

const defaultSummaryRequest = toRavenSummaryPlanRequest({});
assert.equal(defaultSummaryRequest.intent, "public_summary");
assert.equal(defaultSummaryRequest.mode, "plain");
assert.equal(defaultSummaryRequest.audience, "public");
assert.ok(!("query" in defaultSummaryRequest));

const loreSummaryRequest = toRavenSummaryPlanRequest({
  mode: "lore"
});
assert.equal(loreSummaryRequest.mode, "lore");
assert.equal(loreSummaryRequest.audience, "public");

const snarkSummaryRequest = toRavenSummaryPlanRequest({
  mode: "snark"
});
assert.equal(snarkSummaryRequest.mode, "snark");
assert.equal(snarkSummaryRequest.audience, "public");
assert.notEqual(snarkSummaryRequest.intent, "admin_summary");

const defaultHouseRequest = toRavenHousePlanRequest({
  name: "Stark"
});
assert.equal(defaultHouseRequest.intent, "house");
assert.equal(defaultHouseRequest.query, "Stark");
assert.equal(defaultHouseRequest.mode, "plain");
assert.equal(defaultHouseRequest.audience, "public");

const loreHouseRequest = toRavenHousePlanRequest({
  name: "Lannister",
  mode: "lore"
});
assert.equal(loreHouseRequest.mode, "lore");
assert.equal(loreHouseRequest.audience, "public");

const unsafeHouseModeRequest = toRavenHousePlanRequest({
  name: "Baratheon",
  mode: "private_admin"
});
assert.equal(unsafeHouseModeRequest.mode, "plain");
assert.equal(unsafeHouseModeRequest.audience, "public");
assert.notEqual(unsafeHouseModeRequest.intent, "admin_summary");

const defaultProgressionRequest = toRavenProgressionPlanRequest({});
assert.equal(defaultProgressionRequest.intent, "progression_summary");
assert.equal(defaultProgressionRequest.mode, "plain");
assert.equal(defaultProgressionRequest.audience, "public");
assert.ok(!("query" in defaultProgressionRequest));

const loreProgressionRequest = toRavenProgressionPlanRequest({
  topic: "rebellion",
  mode: "lore"
});
assert.equal(loreProgressionRequest.query, "rebellion");
assert.equal(loreProgressionRequest.mode, "lore");
assert.equal(loreProgressionRequest.audience, "public");

const unsafeProgressionModeRequest = toRavenProgressionPlanRequest({
  topic: "current gate",
  mode: "private_admin"
});
assert.equal(unsafeProgressionModeRequest.mode, "plain");
assert.equal(unsafeProgressionModeRequest.audience, "public");
assert.notEqual(unsafeProgressionModeRequest.intent, "admin_summary");

const defaultRolesRequest = toRavenRolesPlanRequest({});
assert.equal(defaultRolesRequest.intent, "roles_summary");
assert.equal(defaultRolesRequest.mode, "plain");
assert.equal(defaultRolesRequest.audience, "public");
assert.ok(!("query" in defaultRolesRequest));

const loreRolesRequest = toRavenRolesPlanRequest({
  role: "kingsguard",
  mode: "lore"
});
assert.equal(loreRolesRequest.query, "kingsguard");
assert.equal(loreRolesRequest.mode, "lore");
assert.equal(loreRolesRequest.audience, "public");

const unsafeRolesModeRequest = toRavenRolesPlanRequest({
  role: "king",
  mode: "private_admin"
});
assert.equal(unsafeRolesModeRequest.mode, "plain");
assert.equal(unsafeRolesModeRequest.audience, "public");
assert.notEqual(unsafeRolesModeRequest.intent, "admin_summary");

const defaultOnboardingRequest = toRavenOnboardingPlanRequest({});
assert.equal(defaultOnboardingRequest.intent, "onboarding");
assert.equal(defaultOnboardingRequest.mode, "plain");
assert.equal(defaultOnboardingRequest.audience, "public");

const loreOnboardingRequest = toRavenOnboardingPlanRequest({
  mode: "lore"
});
assert.equal(loreOnboardingRequest.mode, "lore");
assert.equal(loreOnboardingRequest.audience, "public");

const unsafeOnboardingModeRequest = toRavenOnboardingPlanRequest({
  mode: "private_admin"
});
assert.equal(unsafeOnboardingModeRequest.mode, "plain");
assert.equal(unsafeOnboardingModeRequest.audience, "public");
assert.notEqual(unsafeOnboardingModeRequest.intent, "admin_summary");

const defaultRulesRequest = toRavenRulesPlanRequest({});
assert.equal(defaultRulesRequest.intent, "rules_summary");
assert.equal(defaultRulesRequest.mode, "plain");
assert.equal(defaultRulesRequest.audience, "public");
assert.ok(!("query" in defaultRulesRequest));

const loreRulesRequest = toRavenRulesPlanRequest({
  topic: "roleplay",
  mode: "lore"
});
assert.equal(loreRulesRequest.query, "roleplay");
assert.equal(loreRulesRequest.mode, "lore");
assert.equal(loreRulesRequest.audience, "public");

const unsafeRulesModeRequest = toRavenRulesPlanRequest({
  topic: "protected areas",
  mode: "private_admin"
});
assert.equal(unsafeRulesModeRequest.mode, "plain");
assert.equal(unsafeRulesModeRequest.audience, "public");
assert.notEqual(unsafeRulesModeRequest.intent, "admin_summary");

const adminSummaryRequest = toRavenAdminSummaryPlanRequest({
  mode: "lore"
});
assert.equal(adminSummaryRequest.intent, "admin_summary");
assert.equal(adminSummaryRequest.mode, "lore");
assert.equal(adminSummaryRequest.audience, "private_admin");

const adminPermissions = new DiscordPermissionService({
  adminUserIds: ["admin-user"],
  adminRoleIds: ["admin-role"],
  smallCouncilChannelId: "small-council"
});
const unusedApprovalService = {
  createApprovalPreview: () => {
    throw new Error("Approval service should not be called.");
  }
} as never;
const unusedDutyService = {
  getAdminDutiesSummary: async () => {
    throw new Error("Duty service should not be called.");
  },
  formatAdminDutiesSummary: () => {
    throw new Error("Duty service should not be called.");
  }
} as never;
const unauthorizedDecision = planRavenAdminSummary(
  {
    userId: "common-user",
    memberRoleIds: ["common-role"],
    channelId: "small-council"
  },
  adminPermissions
);
assert.equal(unauthorizedDecision.allowed, false);
assert.equal(unauthorizedDecision.reason, "unauthorized");

const wrongChannelDecision = planRavenAdminSummary(
  {
    userId: "admin-user",
    memberRoleIds: [],
    channelId: "general"
  },
  adminPermissions
);
assert.equal(wrongChannelDecision.allowed, false);
assert.equal(wrongChannelDecision.reason, "wrong_channel");

const allowedDecision = planRavenAdminSummary(
  {
    userId: "common-user",
    memberRoleIds: ["admin-role"],
    channelId: "small-council",
    mode: "snark"
  },
  adminPermissions
);
assert.equal(allowedDecision.allowed, true);
assert.equal(allowedDecision.planRequest.intent, "admin_summary");
assert.equal(allowedDecision.planRequest.audience, "private_admin");
assert.equal(allowedDecision.planRequest.mode, "snark");

const noSmallCouncilPermissions = new DiscordPermissionService({
  adminUserIds: ["admin-user"],
  adminRoleIds: []
});
const noSmallCouncilDecision = planRavenAdminSummary(
  {
    userId: "admin-user",
    memberRoleIds: [],
    channelId: "general"
  },
  noSmallCouncilPermissions
);
assert.equal(noSmallCouncilDecision.allowed, true);
assert.equal(noSmallCouncilDecision.ephemeral, true);

const unauthorizedChronicleDecision = planRavenChronicleDraft(
  {
    userId: "common-user",
    memberRoleIds: ["common-role"],
    channelId: "small-council",
    event: "House Stark defeated Eikthyr."
  },
  adminPermissions
);
assert.equal(unauthorizedChronicleDecision.allowed, false);
assert.equal(unauthorizedChronicleDecision.reason, "unauthorized");

const wrongChannelChronicleDecision = planRavenChronicleDraft(
  {
    userId: "admin-user",
    memberRoleIds: [],
    channelId: "general",
    event: "House Stark defeated Eikthyr."
  },
  adminPermissions
);
assert.equal(wrongChannelChronicleDecision.allowed, false);
assert.equal(wrongChannelChronicleDecision.reason, "wrong_channel");

const allowedChronicleDecision = planRavenChronicleDraft(
  {
    userId: "admin-user",
    memberRoleIds: [],
    channelId: "small-council",
    event: "House Stark defeated Eikthyr and became the first house to draw blood.",
    type: "boss_kill",
    house: "House Stark",
    players: "Kriatiri, Chris",
    mode: "lore"
  },
  adminPermissions
);
assert.equal(allowedChronicleDecision.allowed, true);
assert.equal(allowedChronicleDecision.draftRequest.mode, "lore");

const chronicleDraft = new ChronicleDraftService().createDraft(allowedChronicleDecision.draftRequest);
assert.match(chronicleDraft.text, /DRAFT — not yet recorded/);
assert.match(chronicleDraft.text, /House Stark defeated Eikthyr/);
assert.match(chronicleDraft.text, /Type: boss_kill/);
assert.match(chronicleDraft.text, /House: House Stark/);
assert.match(chronicleDraft.text, /Players: Kriatiri, Chris/);

const unauthorizedPreviewDecision = planRavenChroniclePreview(
  {
    userId: "common-user",
    memberRoleIds: ["common-role"],
    channelId: "small-council",
    event: "House Stark defeated Eikthyr.",
    type: "boss_kill"
  },
  adminPermissions
);
assert.equal(unauthorizedPreviewDecision.allowed, false);
assert.equal(unauthorizedPreviewDecision.reason, "unauthorized");

const wrongChannelPreviewDecision = planRavenChroniclePreview(
  {
    userId: "admin-user",
    memberRoleIds: [],
    channelId: "general",
    event: "House Stark defeated Eikthyr.",
    type: "boss_kill"
  },
  adminPermissions
);
assert.equal(wrongChannelPreviewDecision.allowed, false);
assert.equal(wrongChannelPreviewDecision.reason, "wrong_channel");

const allowedPreviewDecision = planRavenChroniclePreview(
  {
    userId: "admin-user",
    memberRoleIds: [],
    channelId: "small-council",
    event: "House Stark defeated Eikthyr and became the first house to draw blood.",
    type: "boss_kill",
    title: "First Blood at Eikthyr",
    house: "House Stark",
    players: "Kriatiri, Chris",
    occurredAt: "2026-06-28",
    tags: "boss, stark"
  },
  adminPermissions
);
assert.equal(allowedPreviewDecision.allowed, true);
const approvalPreview = new ChronicleApprovalService().createApprovalPreview(allowedPreviewDecision.previewRequest);
const formattedPreview = formatChronicleApprovalPreview(approvalPreview);
assert.match(formattedPreview, /APPROVAL PREVIEW — no Chronicle write performed/);
assert.match(formattedPreview, /Ready: yes/);
assert.match(formattedPreview, /Factual summary: House Stark defeated Eikthyr/);
assert.match(formattedPreview, /Lore summary: Let it be written for the ravens/);
assert.match(formattedPreview, /Type: boss_kill/);
assert.match(formattedPreview, /House: House Stark/);
assert.match(formattedPreview, /Players: Kriatiri, Chris/);
assert.match(formattedPreview, /Tags: boss, stark/);

const missingTypePreviewDecision = planRavenChroniclePreview(
  {
    userId: "admin-user",
    memberRoleIds: [],
    channelId: "small-council",
    event: "House Stark defeated Eikthyr.",
    type: "not_a_type"
  },
  adminPermissions
);
assert.equal(missingTypePreviewDecision.allowed, true);
const missingTypePreview = new ChronicleApprovalService().createApprovalPreview(
  missingTypePreviewDecision.previewRequest
);
assert.equal(missingTypePreview.ready, false);
assert.ok(missingTypePreview.missingFields.includes("type"));
assert.match(formatChronicleApprovalPreview(missingTypePreview), /Ready: no/);

const unauthorizedDutiesDecision = planRavenDuties(
  {
    userId: "common-user",
    memberRoleIds: ["common-role"],
    channelId: "small-council"
  },
  adminPermissions
);
assert.equal(unauthorizedDutiesDecision.allowed, false);
assert.equal(unauthorizedDutiesDecision.reason, "unauthorized");

const wrongChannelDutiesDecision = planRavenDuties(
  {
    userId: "admin-user",
    memberRoleIds: [],
    channelId: "general"
  },
  adminPermissions
);
assert.equal(wrongChannelDutiesDecision.allowed, false);
assert.equal(wrongChannelDutiesDecision.reason, "wrong_channel");

const allowedDutiesDecision = planRavenDuties(
  {
    userId: "admin-user",
    memberRoleIds: [],
    channelId: "small-council",
    category: "chronicle",
    priority: "high",
    mode: "lore"
  },
  adminPermissions
);
assert.equal(allowedDutiesDecision.allowed, true);
assert.equal(allowedDutiesDecision.dutiesRequest.category, "chronicle");
assert.equal(allowedDutiesDecision.dutiesRequest.priority, "high");
assert.equal(allowedDutiesDecision.dutiesRequest.mode, "lore");

const commandJson = ravenCommandData.toJSON();
assert.equal(commandJson.name, "raven");
assert.ok(commandJson.options?.some((option) => option.name === "ask"));
assert.ok(commandJson.options?.some((option) => option.name === "summary"));
assert.ok(commandJson.options?.some((option) => option.name === "house"));
assert.ok(commandJson.options?.some((option) => option.name === "progression"));
assert.ok(commandJson.options?.some((option) => option.name === "roles"));
assert.ok(commandJson.options?.some((option) => option.name === "onboarding"));
assert.ok(commandJson.options?.some((option) => option.name === "rules"));
assert.ok(commandJson.options?.some((option) => option.name === "duties"));
assert.ok(commandJson.options?.some((option) => option.name === "admin"));
assert.ok(commandJson.options?.some((option) => option.name === "chronicle"));

assert.equal(truncateDiscordContent("short"), "short");
assert.ok(truncateDiscordContent("x".repeat(2000)).length <= 1900);

let deniedPlannerCalls = 0;
const deniedCommand = createRavenCommand(
  {
    plan: async () => {
      deniedPlannerCalls += 1;
      throw new Error("Planner should not be called.");
    }
  } as never,
  adminPermissions,
  {
    createDraft: () => {
      throw new Error("Draft service should not be called.");
    }
  } as never,
  unusedApprovalService,
  unusedDutyService
);
const deniedReplies: Array<{ content: string; ephemeral?: boolean }> = [];
await deniedCommand.execute({
  interaction: {
    user: { id: "common-user" },
    member: { roles: ["common-role"] },
    channelId: "small-council",
    options: {
      getSubcommandGroup: () => "admin",
      getSubcommand: () => "summary",
      getString: () => null
    },
    reply: async (response: { content: string; ephemeral?: boolean }) => {
      deniedReplies.push(response);
    }
  } as never
});
assert.equal(deniedPlannerCalls, 0);
assert.equal(deniedReplies[0]?.ephemeral, true);

let wrongChannelPlannerCalls = 0;
const wrongChannelCommand = createRavenCommand(
  {
    plan: async () => {
      wrongChannelPlannerCalls += 1;
      throw new Error("Planner should not be called.");
    }
  } as never,
  adminPermissions,
  {
    createDraft: () => {
      throw new Error("Draft service should not be called.");
    }
  } as never,
  unusedApprovalService,
  unusedDutyService
);
const wrongChannelReplies: Array<{ content: string; ephemeral?: boolean }> = [];
await wrongChannelCommand.execute({
  interaction: {
    user: { id: "admin-user" },
    member: { roles: [] },
    channelId: "general",
    options: {
      getSubcommandGroup: () => "admin",
      getSubcommand: () => "summary",
      getString: () => null
    },
    reply: async (response: { content: string; ephemeral?: boolean }) => {
      wrongChannelReplies.push(response);
    }
  } as never
});
assert.equal(wrongChannelPlannerCalls, 0);
assert.equal(wrongChannelReplies[0]?.ephemeral, true);
assert.match(wrongChannelReplies[0]?.content ?? "", /Small Council Chamber/);

let allowedPlannerCalls = 0;
const allowedCommand = createRavenCommand(
  {
    plan: async (request: typeof adminSummaryRequest) => {
      allowedPlannerCalls += 1;
      assert.equal(request.intent, "admin_summary");
      assert.equal(request.audience, "private_admin");
      return {
        request,
        matchedRecords: [],
        response: {
          mode: request.mode ?? "plain",
          audience: request.audience,
          title: "Admin Knowledge Summary",
          content: "[Admin] private summary",
          sources: [],
          isFallback: false
        }
      };
    }
  } as never,
  adminPermissions,
  {
    createDraft: () => {
      throw new Error("Draft service should not be called for admin summary.");
    }
  } as never,
  unusedApprovalService,
  unusedDutyService
);
const allowedReplies: Array<{ content: string; ephemeral?: boolean }> = [];
await allowedCommand.execute({
  interaction: {
    user: { id: "admin-user" },
    member: { roles: [] },
    channelId: "small-council",
    options: {
      getSubcommandGroup: () => "admin",
      getSubcommand: () => "summary",
      getString: () => "plain"
    },
    reply: async (response: { content: string; ephemeral?: boolean }) => {
      allowedReplies.push(response);
    }
  } as never
});
assert.equal(allowedPlannerCalls, 1);
assert.equal(allowedReplies[0]?.ephemeral, true);
assert.match(allowedReplies[0]?.content ?? "", /\[Admin\]/);

let deniedDraftServiceCalls = 0;
const deniedChronicleCommand = createRavenCommand(
  {
    plan: async () => {
      throw new Error("Planner should not be called for chronicle draft.");
    }
  } as never,
  adminPermissions,
  {
    createDraft: () => {
      deniedDraftServiceCalls += 1;
      throw new Error("Draft service should not be called.");
    }
  } as never,
  unusedApprovalService,
  unusedDutyService
);
const deniedChronicleReplies: Array<{ content: string; ephemeral?: boolean }> = [];
await deniedChronicleCommand.execute({
  interaction: {
    user: { id: "common-user" },
    member: { roles: ["common-role"] },
    channelId: "small-council",
    options: {
      getSubcommandGroup: () => "chronicle",
      getSubcommand: () => "draft",
      getString: (name: string) => (name === "event" ? "House Stark defeated Eikthyr." : null)
    },
    reply: async (response: { content: string; ephemeral?: boolean }) => {
      deniedChronicleReplies.push(response);
    }
  } as never
});
assert.equal(deniedDraftServiceCalls, 0);
assert.equal(deniedChronicleReplies[0]?.ephemeral, true);

let wrongChannelDraftServiceCalls = 0;
const wrongChannelChronicleCommand = createRavenCommand(
  {
    plan: async () => {
      throw new Error("Planner should not be called for chronicle draft.");
    }
  } as never,
  adminPermissions,
  {
    createDraft: () => {
      wrongChannelDraftServiceCalls += 1;
      throw new Error("Draft service should not be called.");
    }
  } as never,
  unusedApprovalService,
  unusedDutyService
);
const wrongChannelChronicleReplies: Array<{ content: string; ephemeral?: boolean }> = [];
await wrongChannelChronicleCommand.execute({
  interaction: {
    user: { id: "admin-user" },
    member: { roles: [] },
    channelId: "general",
    options: {
      getSubcommandGroup: () => "chronicle",
      getSubcommand: () => "draft",
      getString: (name: string) => (name === "event" ? "House Stark defeated Eikthyr." : null)
    },
    reply: async (response: { content: string; ephemeral?: boolean }) => {
      wrongChannelChronicleReplies.push(response);
    }
  } as never
});
assert.equal(wrongChannelDraftServiceCalls, 0);
assert.equal(wrongChannelChronicleReplies[0]?.ephemeral, true);
assert.match(wrongChannelChronicleReplies[0]?.content ?? "", /Small Council Chamber/);

const chronicleBefore = await readFile("./src/data/knowledge/chronicle.json", "utf8");
let allowedDraftServiceCalls = 0;
const allowedChronicleCommand = createRavenCommand(
  {
    plan: async () => {
      throw new Error("Planner should not be called for chronicle draft.");
    }
  } as never,
  adminPermissions,
  {
    createDraft: (request: typeof allowedChronicleDecision.draftRequest) => {
      allowedDraftServiceCalls += 1;
      return new ChronicleDraftService().createDraft(request);
    }
  } as never,
  unusedApprovalService,
  unusedDutyService
);
const allowedChronicleReplies: Array<{ content: string; ephemeral?: boolean }> = [];
await allowedChronicleCommand.execute({
  interaction: {
    user: { id: "admin-user" },
    member: { roles: [] },
    channelId: "small-council",
    options: {
      getSubcommandGroup: () => "chronicle",
      getSubcommand: () => "draft",
      getString: (name: string) => {
        const values: Record<string, string> = {
          event: "House Stark defeated Eikthyr and became the first house to draw blood.",
          type: "boss_kill",
          house: "House Stark",
          players: "Kriatiri, Chris",
          mode: "lore"
        };
        return values[name] ?? null;
      }
    },
    reply: async (response: { content: string; ephemeral?: boolean }) => {
      allowedChronicleReplies.push(response);
    }
  } as never
});
const chronicleAfter = await readFile("./src/data/knowledge/chronicle.json", "utf8");
assert.equal(allowedDraftServiceCalls, 1);
assert.equal(allowedChronicleReplies[0]?.ephemeral, true);
assert.match(allowedChronicleReplies[0]?.content ?? "", /DRAFT — not yet recorded/);
assert.match(allowedChronicleReplies[0]?.content ?? "", /House Stark defeated Eikthyr/);
assert.equal(chronicleAfter, chronicleBefore);

let deniedPreviewServiceCalls = 0;
const deniedPreviewCommand = createRavenCommand(
  {
    plan: async () => {
      throw new Error("Planner should not be called for chronicle preview.");
    }
  } as never,
  adminPermissions,
  {
    createDraft: () => {
      throw new Error("Draft service should not be called for chronicle preview.");
    }
  } as never,
  {
    createApprovalPreview: () => {
      deniedPreviewServiceCalls += 1;
      throw new Error("Preview service should not be called.");
    }
  } as never,
  unusedDutyService
);
const deniedPreviewReplies: Array<{ content: string; ephemeral?: boolean }> = [];
await deniedPreviewCommand.execute({
  interaction: {
    user: { id: "common-user" },
    member: { roles: ["common-role"] },
    channelId: "small-council",
    options: {
      getSubcommandGroup: () => "chronicle",
      getSubcommand: () => "preview",
      getString: (name: string) => {
        const values: Record<string, string> = {
          event: "House Stark defeated Eikthyr.",
          type: "boss_kill"
        };
        return values[name] ?? null;
      }
    },
    reply: async (response: { content: string; ephemeral?: boolean }) => {
      deniedPreviewReplies.push(response);
    }
  } as never
});
assert.equal(deniedPreviewServiceCalls, 0);
assert.equal(deniedPreviewReplies[0]?.ephemeral, true);

let wrongChannelPreviewServiceCalls = 0;
const wrongChannelPreviewCommand = createRavenCommand(
  {
    plan: async () => {
      throw new Error("Planner should not be called for chronicle preview.");
    }
  } as never,
  adminPermissions,
  {
    createDraft: () => {
      throw new Error("Draft service should not be called for chronicle preview.");
    }
  } as never,
  {
    createApprovalPreview: () => {
      wrongChannelPreviewServiceCalls += 1;
      throw new Error("Preview service should not be called.");
    }
  } as never,
  unusedDutyService
);
const wrongChannelPreviewReplies: Array<{ content: string; ephemeral?: boolean }> = [];
await wrongChannelPreviewCommand.execute({
  interaction: {
    user: { id: "admin-user" },
    member: { roles: [] },
    channelId: "general",
    options: {
      getSubcommandGroup: () => "chronicle",
      getSubcommand: () => "preview",
      getString: (name: string) => {
        const values: Record<string, string> = {
          event: "House Stark defeated Eikthyr.",
          type: "boss_kill"
        };
        return values[name] ?? null;
      }
    },
    reply: async (response: { content: string; ephemeral?: boolean }) => {
      wrongChannelPreviewReplies.push(response);
    }
  } as never
});
assert.equal(wrongChannelPreviewServiceCalls, 0);
assert.equal(wrongChannelPreviewReplies[0]?.ephemeral, true);
assert.match(wrongChannelPreviewReplies[0]?.content ?? "", /Small Council Chamber/);

const chronicleBeforePreview = await readFile("./src/data/knowledge/chronicle.json", "utf8");
let allowedPreviewServiceCalls = 0;
const allowedPreviewCommand = createRavenCommand(
  {
    plan: async () => {
      throw new Error("Planner should not be called for chronicle preview.");
    }
  } as never,
  adminPermissions,
  {
    createDraft: () => {
      throw new Error("Draft service should not be called for chronicle preview.");
    }
  } as never,
  {
    createApprovalPreview: (request: typeof allowedPreviewDecision.previewRequest) => {
      allowedPreviewServiceCalls += 1;
      return new ChronicleApprovalService().createApprovalPreview(request);
    }
  } as never,
  unusedDutyService
);
const allowedPreviewReplies: Array<{ content: string; ephemeral?: boolean }> = [];
await allowedPreviewCommand.execute({
  interaction: {
    user: { id: "admin-user" },
    member: { roles: [] },
    channelId: "small-council",
    options: {
      getSubcommandGroup: () => "chronicle",
      getSubcommand: () => "preview",
      getString: (name: string) => {
        const values: Record<string, string> = {
          event: "House Stark defeated Eikthyr and became the first house to draw blood.",
          type: "boss_kill",
          title: "First Blood at Eikthyr",
          house: "House Stark",
          players: "Kriatiri, Chris",
          occurred_at: "2026-06-28",
          tags: "boss, stark",
          mode: "lore"
        };
        return values[name] ?? null;
      }
    },
    reply: async (response: { content: string; ephemeral?: boolean }) => {
      allowedPreviewReplies.push(response);
    }
  } as never
});
const chronicleAfterPreview = await readFile("./src/data/knowledge/chronicle.json", "utf8");
assert.equal(allowedPreviewServiceCalls, 1);
assert.equal(allowedPreviewReplies[0]?.ephemeral, true);
assert.match(allowedPreviewReplies[0]?.content ?? "", /APPROVAL PREVIEW — no Chronicle write performed/);
assert.match(allowedPreviewReplies[0]?.content ?? "", /Ready: yes/);
assert.match(allowedPreviewReplies[0]?.content ?? "", /Factual summary: House Stark defeated Eikthyr/);
assert.match(allowedPreviewReplies[0]?.content ?? "", /Lore summary:/);
assert.equal(chronicleAfterPreview, chronicleBeforePreview);

let deniedDutyServiceCalls = 0;
const deniedDutiesCommand = createRavenCommand(
  {
    plan: async () => {
      throw new Error("Planner should not be called for duties.");
    }
  } as never,
  adminPermissions,
  {
    createDraft: () => {
      throw new Error("Draft service should not be called for duties.");
    }
  } as never,
  unusedApprovalService,
  {
    getAdminDutiesSummary: async () => {
      deniedDutyServiceCalls += 1;
      throw new Error("Duty service should not be called.");
    },
    formatAdminDutiesSummary: () => {
      throw new Error("Duty service should not be called.");
    }
  } as never
);
const deniedDutiesReplies: Array<{ content: string; ephemeral?: boolean }> = [];
await deniedDutiesCommand.execute({
  interaction: {
    user: { id: "common-user" },
    member: { roles: ["common-role"] },
    channelId: "small-council",
    options: {
      getSubcommandGroup: () => null,
      getSubcommand: () => "duties",
      getString: () => null
    },
    reply: async (response: { content: string; ephemeral?: boolean }) => {
      deniedDutiesReplies.push(response);
    }
  } as never
});
assert.equal(deniedDutyServiceCalls, 0);
assert.equal(deniedDutiesReplies[0]?.ephemeral, true);

let wrongChannelDutyServiceCalls = 0;
const wrongChannelDutiesCommand = createRavenCommand(
  {
    plan: async () => {
      throw new Error("Planner should not be called for duties.");
    }
  } as never,
  adminPermissions,
  {
    createDraft: () => {
      throw new Error("Draft service should not be called for duties.");
    }
  } as never,
  unusedApprovalService,
  {
    getAdminDutiesSummary: async () => {
      wrongChannelDutyServiceCalls += 1;
      throw new Error("Duty service should not be called.");
    },
    formatAdminDutiesSummary: () => {
      throw new Error("Duty service should not be called.");
    }
  } as never
);
const wrongChannelDutiesReplies: Array<{ content: string; ephemeral?: boolean }> = [];
await wrongChannelDutiesCommand.execute({
  interaction: {
    user: { id: "admin-user" },
    member: { roles: [] },
    channelId: "general",
    options: {
      getSubcommandGroup: () => null,
      getSubcommand: () => "duties",
      getString: () => null
    },
    reply: async (response: { content: string; ephemeral?: boolean }) => {
      wrongChannelDutiesReplies.push(response);
    }
  } as never
});
assert.equal(wrongChannelDutyServiceCalls, 0);
assert.equal(wrongChannelDutiesReplies[0]?.ephemeral, true);
assert.match(wrongChannelDutiesReplies[0]?.content ?? "", /Small Council Chamber/);

const dutiesBefore = await readFile("./src/data/admin/duties.json", "utf8");
let allowedDutyServiceCalls = 0;
const dutyService = new DutyService(
  new DutyRepository({
    dutyFile: "./src/data/admin/duties.json"
  })
);
const allowedDutiesCommand = createRavenCommand(
  {
    plan: async () => {
      throw new Error("Planner should not be called for duties.");
    }
  } as never,
  adminPermissions,
  {
    createDraft: () => {
      throw new Error("Draft service should not be called for duties.");
    }
  } as never,
  unusedApprovalService,
  {
    getAdminDutiesSummary: async (request: typeof allowedDutiesDecision.dutiesRequest) => {
      allowedDutyServiceCalls += 1;
      return dutyService.getAdminDutiesSummary(request);
    },
    formatAdminDutiesSummary: dutyService.formatAdminDutiesSummary.bind(dutyService)
  } as never
);
const allowedDutiesReplies: Array<{ content: string; ephemeral?: boolean }> = [];
await allowedDutiesCommand.execute({
  interaction: {
    user: { id: "admin-user" },
    member: { roles: [] },
    channelId: "small-council",
    options: {
      getSubcommandGroup: () => null,
      getSubcommand: () => "duties",
      getString: (name: string) => {
        const values: Record<string, string> = {
          category: "chronicle",
          priority: "high",
          mode: "plain"
        };
        return values[name] ?? null;
      }
    },
    reply: async (response: { content: string; ephemeral?: boolean }) => {
      allowedDutiesReplies.push(response);
    }
  } as never
});
const dutiesAfter = await readFile("./src/data/admin/duties.json", "utf8");
assert.equal(allowedDutyServiceCalls, 1);
assert.equal(allowedDutiesReplies[0]?.ephemeral, true);
assert.match(allowedDutiesReplies[0]?.content ?? "", /Update Chronicle after major event/);
assert.equal(dutiesAfter, dutiesBefore);

console.log("Raven command adapter smoke checks passed.");
