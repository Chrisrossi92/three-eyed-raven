import type { RavenResponseMode } from "../raven/responseTypes.js";

export type ChronicleDraftType =
  | "boss_kill"
  | "alliance"
  | "betrayal"
  | "battle"
  | "ruling"
  | "ceremony"
  | "major_build"
  | "server_event"
  | "unknown";

export type ChronicleEventType = Exclude<ChronicleDraftType, "unknown">;

export type ChronicleRecordStatus = "draft" | "pending_review" | "approved" | "recorded" | "rejected" | "corrected";

export type ChronicleRecordSource = "manual_admin" | "discord_draft" | "gameops_validated";

export type ChronicleApprovalMetadata = {
  recordedByUserId: string;
  approvedByUserId?: string;
  reviewedAt?: string;
  notes?: string;
};

export type ChronicleDraftRequest = {
  event: string;
  type?: string | null;
  house?: string | null;
  players?: string | null;
  mode?: RavenResponseMode;
};

export type ChronicleDraft = {
  marker: "DRAFT — not yet recorded";
  event: string;
  type: ChronicleDraftType;
  house?: string;
  players: string[];
  mode: RavenResponseMode;
  text: string;
};

export type ChroniclePermanentRecord = {
  id: string;
  type: ChronicleEventType;
  title: string;
  factualSummary: string;
  loreSummary: string;
  house?: string;
  players: string[];
  occurredAt: string | null;
  recordedAt: string;
  recordedByUserId: string;
  approvedByUserId?: string;
  source: ChronicleRecordSource;
  tags: string[];
  status: ChronicleRecordStatus;
};

export type ChronicleApprovalPreview = {
  marker: "APPROVAL PREVIEW — no Chronicle write performed";
  ready: boolean;
  missingFields: string[];
  permanentRecord?: ChroniclePermanentRecord;
  approval: ChronicleApprovalMetadata;
};

export type ChronicleRecordWriteRequest = {
  approvedPreview?: ChronicleApprovalPreview;
  record?: ChroniclePermanentRecord;
  requestedByUserId: string;
};

export type ChronicleDuplicateCandidate = {
  id: string;
  title: string;
  reason: "same_type_similar_title" | "same_type_house_occurred_at" | "same_factual_summary" | "matching_tags";
  confidence: "low" | "medium" | "high";
};

export type ChronicleWriteSafetyResult = {
  readyToWrite: boolean;
  missingFields: string[];
  duplicateCandidates: ChronicleDuplicateCandidate[];
  auditMetadata: ChronicleApprovalMetadata & {
    writeRequestedByUserId: string;
    writePreviewedAt: string;
  };
};

export type ChronicleRecordWritePreview = {
  marker: "WRITE PREVIEW — no Chronicle write performed";
  readyToWrite: boolean;
  wouldBeRecord?: ChroniclePermanentRecord;
  safety: ChronicleWriteSafetyResult;
};
