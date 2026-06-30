import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { ChronicleApprovalService } from "../services/chronicle/chronicleApprovalService.js";
import { ChronicleDraftService } from "../services/chronicle/chronicleDraftService.js";
import { ChronicleRecordingService } from "../services/chronicle/chronicleRecordingService.js";
import { KnowledgeRepository } from "../services/knowledge/knowledgeRepository.js";

const chronicleBefore = await readFile("./src/data/knowledge/chronicle.json", "utf8");
const repository = new KnowledgeRepository({
  knowledgeDir: "./src/data/knowledge"
});
const draftService = new ChronicleDraftService();
const approvalService = new ChronicleApprovalService();
const recordingService = new ChronicleRecordingService(repository);

const approvedPreview = approvalService.createApprovalPreview({
  draft: draftService.createDraft({
    event: "House Stark defeated Eikthyr and became the first house to draw blood.",
    type: "boss_kill",
    house: "House Stark",
    players: "Kriatiri, Chris"
  }),
  recordedByUserId: "admin-user",
  approvedByUserId: "king-user",
  occurredAt: "2026-06-28T00:00:00.000Z",
  tags: ["boss", "stark"]
});
const writePreview = await recordingService.createWritePreview({
  approvedPreview,
  requestedByUserId: "admin-user"
});
assert.equal(writePreview.marker, "WRITE PREVIEW — no Chronicle write performed");
assert.equal(writePreview.readyToWrite, true);
assert.ok(writePreview.wouldBeRecord);
assert.match(writePreview.wouldBeRecord.id, /^chronicle-boss_kill-/);
assert.equal(writePreview.safety.auditMetadata.recordedByUserId, "admin-user");
assert.equal(writePreview.safety.auditMetadata.approvedByUserId, "king-user");
assert.equal(writePreview.safety.auditMetadata.writeRequestedByUserId, "admin-user");

const duplicatePreview = await recordingService.createWritePreview({
  record: {
    id: "preview-server-event-founding",
    type: "server_event",
    title: "Founding Chronicle Placeholder",
    factualSummary: "The first verified founding event of the realm will be recorded here.",
    loreSummary: "Let it be written for the ravens: The first verified founding event of the realm will be recorded here.",
    players: [],
    occurredAt: null,
    recordedAt: "PREVIEW_NOT_RECORDED",
    recordedByUserId: "admin-user",
    source: "manual_admin",
    tags: ["founding"],
    status: "pending_review"
  },
  requestedByUserId: "admin-user"
});
assert.equal(duplicatePreview.readyToWrite, false);
assert.ok(duplicatePreview.safety.duplicateCandidates.some((candidate) => candidate.id === "chronicle-placeholder-founding"));

const missingFieldsPreview = await recordingService.createWritePreview({
  record: {
    id: "preview-missing",
    type: "battle",
    title: "",
    factualSummary: "",
    loreSummary: "",
    players: [],
    occurredAt: null,
    recordedAt: "PREVIEW_NOT_RECORDED",
    recordedByUserId: "",
    source: "manual_admin",
    tags: [],
    status: "pending_review"
  },
  requestedByUserId: ""
});
assert.equal(missingFieldsPreview.readyToWrite, false);
assert.ok(missingFieldsPreview.safety.missingFields.includes("title"));
assert.ok(missingFieldsPreview.safety.missingFields.includes("factualSummary"));
assert.ok(missingFieldsPreview.safety.missingFields.includes("recordedByUserId"));
assert.ok(missingFieldsPreview.safety.missingFields.includes("requestedByUserId"));

const chronicleAfter = await readFile("./src/data/knowledge/chronicle.json", "utf8");
assert.equal(chronicleAfter, chronicleBefore);

console.log("Chronicle recording smoke checks passed.");
