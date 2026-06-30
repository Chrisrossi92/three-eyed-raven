export type RavenDutyStatus = "active" | "paused" | "completed" | "retired";

export type RavenDutyPriority = "low" | "medium" | "high" | "critical";

export type RavenDutyCategory =
  | "announcements"
  | "houses"
  | "progression"
  | "rules"
  | "events"
  | "chronicle"
  | "recap"
  | "small_council";

export type RavenDuty = {
  id: string;
  title: string;
  description: string;
  category: RavenDutyCategory;
  priority: RavenDutyPriority;
  status: RavenDutyStatus;
  cadence: string;
  audience: "admin";
  tags: string[];
};

export type RavenDutyDocument = {
  version: number;
  description: string;
  duties: RavenDuty[];
};

export type RavenDutiesSummary = {
  duties: RavenDuty[];
  category?: RavenDutyCategory;
  priority?: RavenDutyPriority;
  activeOnly: boolean;
};
