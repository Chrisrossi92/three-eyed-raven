import type { ChronicleEvent } from "../knowledge/knowledgeDomains.js";
import { KnowledgeRepository } from "../knowledge/knowledgeRepository.js";
import type {
  ChronicleDuplicateCandidate,
  ChroniclePermanentRecord,
  ChronicleRecordWritePreview,
  ChronicleRecordWriteRequest
} from "./chronicleTypes.js";

export class ChronicleRecordingService {
  constructor(private readonly repository: KnowledgeRepository) {}

  async createWritePreview(request: ChronicleRecordWriteRequest): Promise<ChronicleRecordWritePreview> {
    const record = request.record ?? request.approvedPreview?.permanentRecord;
    const missingFields = missingRequiredFields(record, request);
    const chronicle = await this.repository.readDomain("chronicle");
    const wouldBeRecord = record ? prepareWouldBeRecord(record) : undefined;
    const duplicateCandidates = wouldBeRecord ? duplicateCandidatesFor(wouldBeRecord, chronicle.events) : [];
    const readyToWrite = Boolean(wouldBeRecord) && missingFields.length === 0 && duplicateCandidates.length === 0;

    return {
      marker: "WRITE PREVIEW — no Chronicle write performed",
      readyToWrite,
      ...(wouldBeRecord ? { wouldBeRecord } : {}),
      safety: {
        readyToWrite,
        missingFields,
        duplicateCandidates,
        auditMetadata: {
          recordedByUserId: record?.recordedByUserId ?? "",
          ...(record?.approvedByUserId ? { approvedByUserId: record.approvedByUserId } : {}),
          writeRequestedByUserId: request.requestedByUserId,
          writePreviewedAt: "PREVIEW_NOT_RECORDED"
        }
      }
    };
  }
}

function prepareWouldBeRecord(record: ChroniclePermanentRecord): ChroniclePermanentRecord {
  return {
    ...record,
    id: stableRecordId(record),
    recordedAt: "PREVIEW_NOT_RECORDED",
    status: "approved"
  };
}

function missingRequiredFields(
  record: ChroniclePermanentRecord | undefined,
  request: ChronicleRecordWriteRequest
): string[] {
  const missingFields: string[] = [];

  if (!record) {
    missingFields.push("record");
    return missingFields;
  }

  if (!record.type) {
    missingFields.push("type");
  }

  if (!record.title.trim()) {
    missingFields.push("title");
  }

  if (!record.factualSummary.trim()) {
    missingFields.push("factualSummary");
  }

  if (!record.loreSummary.trim()) {
    missingFields.push("loreSummary");
  }

  if (!record.recordedByUserId.trim()) {
    missingFields.push("recordedByUserId");
  }

  if (!request.requestedByUserId.trim()) {
    missingFields.push("requestedByUserId");
  }

  return missingFields;
}

function duplicateCandidatesFor(record: ChroniclePermanentRecord, events: ChronicleEvent[]): ChronicleDuplicateCandidate[] {
  const candidates: ChronicleDuplicateCandidate[] = [];
  const normalizedTitle = normalizeText(record.title);
  const normalizedSummary = normalizeText(record.factualSummary);
  const normalizedType = chronicleCategoryFromType(record.type);
  const normalizedHouse = normalizeText(record.house ?? "");
  const normalizedTags = new Set(record.tags.map(normalizeText));

  for (const event of events) {
    const eventType = event.category;
    const eventTitle = normalizeText(event.title);
    const eventSummary = normalizeText(event.summary);
    const eventTags = event.tags.map(normalizeText);

    if (eventType === normalizedType && isSimilarText(eventTitle, normalizedTitle)) {
      candidates.push(candidateFromEvent(event, "same_type_similar_title", "medium"));
    }

    if (
      eventType === normalizedType &&
      record.occurredAt &&
      event.occurredAt === record.occurredAt &&
      normalizedHouse &&
      event.houses.map(normalizeText).includes(normalizedHouse)
    ) {
      candidates.push(candidateFromEvent(event, "same_type_house_occurred_at", "high"));
    }

    if (eventSummary && normalizedSummary && eventSummary === normalizedSummary) {
      candidates.push(candidateFromEvent(event, "same_factual_summary", "high"));
    }

    if (eventTags.some((tag) => normalizedTags.has(tag))) {
      candidates.push(candidateFromEvent(event, "matching_tags", "low"));
    }
  }

  return uniqueCandidates(candidates);
}

function candidateFromEvent(
  event: ChronicleEvent,
  reason: ChronicleDuplicateCandidate["reason"],
  confidence: ChronicleDuplicateCandidate["confidence"]
): ChronicleDuplicateCandidate {
  return {
    id: event.id,
    title: event.title,
    reason,
    confidence
  };
}

function uniqueCandidates(candidates: ChronicleDuplicateCandidate[]): ChronicleDuplicateCandidate[] {
  const seen = new Set<string>();
  const unique: ChronicleDuplicateCandidate[] = [];

  for (const candidate of candidates) {
    const key = `${candidate.id}:${candidate.reason}`;

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(candidate);
    }
  }

  return unique;
}

function stableRecordId(record: ChroniclePermanentRecord): string {
  const occurredPart = record.occurredAt ? normalizeText(record.occurredAt).replace(/[^a-z0-9]+/g, "-") : "undated";
  return `chronicle-${record.type}-${occurredPart}-${normalizeId(record.title).slice(0, 48)}`;
}

function chronicleCategoryFromType(type: ChroniclePermanentRecord["type"]): ChronicleEvent["category"] {
  switch (type) {
    case "boss_kill":
      return "boss-kill";
    case "major_build":
      return "major-build";
    case "server_event":
      return "server-wide-event";
    default:
      return type;
  }
}

function isSimilarText(left: string, right: string): boolean {
  if (!left || !right) {
    return false;
  }

  return left.includes(right) || right.includes(left);
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function normalizeId(value: string): string {
  return normalizeText(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
