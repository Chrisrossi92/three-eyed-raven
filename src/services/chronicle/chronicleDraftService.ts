import type { ChronicleDraft, ChronicleDraftRequest, ChronicleDraftType } from "./chronicleTypes.js";

export class ChronicleDraftService {
  createDraft(request: ChronicleDraftRequest): ChronicleDraft {
    const event = request.event.trim();
    const type = normalizeDraftType(request.type);
    const house = request.house?.trim();
    const players = parsePlayers(request.players);
    const mode = request.mode ?? "plain";
    const draft: Omit<ChronicleDraft, "text"> = {
      marker: "DRAFT — not yet recorded",
      event,
      type,
      ...(house ? { house } : {}),
      players,
      mode
    };

    return {
      ...draft,
      text: formatDraftText(draft)
    };
  }
}

function normalizeDraftType(type?: string | null): ChronicleDraftType {
  const normalizedType = type?.trim().toLowerCase().replace(/[\s-]+/g, "_");

  switch (normalizedType) {
    case "boss_kill":
    case "alliance":
    case "betrayal":
    case "battle":
    case "ruling":
    case "ceremony":
    case "major_build":
    case "server_event":
      return normalizedType;
    default:
      return "unknown";
  }
}

function parsePlayers(players?: string | null): string[] {
  if (!players) {
    return [];
  }

  return players
    .split(",")
    .map((player) => player.trim())
    .filter((player) => player.length > 0);
}

function formatDraftText(draft: Omit<ChronicleDraft, "text">): string {
  const details = [
    `Type: ${draft.type}`,
    ...(draft.house ? [`House: ${draft.house}`] : []),
    ...(draft.players.length > 0 ? [`Players: ${draft.players.join(", ")}`] : [])
  ];
  const body = formatBody(draft);

  return [`${draft.marker}`, ...details, "", body].join("\n");
}

function formatBody(draft: Omit<ChronicleDraft, "text">): string {
  switch (draft.mode) {
    case "plain":
      return `Chronicle draft: ${draft.event}`;
    case "lore":
      return `Let it be drafted for the ravens: ${draft.event}`;
    case "snark":
      return `Chronicle draft: ${draft.event} Even a maester would wait before carving this into stone.`;
  }
}
