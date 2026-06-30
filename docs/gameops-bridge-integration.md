# Future GameOps Bridge Integration

## Status

GameOps Bridge integration is intentionally not implemented yet. This document defines the desired shape so the current bot architecture remains ready without becoming coupled to a future system.

## Principle

GameOps Bridge should be treated as an external event source, not as the core of the bot. The Raven should translate incoming server intelligence into domain events that services can process.

GameOps Bridge belongs only to the World Intelligence domain. It may observe live server activity, but it must not directly modify Realm Canon and must not write Chronicle records until data has been validated, deduplicated, and classified.

## Knowledge Domain Boundary

- Realm Canon is admin-authored server truth. GameOps must not alter rules, house doctrine, rebellion mechanics, protected areas, or progression policy.
- Chronicle is validated history. GameOps events may become Chronicle entries only after validation and, where needed, staff review.
- Realm State may be updated by validated GameOps signals, such as online players, current boss gate, or server status.
- Raven Mind may decide whether a GameOps-derived event should be announced, summarized, ignored, or kept private.
- World Intelligence stores raw or normalized telemetry from GameOps.

## Ideal Information From GameOps Bridge

### Player Activity

- Player joined.
- Player left.
- First-time player joined.
- Player death.
- Player location changes when appropriate.
- Player faction or house metadata if available.

### Progression

- Boss killed.
- Biome discovered.
- Key item obtained.
- Server progression flags.
- Raid events.

### World Events

- Structure built or destroyed when detectable.
- Named location discovered.
- Server restart.
- Server uptime.
- Scheduled maintenance.
- World seed metadata if permitted.

### Administration

- Ban, kick, or whitelist changes.
- Manual admin notes.
- Server setting changes.
- Backup and restore events.

## Desired API Shape

The ideal integration would provide:

- Webhook delivery for real-time events.
- Authenticated REST API for recent state.
- Event IDs for deduplication.
- Timestamps from the source system.
- Schema versioning.
- Retry-safe delivery.
- Environment-specific credentials.

## Event Flow

```text
GameOps Bridge
  -> webhook or poll adapter
  -> GameOpsBridgeService
  -> World Intelligence domain
  -> validation and deduplication
  -> Realm State update, Chronicle proposal, or NotificationService
  -> Discord output if appropriate
```

## Coupling Rules

- Keep GameOps-specific payloads inside a dedicated adapter.
- Normalize payloads into internal domain events.
- Do not let Discord commands depend on GameOps payload shapes.
- Do not assume GameOps is always available.
- Treat all incoming events as data requiring validation.
- Do not let raw GameOps input pollute Realm Canon.
- Do not promote raw GameOps input to Chronicle without validation.

## Possible Internal Event Types

- `player.joined`
- `player.left`
- `player.died`
- `boss.defeated`
- `realm.raidStarted`
- `realm.locationDiscovered`
- `admin.actionRecorded`
- `server.statusChanged`

## Output Rules

Not every live event deserves a Discord message. The Raven should apply thresholds:

- Chronicle important events.
- Announce major milestones.
- Ignore routine noise.
- Batch frequent events when possible.
- Prefer admin-configurable channels.
