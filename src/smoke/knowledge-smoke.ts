import assert from "node:assert/strict";
import { KnowledgeRepository } from "../services/knowledge/knowledgeRepository.js";
import { KnowledgeService } from "../services/knowledge/knowledgeService.js";

const repository = new KnowledgeRepository({
  knowledgeDir: "./src/data/knowledge"
});
const service = new KnowledgeService(repository);

const domains = await repository.readAllDomains();

assert.equal(domains.length, 5);
assert.deepEqual(
  domains.map((domain) => domain.domain).sort(),
  ["chronicle", "raven-mind", "realm-canon", "realm-state", "world-intelligence"]
);

const serverPremise = await service.getRecordById("realm-canon", "canon-server-premise");
assert.ok(serverPremise);
assert.equal(serverPremise.title, "Server Premise");

const houseRecords = await service.findRecordsByTag("realm-canon", "houses");
assert.ok(houseRecords.some((record) => record.id === "house-stark"));
assert.ok(houseRecords.some((record) => record.id === "house-lannister"));
assert.ok(houseRecords.some((record) => record.id === "house-baratheon"));

const rebellionResults = await service.searchRecords("rebellion");
assert.ok(rebellionResults.some((record) => record.id === "canon-rebellion-concept"));

const guideFaq = await service.getGuideFaqSummary("current boss gate");
assert.ok(guideFaq.records.some((record) => record.id === "guide-faq-current-boss-gate"));
assert.ok(guideFaq.records.some((record) => record.id === "active-boss-gate"));

const publicSummary = await service.getPublicKnowledgeSummary();
assert.equal(typeof publicSummary.publicFacts[0], "string");

const adminSummary = await service.getAdminKnowledgeSummary();
assert.ok(adminSummary.pendingDecisionIds.includes("canon-rebellion-concept"));
assert.ok(adminSummary.draftCanonRecordIds.includes("canon-roleplay-premise"));

console.log("Knowledge smoke checks passed.");
