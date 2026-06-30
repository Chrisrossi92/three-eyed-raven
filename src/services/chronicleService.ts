import {
  loadChronicle,
  loadSubmissions,
  saveChronicle,
  saveSubmissions
} from "../data/ravenStore.js";
import type { ChronicleEntry, ChronicleSource } from "../data/ravenTypes.js";

export interface RecordChronicleEntryInput {
  id?: string;
  date?: string;
  type?: string;
  summary: string;
  involvedHouses?: string[];
  involvedPlayers?: string[];
  approvedBy?: string;
  source?: ChronicleSource;
}

export interface ApproveChronicleSubmissionInput {
  submissionId: string;
  approvedBy: string;
  type?: string;
  summary?: string;
}

export async function listChronicleEntries(): Promise<ChronicleEntry[]> {
  return loadChronicle();
}

export async function recordChronicleEntry(
  input: RecordChronicleEntryInput
): Promise<ChronicleEntry> {
  const summary = input.summary.trim();
  if (summary.length === 0) {
    throw new Error("Chronicle summary is required.");
  }

  const date = input.date ?? new Date().toISOString();
  const type = input.type ?? "manual";
  const entry: ChronicleEntry = {
    id: input.id ?? createChronicleId(type, summary, date),
    date,
    type,
    summary,
    involvedHouses: input.involvedHouses ?? [],
    involvedPlayers: input.involvedPlayers ?? [],
    approvedBy: input.approvedBy ?? "system",
    source: input.source ?? "admin"
  };

  const chronicle = await loadChronicle();
  const existingIndex = chronicle.findIndex((item) => item.id === entry.id);
  if (existingIndex >= 0) {
    chronicle[existingIndex] = entry;
  } else {
    chronicle.push(entry);
  }

  await saveChronicle(chronicle);
  return entry;
}

export async function approveChronicleSubmission(
  input: ApproveChronicleSubmissionInput
): Promise<ChronicleEntry> {
  const submissions = await loadSubmissions();
  const submission = submissions.find((item) => item.id === input.submissionId);

  if (!submission || submission.status !== "pending") {
    throw new Error(`Unknown pending Chronicle submission: ${input.submissionId}`);
  }

  const summary = input.summary?.trim() || submission.summary.trim();
  if (summary.length === 0) {
    throw new Error("Chronicle summary is required.");
  }

  const entry = await recordChronicleEntry({
    type: input.type ?? "story",
    summary,
    involvedHouses: submission.involvedHouses,
    involvedPlayers: submission.involvedPlayers,
    approvedBy: input.approvedBy,
    source: "story"
  });

  await saveSubmissions(submissions.filter((item) => item.id !== input.submissionId));
  return entry;
}

function createChronicleId(type: string, summary: string, date: string): string {
  return `${slugify(type)}-${slugify(summary).slice(0, 48)}-${compactTimestamp(date)}`;
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "entry";
}

function compactTimestamp(value: string): string {
  return value.replace(/[^0-9a-z]/gi, "").toLowerCase();
}
