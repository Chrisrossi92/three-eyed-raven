import assert from "node:assert/strict";
import { KnowledgeRepository } from "../services/knowledge/knowledgeRepository.js";
import { KnowledgeService } from "../services/knowledge/knowledgeService.js";
import { RavenCommandPlanner } from "../services/raven/ravenCommandPlanner.js";
import { RavenResponseFormatter } from "../services/raven/ravenResponseFormatter.js";

const repository = new KnowledgeRepository({
  knowledgeDir: "./src/data/knowledge"
});
const knowledgeService = new KnowledgeService(repository);
const formatter = new RavenResponseFormatter();
const planner = new RavenCommandPlanner(knowledgeService, formatter);

const onboarding = await planner.plan({
  intent: "ask",
  query: "new player onboarding",
  mode: "plain",
  audience: "public"
});
assert.equal(onboarding.response.isFallback, false);
assert.ok(onboarding.matchedRecords.some((record) => record.tags.includes("guide-faq")));
assert.match(onboarding.response.content, /\/raven onboarding|First, learn the realm premise/i);

const rebellion = await planner.plan({
  intent: "ask",
  query: "rebellion",
  mode: "lore",
  audience: "public"
});
assert.equal(rebellion.response.isFallback, false);
assert.match(rebellion.response.content, /The realm remembers:/);

const joinHouseFaq = await planner.plan({
  intent: "ask",
  query: "how do I join a house",
  audience: "public"
});
assert.equal(joinHouseFaq.response.isFallback, false);
assert.ok(joinHouseFaq.matchedRecords.some((record) => record.id === "guide-faq-join-house"));
assert.match(joinHouseFaq.response.content, /ask staff or a house leader/i);
assert.doesNotMatch(joinHouseFaq.response.content, /Pending decisions:/);
assert.equal(joinHouseFaq.request.audience, "public");

const currentBossGateFaq = await planner.plan({
  intent: "ask",
  query: "current boss gate",
  audience: "public"
});
assert.equal(currentBossGateFaq.response.isFallback, false);
assert.ok(currentBossGateFaq.matchedRecords.some((record) => record.id === "guide-faq-current-boss-gate"));
assert.ok(currentBossGateFaq.matchedRecords.some((record) => record.id === "active-boss-gate"));
assert.match(currentBossGateFaq.response.content, /Eikthyr/);

const betrayalFaq = await planner.plan({
  intent: "ask",
  query: "can houses betray each other",
  audience: "public"
});
assert.equal(betrayalFaq.response.isFallback, false);
assert.ok(betrayalFaq.matchedRecords.some((record) => record.id === "guide-faq-betrayal"));
assert.match(betrayalFaq.response.content, /political fantasy/i);
assert.doesNotMatch(betrayalFaq.response.content, /Pending decisions:/);

const protectedAreasFaq = await planner.plan({
  intent: "ask",
  query: "protected areas",
  audience: "public"
});
assert.equal(protectedAreasFaq.response.isFallback, false);
assert.ok(protectedAreasFaq.matchedRecords.some((record) => record.id === "guide-faq-protected-areas"));
assert.match(protectedAreasFaq.response.content, /Spawn, public infrastructure/i);

const publicSummary = await planner.plan({
  intent: "public_summary",
  audience: "public"
});
assert.match(publicSummary.response.content, /Current ruler: Chris/);
assert.doesNotMatch(publicSummary.response.content, /Pending decisions:/);

const starkHouse = await planner.plan({
  intent: "house",
  query: "Stark",
  mode: "plain",
  audience: "public"
});
assert.equal(starkHouse.response.isFallback, false);
assert.ok(starkHouse.matchedRecords.some((record) => record.id === "house-stark"));
assert.ok(starkHouse.matchedRecords.some((record) => record.id === "house-stark" && record.domain === "realm-state"));
assert.match(starkHouse.response.content, /House Stark/);
assert.doesNotMatch(starkHouse.response.content, /Pending decisions:/);

const lannisterHouse = await planner.plan({
  intent: "house",
  query: "Lannister",
  mode: "lore",
  audience: "public"
});
assert.equal(lannisterHouse.response.isFallback, false);
assert.match(lannisterHouse.response.content, /The realm remembers:/);

const unknownHouse = await planner.plan({
  intent: "house",
  query: "Targaryen",
  mode: "plain",
  audience: "public"
});
assert.equal(unknownHouse.response.isFallback, true);
assert.match(unknownHouse.response.content, /Known houses:/);
assert.match(unknownHouse.response.content, /House Stark/);

const defaultProgression = await planner.plan({
  intent: "progression_summary",
  audience: "public"
});
assert.equal(defaultProgression.response.isFallback, false);
assert.ok(defaultProgression.matchedRecords.some((record) => record.id === "canon-boss-progression-concept"));
assert.ok(defaultProgression.matchedRecords.some((record) => record.id === "active-boss-gate"));
assert.match(defaultProgression.response.content, /Boss Progression Concept/);
assert.doesNotMatch(defaultProgression.response.content, /Pending decisions:/);

const bossProgression = await planner.plan({
  intent: "progression_summary",
  query: "bosses",
  audience: "public"
});
assert.equal(bossProgression.response.isFallback, false);
assert.ok(bossProgression.matchedRecords.some((record) => record.id === "canon-boss-progression-concept"));

const rebellionProgression = await planner.plan({
  intent: "progression_summary",
  query: "rebellion",
  mode: "lore",
  audience: "public"
});
assert.equal(rebellionProgression.response.isFallback, false);
assert.ok(rebellionProgression.matchedRecords.some((record) => record.id === "canon-rebellion-concept"));
assert.match(rebellionProgression.response.content, /The realm remembers:/);

const currentGateProgression = await planner.plan({
  intent: "progression_summary",
  query: "current gate",
  audience: "public"
});
assert.equal(currentGateProgression.response.isFallback, false);
assert.ok(currentGateProgression.matchedRecords.some((record) => record.id === "active-boss-gate"));
assert.match(currentGateProgression.response.content, /Eikthyr/);

const unknownProgression = await planner.plan({
  intent: "progression_summary",
  query: "dragon taxes",
  audience: "public"
});
assert.equal(unknownProgression.response.isFallback, true);
assert.match(unknownProgression.response.content, /Suggested topics:/);

const defaultRoles = await planner.plan({
  intent: "roles_summary",
  audience: "public"
});
assert.equal(defaultRoles.response.isFallback, false);
assert.ok(defaultRoles.matchedRecords.some((record) => record.id === "role-king"));
assert.ok(defaultRoles.matchedRecords.some((record) => record.id === "role-house-member"));
assert.match(defaultRoles.response.content, /King/);
assert.doesNotMatch(defaultRoles.response.content, /Pending decisions:/);

const kingRole = await planner.plan({
  intent: "roles_summary",
  query: "king",
  audience: "public"
});
assert.equal(kingRole.response.isFallback, false);
assert.ok(kingRole.matchedRecords.some((record) => record.id === "role-king"));
assert.ok(kingRole.matchedRecords.some((record) => record.id === "current-king"));
assert.match(kingRole.response.content, /Chris/);

const handRole = await planner.plan({
  intent: "roles_summary",
  query: "hand",
  audience: "public"
});
assert.equal(handRole.response.isFallback, false);
assert.ok(handRole.matchedRecords.some((record) => record.id === "role-hand-of-the-king"));
assert.match(handRole.response.content, /Shiryo/);

const kingsguardRole = await planner.plan({
  intent: "roles_summary",
  query: "kingsguard",
  mode: "lore",
  audience: "public"
});
assert.equal(kingsguardRole.response.isFallback, false);
assert.ok(kingsguardRole.matchedRecords.some((record) => record.id === "role-kingsguard"));
assert.match(kingsguardRole.response.content, /Kriatiri/);
assert.match(kingsguardRole.response.content, /The realm remembers:/);

const houseLeaderRole = await planner.plan({
  intent: "roles_summary",
  query: "house leader",
  audience: "public"
});
assert.equal(houseLeaderRole.response.isFallback, false);
assert.ok(houseLeaderRole.matchedRecords.some((record) => record.id === "role-house-leader"));

const houseMemberRole = await planner.plan({
  intent: "roles_summary",
  query: "house member",
  audience: "public"
});
assert.equal(houseMemberRole.response.isFallback, false);
assert.ok(houseMemberRole.matchedRecords.some((record) => record.id === "role-house-member"));

const unknownRole = await planner.plan({
  intent: "roles_summary",
  query: "dragon keeper",
  audience: "public"
});
assert.equal(unknownRole.response.isFallback, true);
assert.match(unknownRole.response.content, /Suggested roles:/);

const onboardingSummary = await planner.plan({
  intent: "onboarding",
  audience: "public"
});
assert.equal(onboardingSummary.response.isFallback, false);
assert.match(onboardingSummary.response.content, /Game of Thrones-inspired/i);
assert.match(onboardingSummary.response.content, /Houses:/);
assert.match(onboardingSummary.response.content, /Current gate:/);
assert.match(onboardingSummary.response.content, /\/raven ask/);
assert.doesNotMatch(onboardingSummary.response.content, /Pending decisions:/);

const loreOnboarding = await planner.plan({
  intent: "onboarding",
  mode: "lore",
  audience: "public"
});
assert.match(loreOnboarding.response.content, /The realm remembers:/);

const defaultRules = await planner.plan({
  intent: "rules_summary",
  audience: "public"
});
assert.equal(defaultRules.response.isFallback, false);
assert.ok(defaultRules.matchedRecords.some((record) => record.id === "canon-protected-neutral-areas"));
assert.ok(defaultRules.matchedRecords.some((record) => record.id === "canon-roleplay-expectations"));
assert.ok(defaultRules.matchedRecords.some((record) => record.id === "canon-rebellion-concept"));
assert.match(defaultRules.response.content, /Protected and Neutral Areas/);
assert.doesNotMatch(defaultRules.response.content, /Pending decisions:/);

const protectedRules = await planner.plan({
  intent: "rules_summary",
  query: "protected areas",
  audience: "public"
});
assert.equal(protectedRules.response.isFallback, false);
assert.ok(protectedRules.matchedRecords.some((record) => record.id === "canon-protected-neutral-areas"));

const roleplayRules = await planner.plan({
  intent: "rules_summary",
  query: "roleplay",
  mode: "lore",
  audience: "public"
});
assert.equal(roleplayRules.response.isFallback, false);
assert.ok(roleplayRules.matchedRecords.some((record) => record.id === "canon-roleplay-expectations"));
assert.match(roleplayRules.response.content, /The realm remembers:/);

const rebellionRules = await planner.plan({
  intent: "rules_summary",
  query: "rebellion",
  audience: "public"
});
assert.equal(rebellionRules.response.isFallback, false);
assert.ok(rebellionRules.matchedRecords.some((record) => record.id === "canon-rebellion-concept"));

const unknownRules = await planner.plan({
  intent: "rules_summary",
  query: "dragon law",
  audience: "public"
});
assert.equal(unknownRules.response.isFallback, true);
assert.match(unknownRules.response.content, /Suggested topics:/);

const privateAdminSummary = await planner.plan({
  intent: "admin_summary",
  audience: "private_admin"
});
assert.match(privateAdminSummary.response.content, /\[Admin\]/);
assert.match(privateAdminSummary.response.content, /Pending decisions:/);

const publicAdminSummary = await planner.plan({
  intent: "admin_summary",
  audience: "public"
});
assert.doesNotMatch(publicAdminSummary.response.content, /Pending decisions:/);

const missing = await planner.plan({
  intent: "ask",
  query: "dragon glass tax code",
  audience: "public"
});
assert.equal(missing.response.isFallback, true);
assert.match(missing.response.content, /I do not yet hold that memory/);

const empty = await planner.plan({
  intent: "ask",
  audience: "public"
});
assert.equal(empty.response.isFallback, true);
assert.match(empty.response.content, /empty question/);

console.log("Raven command planner smoke checks passed.");
