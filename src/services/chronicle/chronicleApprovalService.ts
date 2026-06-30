import type {
  ChronicleApprovalMetadata,
  ChronicleApprovalPreview,
  ChronicleDraft,
  ChronicleEventType,
  ChroniclePermanentRecord
} from "./chronicleTypes.js";

export type ChronicleApprovalPreviewRequest = {
  draft: Pick<ChronicleDraft, "event" | "type" | "house" | "players">;
  recordedByUserId: string;
  approvedByUserId?: string;
  title?: string;
  occurredAt?: string | null;
  tags?: string[];
};

export class ChronicleApprovalService {
  createApprovalPreview(request: ChronicleApprovalPreviewRequest): ChronicleApprovalPreview {
    const missingFields = missingRequiredFields(request);
    const approval: ChronicleApprovalMetadata = {
      recordedByUserId: request.recordedByUserId,
      ...(request.approvedByUserId ? { approvedByUserId: request.approvedByUserId } : {})
    };

    if (missingFields.length > 0) {
      return {
        marker: "APPROVAL PREVIEW — no Chronicle write performed",
        ready: false,
        missingFields,
        approval
      };
    }

    const type = request.draft.type as ChronicleEventType;
    const factualSummary = request.draft.event.trim();
    const permanentRecord: ChroniclePermanentRecord = {
      id: proposedRecordId(type, factualSummary),
      type,
      title: request.title?.trim() || proposedTitle(type, factualSummary),
      factualSummary,
      loreSummary: proposedLoreSummary(factualSummary),
      ...(request.draft.house ? { house: request.draft.house } : {}),
      players: request.draft.players,
      occurredAt: request.occurredAt ?? null,
      recordedAt: "PREVIEW_NOT_RECORDED",
      recordedByUserId: request.recordedByUserId,
      ...(request.approvedByUserId ? { approvedByUserId: request.approvedByUserId } : {}),
      source: "discord_draft",
      tags: request.tags ?? [],
      status: "pending_review"
    };

    return {
      marker: "APPROVAL PREVIEW — no Chronicle write performed",
      ready: true,
      missingFields: [],
      permanentRecord,
      approval
    };
  }
}

function missingRequiredFields(request: ChronicleApprovalPreviewRequest): string[] {
  const missingFields: string[] = [];

  if (!request.draft.event.trim()) {
    missingFields.push("event");
  }

  if (request.draft.type === "unknown") {
    missingFields.push("type");
  }

  if (!request.recordedByUserId.trim()) {
    missingFields.push("recordedByUserId");
  }

  return missingFields;
}

function proposedRecordId(type: ChronicleEventType, factualSummary: string): string {
  return `preview-${type}-${normalizeId(factualSummary).slice(0, 60)}`;
}

function proposedTitle(type: ChronicleEventType, factualSummary: string): string {
  const humanType = type.replace(/_/g, " ");
  const firstSentence = factualSummary.split(/[.!?]/)[0]?.trim() || factualSummary;
  return `${titleCase(humanType)}: ${firstSentence}`;
}

function proposedLoreSummary(factualSummary: string): string {
  return `Let it be written for the ravens: ${factualSummary}`;
}

function normalizeId(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function titleCase(value: string): string {
  return value.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}
