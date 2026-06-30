import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { ChronicleApprovalService } from "../services/chronicle/chronicleApprovalService.js";
import { ChronicleDraftService } from "../services/chronicle/chronicleDraftService.js";

const chronicleBefore = await readFile("./src/data/knowledge/chronicle.json", "utf8");
const draftService = new ChronicleDraftService();
const approvalService = new ChronicleApprovalService();

const completeDraft = draftService.createDraft({
  event: "House Stark defeated Eikthyr and became the first house to draw blood.",
  type: "boss_kill",
  house: "House Stark",
  players: "Kriatiri, Chris",
  mode: "lore"
});
const readyPreview = approvalService.createApprovalPreview({
  draft: completeDraft,
  recordedByUserId: "admin-user",
  approvedByUserId: "king-user",
  occurredAt: "2026-06-28T00:00:00.000Z",
  tags: ["boss", "stark"]
});
assert.equal(readyPreview.ready, true);
assert.equal(readyPreview.marker, "APPROVAL PREVIEW — no Chronicle write performed");
assert.deepEqual(readyPreview.missingFields, []);
assert.ok(readyPreview.permanentRecord);
assert.equal(readyPreview.permanentRecord.type, "boss_kill");
assert.match(readyPreview.permanentRecord.factualSummary, /House Stark defeated Eikthyr/);
assert.match(readyPreview.permanentRecord.loreSummary, /Let it be written for the ravens/);
assert.notEqual(readyPreview.permanentRecord.factualSummary, readyPreview.permanentRecord.loreSummary);

const missingEventPreview = approvalService.createApprovalPreview({
  draft: draftService.createDraft({
    event: "",
    type: "battle"
  }),
  recordedByUserId: "admin-user"
});
assert.equal(missingEventPreview.ready, false);
assert.ok(missingEventPreview.missingFields.includes("event"));
assert.equal(missingEventPreview.permanentRecord, undefined);

const missingTypePreview = approvalService.createApprovalPreview({
  draft: draftService.createDraft({
    event: "The King issued a ruling.",
    type: ""
  }),
  recordedByUserId: "admin-user"
});
assert.equal(missingTypePreview.ready, false);
assert.ok(missingTypePreview.missingFields.includes("type"));
assert.equal(missingTypePreview.permanentRecord, undefined);

const chronicleAfter = await readFile("./src/data/knowledge/chronicle.json", "utf8");
assert.equal(chronicleAfter, chronicleBefore);

console.log("Chronicle approval smoke checks passed.");
