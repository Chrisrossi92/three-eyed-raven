# Chronicle Workflow

## Purpose

The Chronicle is validated realm history. It should preserve important events without letting unreviewed drafts, jokes, mistakes, or raw telemetry become permanent memory.

## Drafts

`/raven chronicle draft` creates a staff-facing draft only. A draft is useful for shaping tone, capturing event context, and preparing a future record, but it is not history.

Drafts must be clearly marked:

```text
DRAFT — not yet recorded
```

Drafts do not mutate `chronicle.json`.

## Review And Confirm Concept

The review step separates event drafting from permanent recording. A future confirm command should take a draft-like object, verify required fields, show an approval preview, and only then create a permanent Chronicle record.

`/raven chronicle preview` exposes the no-write approval preview through Discord for authorized admins. It checks whether an event has enough structure for future permanent recording and reports ready or not ready.

The current `ChronicleApprovalService` is no-write. It validates whether a draft-like event is ready and returns an approval preview marked:

```text
APPROVAL PREVIEW — no Chronicle write performed
```

The preview can include event type, title, house, players, occurred-at text, and tags. It still does not mutate `chronicle.json`.

## Why Drafts Are Separate

Drafts are separate from permanent history because:

- Staff may need to correct facts before recording.
- Lore text may embellish tone, but factual event data must remain plain.
- Sensitive or disputed events may require review.
- Permanent history needs audit metadata.
- Future GameOps input must be validated before becoming Chronicle.

## Permissions

Chronicle drafting and future confirmation are admin-only Raven workflows. They must use `DiscordPermissionService.canUseAdminRaven(...)`.

If `RAVEN_SMALL_COUNCIL_CHANNEL_ID` is configured, Chronicle review should happen in that channel or thread. The Small Council Chamber is the preferred place for private story drafting and staff review.

## Future Permanent Recording

A future permanent recording workflow should:

- Require admin permission.
- Require Small Council channel/thread when configured.
- Validate required fields.
- Show a final preview.
- Write one permanent record.
- Include audit metadata.
- Avoid duplicate records.
- Keep GameOps-derived events behind validation.

## Recording Safety Preview

`ChronicleRecordingService` is the no-write design foundation for permanent recording. It accepts an approved preview or record-like write request, reads existing Chronicle events, and returns a write preview marked:

```text
WRITE PREVIEW — no Chronicle write performed
```

The service does not mutate `chronicle.json`. It answers whether a future write appears safe.

## Permanent Recording Lifecycle

The intended lifecycle is:

1. Draft an event in the Small Council.
2. Preview whether the event is ready for approval.
3. Produce a write preview.
4. Resolve missing fields or duplicate candidates.
5. Confirm the write in a future admin-only command.
6. Record audit metadata with the permanent event.
7. Use edit/correction workflows for later changes.

Permanent recording remains deferred until write confirmation, audit behavior, and backup safety are implemented.

## ID Generation Strategy

Permanent IDs should be deterministic enough to review before writing. The current write preview proposes IDs from:

- Chronicle prefix.
- Event type.
- Occurred-at value or `undated`.
- Normalized title.

Example:

```text
chronicle-boss_kill-2026-06-28t00-00-00-000z-first-blood-at-eikthyr
```

Future write commands should check that generated IDs do not already exist before writing.

## Duplicate Detection

Duplicate detection should be deterministic and conservative. The no-write service checks:

- Same type plus similar title.
- Same type plus same house and occurred-at value.
- Same normalized factual summary.
- Matching tags as a low-confidence signal.

Duplicate candidates should block automatic readiness until staff reviews them.

## Write Safety

Write safety must pass before any future permanent recording command writes data. Safety checks include:

- Required fields are present.
- Would-be record has an ID.
- Audit metadata exists.
- Duplicate candidates are reviewed.
- The current Chronicle file can be read and parsed.

Failure should produce a clear not-ready result rather than a partial write.

## Failure Handling

Future write commands should fail closed:

- Do not write if validation fails.
- Do not write if duplicate checks fail.
- Do not write if the current Chronicle cannot be read.
- Do not write if the generated ID already exists.
- Return staff-readable error context.

## JSON Backup And Recovery

While Chronicle persistence is JSON-backed, future writes should use conservative file safety:

- Read and validate the current file first.
- Create a timestamped backup before writing.
- Write through a temporary file when possible.
- Re-read and validate after writing.
- Preserve enough audit context to recover from accidental edits.

If Chronicle volume grows or concurrent writes become plausible, move to database-backed storage before expanding write commands.

## Future Edit And Delete

Future edit/delete workflows should preserve accountability:

- Edits should retain previous values or audit entries.
- Deletes should be rare and permission-gated.
- Corrections should prefer explicit corrected records when history matters.
- Staff should be able to see who changed what and when.
- Deletes should keep a backup or tombstone unless removal is required.

## Audit Expectations

Permanent records should capture:

- `recordedAt`
- `recordedByUserId`
- `approvedByUserId`
- source
- status
- tags
- write requester
- write preview timestamp

Future storage should preserve edit history when JSON is no longer sufficient.

## Event Types

Supported event types:

- `boss_kill`
- `alliance`
- `betrayal`
- `battle`
- `ruling`
- `ceremony`
- `major_build`
- `server_event`

## Required Permanent Fields

A permanent Chronicle record should include:

- id
- type
- title
- factualSummary
- loreSummary
- occurredAt
- recordedAt
- recordedByUserId
- source
- tags
- status

Optional but expected when relevant:

- house
- players
- approvedByUserId

## Factual Data Vs Lore Text

Factual event data should be plain, reviewable, and specific. It answers what happened.

Lore text may carry the Raven voice. It should make the event feel part of the realm without changing the facts.

Example:

- factualSummary: `House Stark defeated Eikthyr.`
- loreSummary: `Let it be written for the ravens: House Stark defeated Eikthyr.`
