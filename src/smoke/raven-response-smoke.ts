import assert from "node:assert/strict";
import { KnowledgeRepository } from "../services/knowledge/knowledgeRepository.js";
import { KnowledgeService } from "../services/knowledge/knowledgeService.js";
import { RavenResponseFormatter } from "../services/raven/ravenResponseFormatter.js";

const repository = new KnowledgeRepository({
  knowledgeDir: "./src/data/knowledge"
});
const knowledge = new KnowledgeService(repository);
const formatter = new RavenResponseFormatter();

const onboarding = await knowledge.getRecordById("realm-canon", "canon-new-player-onboarding");
assert.ok(onboarding);
const plainOnboarding = formatter.format({
  mode: "plain",
  audience: "public",
  records: [onboarding]
});
assert.equal(plainOnboarding.isFallback, false);
assert.match(plainOnboarding.content, /New players should be introduced/);
assert.doesNotMatch(plainOnboarding.content, /\[Admin\]/);

const rebellion = await knowledge.getRecordById("realm-canon", "canon-rebellion-concept");
assert.ok(rebellion);
const loreRebellion = formatter.format({
  mode: "lore",
  audience: "public",
  records: [rebellion]
});
assert.match(loreRebellion.content, /The realm remembers:/);
assert.match(loreRebellion.content, /not finalized/i);

const bonemass = await knowledge.getRecordById("raven-mind", "trigger-bonemass");
assert.ok(bonemass);
const snarkBonemass = formatter.format({
  mode: "snark",
  audience: "public",
  records: [bonemass]
});
assert.match(snarkBonemass.content, /swamp/i);

const adminSummary = await knowledge.getAdminKnowledgeSummary();
const privateAdmin = formatter.format({
  mode: "plain",
  audience: "private_admin",
  summary: adminSummary
});
assert.match(privateAdmin.content, /\[Admin\]/);
assert.match(privateAdmin.content, /Pending decisions:/);

const publicSummary = formatter.format({
  mode: "plain",
  audience: "public",
  summary: adminSummary
});
assert.doesNotMatch(publicSummary.content, /Pending decisions:/);

const missing = formatter.format({
  mode: "plain",
  audience: "public",
  fallbackTopic: "dragon glass tax code"
});
assert.equal(missing.isFallback, true);
assert.match(missing.content, /I do not yet hold that memory/);

console.log("Raven response smoke checks passed.");
