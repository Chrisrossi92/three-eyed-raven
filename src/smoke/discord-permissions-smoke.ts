import assert from "node:assert/strict";
import { loadConfig } from "../config/env.js";
import { toRavenAskPlanRequest, toRavenSummaryPlanRequest } from "../commands/ravenAskAdapter.js";
import { DiscordPermissionService } from "../services/discord/discordPermissionService.js";

const permissionService = new DiscordPermissionService({
  adminUserIds: ["user-admin"],
  adminRoleIds: ["role-admin"],
  smallCouncilChannelId: "small-council-channel"
});

assert.equal(permissionService.isAdminUser("user-admin"), true);
assert.equal(permissionService.isAdminUser("user-common"), false);
assert.equal(permissionService.hasAdminRole(["role-common", "role-admin"]), true);
assert.equal(permissionService.hasAdminRole(["role-common"]), false);
assert.equal(
  permissionService.canUseAdminRaven({
    userId: "user-common",
    memberRoleIds: ["role-admin"],
    channelId: "general"
  }),
  true
);
assert.equal(
  permissionService.canUseAdminRaven({
    userId: "user-common",
    memberRoleIds: ["role-common"],
    channelId: "general"
  }),
  false
);
assert.equal(permissionService.isSmallCouncilChannel("small-council-channel"), true);
assert.equal(permissionService.isSmallCouncilChannel("general"), false);

const emptyPermissionService = new DiscordPermissionService({
  adminUserIds: [],
  adminRoleIds: []
});
assert.equal(emptyPermissionService.isAdminUser("user-admin"), false);
assert.equal(emptyPermissionService.hasAdminRole(["role-admin"]), false);
assert.equal(
  emptyPermissionService.canUseAdminRaven({
    userId: "user-admin",
    memberRoleIds: ["role-admin"],
    channelId: "small-council-channel"
  }),
  false
);
assert.equal(emptyPermissionService.isSmallCouncilChannel("small-council-channel"), false);

const parsedConfig = loadConfig({
  DISCORD_TOKEN: "token",
  RAVEN_ADMIN_USER_IDS: " user-one, user-two ,,",
  RAVEN_ADMIN_ROLE_IDS: "role-one,role-two",
  RAVEN_SMALL_COUNCIL_CHANNEL_ID: "small-council-channel"
});
assert.deepEqual(parsedConfig.adminUserIds, ["user-one", "user-two"]);
assert.deepEqual(parsedConfig.adminRoleIds, ["role-one", "role-two"]);
assert.equal(parsedConfig.smallCouncilChannelId, "small-council-channel");

const publicAskRequest = toRavenAskPlanRequest({
  question: "new player",
  mode: "snark"
});
assert.equal(publicAskRequest.audience, "public");
assert.equal(publicAskRequest.intent, "ask");

const publicSummaryRequest = toRavenSummaryPlanRequest({
  mode: "lore"
});
assert.equal(publicSummaryRequest.audience, "public");
assert.equal(publicSummaryRequest.intent, "public_summary");

console.log("Discord permission smoke checks passed.");
