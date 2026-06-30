import assert from "node:assert/strict";
import type { RealmCanonRecord } from "../services/knowledge/knowledgeDomains.js";
import { KnowledgeRepository } from "../services/knowledge/knowledgeRepository.js";

const repository = new KnowledgeRepository({
  knowledgeDir: "./src/data/knowledge"
});

const realmCanon = await repository.readDomain("realm-canon");
const guideFaqRecords = realmCanon.records.filter((record) => record.category === "guide_faq");
const validStatuses = new Set<RealmCanonRecord["status"]>(["draft", "active", "retired", "needs_decision"]);
const validPublicRavenSubcommands = new Set([
  "ask",
  "onboarding",
  "summary",
  "house",
  "progression",
  "roles",
  "rules"
]);
const adminOnlyTags = new Set(["admin", "admin-only", "private", "private_admin", "sensitive-player-records"]);
const forbiddenAnswerPhrases = ["pending decision", "private_admin", "admin-only"];

assert.ok(guideFaqRecords.length > 0, "Expected at least one guide_faq record.");

const ids = new Set<string>();
const aliasesByNormalizedValue = new Map<string, string>();

for (const faq of guideFaqRecords) {
  assert.ok(faq.id.trim(), "Every FAQ must have an id.");
  assert.ok(!ids.has(faq.id), `Duplicate FAQ id: ${faq.id}`);
  ids.add(faq.id);

  assert.ok(faq.title.trim(), `FAQ ${faq.id} must have a public question/title.`);
  assert.ok(faq.answer?.trim(), `FAQ ${faq.id} must have an answer.`);
  assert.ok(faq.aliases && faq.aliases.length > 0, `FAQ ${faq.id} must have at least one alias/keyword.`);
  assert.ok(validStatuses.has(faq.status), `FAQ ${faq.id} has invalid status: ${faq.status}`);

  for (const tag of faq.tags) {
    assert.ok(!adminOnlyTags.has(normalizeToken(tag)), `FAQ ${faq.id} has private/admin-only tag: ${tag}`);
  }

  assert.ok(!faq.tags.includes("admin-drafts"), `FAQ ${faq.id} must not be marked admin-drafts.`);
  assert.ok(!faq.tags.includes("sensitive-player-records"), `FAQ ${faq.id} must not be marked sensitive.`);

  for (const alias of faq.aliases) {
    const normalizedAlias = normalizePhrase(alias);
    assert.ok(normalizedAlias, `FAQ ${faq.id} has an empty alias.`);

    const existingFaqId = aliasesByNormalizedValue.get(normalizedAlias);
    assert.ok(
      !existingFaqId,
      `FAQ alias "${alias}" is reused by ${existingFaqId} and ${faq.id}.`
    );
    aliasesByNormalizedValue.set(normalizedAlias, faq.id);
  }

  for (const relatedCommand of faq.relatedCommands ?? []) {
    assert.ok(isValidPublicRavenCommand(relatedCommand), `FAQ ${faq.id} has invalid related command: ${relatedCommand}`);
  }

  for (const phrase of forbiddenAnswerPhrases) {
    assert.ok(
      !normalizePhrase(faq.answer ?? "").includes(phrase),
      `FAQ ${faq.id} answer contains admin-only phrase: ${phrase}`
    );
  }
}

console.log("FAQ quality smoke checks passed.");

function isValidPublicRavenCommand(command: string): boolean {
  const parts = command.trim().split(/\s+/);

  if (parts[0] !== "/raven" || !parts[1]) {
    return false;
  }

  if (parts[1] === "admin") {
    return false;
  }

  return validPublicRavenSubcommands.has(parts[1]);
}

function normalizePhrase(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}
