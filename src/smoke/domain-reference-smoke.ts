import assert from "node:assert/strict";
import { KnowledgeIntegrityValidator } from "../services/knowledge/knowledgeIntegrityValidator.js";
import { KnowledgeRepository } from "../services/knowledge/knowledgeRepository.js";

const repository = new KnowledgeRepository({
  knowledgeDir: "./src/data/knowledge"
});
const validator = new KnowledgeIntegrityValidator(repository);
const result = await validator.validateDomainReferences();

assert.equal(
  result.issues.length,
  0,
  [
    "Domain reference integrity checks failed:",
    ...result.issues.map(
      (issue) =>
        `- ${issue.sourceDomain}:${issue.sourceId} -> ${String(issue.reference)}: ${issue.message}`
    )
  ].join("\n")
);

console.log(`Domain reference smoke checks passed. Checked ${result.checkedReferenceCount} references.`);
