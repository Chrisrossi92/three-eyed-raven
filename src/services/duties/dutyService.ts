import type { RavenResponseMode } from "../raven/responseTypes.js";
import { DutyRepository } from "./dutyRepository.js";
import type { RavenDutiesSummary, RavenDuty, RavenDutyCategory, RavenDutyPriority } from "./dutyTypes.js";

export class DutyService {
  constructor(private readonly repository: DutyRepository) {}

  async listAllDuties(): Promise<RavenDuty[]> {
    return (await this.repository.readDuties()).duties;
  }

  async listActiveDuties(): Promise<RavenDuty[]> {
    return (await this.listAllDuties()).filter((duty) => duty.status === "active");
  }

  async listByCategory(category: string): Promise<RavenDuty[]> {
    const normalizedCategory = normalizeCategory(category);
    return (await this.listActiveDuties()).filter((duty) => duty.category === normalizedCategory);
  }

  async listByPriority(priority: string): Promise<RavenDuty[]> {
    const normalizedPriority = normalizePriority(priority);
    return (await this.listActiveDuties()).filter((duty) => duty.priority === normalizedPriority);
  }

  async getAdminDutiesSummary(input: {
    category?: string | null;
    priority?: string | null;
  } = {}): Promise<RavenDutiesSummary> {
    const category = input.category ? normalizeCategory(input.category) : undefined;
    const priority = input.priority ? normalizePriority(input.priority) : undefined;
    const duties = (await this.listActiveDuties()).filter(
      (duty) => (!category || duty.category === category) && (!priority || duty.priority === priority)
    );

    return {
      duties,
      ...(category ? { category } : {}),
      ...(priority ? { priority } : {}),
      activeOnly: true
    };
  }

  formatAdminDutiesSummary(summary: RavenDutiesSummary, mode: RavenResponseMode = "plain"): string {
    const filters = [
      ...(summary.category ? [`category=${summary.category}`] : []),
      ...(summary.priority ? [`priority=${summary.priority}`] : [])
    ];
    const heading = `Admin duties${filters.length > 0 ? ` (${filters.join(", ")})` : ""}`;

    if (summary.duties.length === 0) {
      return withMode(mode, `${heading}: no active duties matched.`);
    }

    const lines = summary.duties.map(
      (duty) => `- [${duty.priority}] ${duty.title} (${duty.category}, ${duty.cadence}): ${duty.description}`
    );

    return withMode(mode, [`${heading}:`, ...lines].join("\n"));
  }
}

export function normalizeCategory(category: string): RavenDutyCategory {
  const normalized = category.trim().toLowerCase().replace(/[\s-]+/g, "_");

  switch (normalized) {
    case "announcements":
    case "houses":
    case "progression":
    case "rules":
    case "events":
    case "chronicle":
    case "recap":
    case "small_council":
      return normalized;
    default:
      return "small_council";
  }
}

export function normalizePriority(priority: string): RavenDutyPriority {
  const normalized = priority.trim().toLowerCase();

  switch (normalized) {
    case "low":
    case "medium":
    case "high":
    case "critical":
      return normalized;
    default:
      return "medium";
  }
}

function withMode(mode: RavenResponseMode, content: string): string {
  switch (mode) {
    case "plain":
      return content;
    case "lore":
      return `The Raven brings the Small Council this list:\n${content}`;
    case "snark":
      return `${content}\nEven ravens prefer reminders to repeated surprises.`;
  }
}
