import { z } from "zod";
import { JsonRepository } from "../../data/json-repository.js";
import type { RavenDutyDocument } from "./dutyTypes.js";

const dutySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum([
    "announcements",
    "houses",
    "progression",
    "rules",
    "events",
    "chronicle",
    "recap",
    "small_council"
  ]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["active", "paused", "completed", "retired"]),
  cadence: z.string().min(1),
  audience: z.literal("admin"),
  tags: z.array(z.string())
});

const dutyDocumentSchema = z.object({
  version: z.number().int().positive(),
  description: z.string().min(1),
  duties: z.array(dutySchema)
});

export type DutyRepositoryOptions = {
  dutyFile: string;
};

export class DutyRepository {
  private readonly repository: JsonRepository<RavenDutyDocument>;

  constructor(options: DutyRepositoryOptions) {
    this.repository = new JsonRepository<RavenDutyDocument>(options.dutyFile, dutyDocumentSchema);
  }

  async readDuties(): Promise<RavenDutyDocument> {
    return this.repository.read({
      version: 1,
      description: "Read-only seeded admin duties.",
      duties: []
    });
  }
}
