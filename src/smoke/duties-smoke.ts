import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { DutyRepository } from "../services/duties/dutyRepository.js";
import { DutyService } from "../services/duties/dutyService.js";

const dutiesBefore = await readFile("./src/data/admin/duties.json", "utf8");
const service = new DutyService(
  new DutyRepository({
    dutyFile: "./src/data/admin/duties.json"
  })
);

const allDuties = await service.listAllDuties();
assert.ok(allDuties.length >= 9);
assert.ok(allDuties.every((duty) => duty.audience === "admin"));

const activeDuties = await service.listActiveDuties();
assert.ok(activeDuties.length > 0);
assert.ok(activeDuties.every((duty) => duty.status === "active"));

const houseDuties = await service.listByCategory("houses");
assert.ok(houseDuties.some((duty) => duty.id === "review-house-progress"));

const highDuties = await service.listByPriority("high");
assert.ok(highDuties.some((duty) => duty.id === "confirm-current-boss-gate"));

const summary = await service.getAdminDutiesSummary({
  category: "chronicle",
  priority: "high"
});
assert.ok(summary.duties.some((duty) => duty.id === "update-chronicle-after-major-event"));
assert.match(service.formatAdminDutiesSummary(summary), /Update Chronicle after major event/);

const dutiesAfter = await readFile("./src/data/admin/duties.json", "utf8");
assert.equal(dutiesAfter, dutiesBefore);

console.log("Duties smoke checks passed.");
