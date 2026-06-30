# Memory System

## Purpose

The memory system records what has happened in the realm. It should support history, accountability, storytelling, and summaries.

## Memory Categories

- Server history.
- House information.
- Player records.
- Achievements.
- Important events.
- King history.
- Wars.
- Alliances.
- Betrayals.
- Boss progression.
- Roleplay milestones.
- Administrative decisions.

## Memory Entry Shape

Each memory should eventually include:

- Stable ID.
- Timestamp.
- Category.
- Title.
- Summary.
- Actors.
- Related houses.
- Related locations.
- Source.
- Confidence.
- Visibility.
- Tags.

## Source Types

- Manual admin entry.
- Discord command.
- Discord event.
- Scheduled import.
- GameOps Bridge event.
- Future moderation tool.

## Chronicle Drafting

`/raven chronicle draft` is the first Chronicle workflow. It is admin-only, prefers the Small Council Chamber when configured, and replies ephemerally.

The draft command turns a plain-language event into structured draft text with a clear `DRAFT — not yet recorded` marker. It may include event type, house, players, and Raven response mode.

This workflow does not write to `chronicle.json`. Permanent Chronicle recording, review, correction, and audit behavior remain deferred.

## Chronicle Review And Approval

The Chronicle approval design exists as a no-write foundation. `ChronicleApprovalService` accepts a draft-like object, validates required fields, and returns an approval preview.

The preview can be ready or not ready. Missing event description, missing event type, or missing recorder identity prevents readiness.

Approval previews keep factual event data separate from Raven lore text:

- `factualSummary` records what happened plainly.
- `loreSummary` carries the Raven voice without changing the facts.

Approval previews are marked `APPROVAL PREVIEW — no Chronicle write performed` and do not mutate `chronicle.json`.

## Chronicle Recording Safety

The permanent recording design exists as a no-write foundation. `ChronicleRecordingService` accepts an approved preview or write request, generates the would-be permanent record, proposes a stable ID, checks existing Chronicle events for duplicate candidates, and returns write safety status.

Write previews are marked `WRITE PREVIEW — no Chronicle write performed`.

The service can report:

- `readyToWrite`
- missing required fields
- duplicate candidates
- audit metadata preview
- would-be permanent record

Permanent write commands remain deferred. A future write command must pass write safety before mutating `chronicle.json`.

## Confidence

Not every memory has equal reliability. The Raven should distinguish between confirmed records, player-submitted claims, and inferred events.

## Initial Storage

Use JSON repositories at first. Keep repository interfaces narrow so storage can move to a database later.

Suggested files:

```text
data/
  memory/
    events.json
    players.json
    houses.json
    rulings.json
```

## Future Database Triggers

Move beyond JSON when:

- Concurrent writes become common.
- Search becomes slow.
- Admin edit history is needed.
- Records need relational queries.
- GameOps Bridge sends frequent live events.
