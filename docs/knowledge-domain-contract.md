# Knowledge Domain Contract

## Purpose

This contract defines the permanent boundaries for how the Raven knows, remembers, and responds. The five domains are Realm Canon, Chronicle, Realm State, Raven Mind, and World Intelligence.

## Domain Summary

| Domain | Purpose | Owner | Mutability | Persistence |
| --- | --- | --- | --- | --- |
| Realm Canon | Permanent server truth | King and staff | Low | Versioned JSON, later admin-reviewed store |
| Chronicle | Historical memory | Chronicler role, staff, validated events | Append-first | JSON timeline, later database or event store |
| Realm State | Current living status | Staff, validated systems | Medium | JSON snapshot, later state tables |
| Raven Mind | Personality and response logic | Bot maintainers and staff | Low to medium | JSON config plus TypeScript behavior |
| World Intelligence | Future live telemetry | GameOps adapter and validators | High | JSON snapshot/event buffer, later telemetry store |

## 1. Realm Canon

### Purpose

Realm Canon stores the server's durable truth:

- Server premise.
- Roles.
- Rules.
- Houses.
- Boss progression.
- Rebellion mechanics.
- Protected areas.
- Roleplay expectations.
- Curated public guide FAQ answers for common launch questions.

### Ownership

The King and trusted staff own Canon. Bot maintainers may structure it, but should not invent policy.

### Mutability

Low. Canon changes represent policy changes and should be deliberate.

### Persistence Strategy

Start with `src/data/knowledge/realm-canon.json`. Later, Canon may move to versioned admin-managed storage with review and audit history.

Guide FAQ records remain in this file as `guide_faq` Canon records rather than a sixth domain. This preserves the five-domain contract and keeps public launch guidance under staff-owned Canon.

Cross-domain links use the `domain:id` reference format. The domain must be one of the actual project domain names, such as `realm-canon`, `realm-state`, `raven-mind`, `chronicle`, or `world-intelligence`; the ID must point to an addressable record in that domain.

### Example Record

```json
{
  "id": "rule-protected-areas",
  "title": "Protected Areas",
  "summary": "Spawn, public infrastructure, and staff-marked areas are protected from raids and theft.",
  "status": "draft",
  "tags": ["rules", "protected-areas"]
}
```

### Validation Expectations

- Required stable IDs.
- Human-readable titles and summaries.
- Status must distinguish draft from active policy.
- FAQ aliases, related commands, and domain references must stay public-safe.
- Domain references must use `domain:id`, must not be duplicated inside one record, and must pass `npm run smoke:references`.
- Uncertain FAQ answers must use `draft` or `needs_decision`.
- Canon updates should be reviewed before becoming authoritative.

## 2. Chronicle

### Purpose

Chronicle stores validated history:

- Boss kills.
- Alliances.
- Betrayals.
- Battles.
- Throne changes.
- Rulings.
- Ceremonies.
- Major builds.
- Server-wide events.

### Ownership

Staff, designated chroniclers, and validated event pipelines.

### Mutability

Append-first. Corrections should be explicit and preserve accountability.

### Persistence Strategy

Start with `src/data/knowledge/chronicle.json`. Later, move to an event store or database when search, corrections, and volume require it.

### Example Record

```json
{
  "id": "event-first-eikthyr",
  "category": "boss-kill",
  "title": "First Eikthyr Kill",
  "summary": "The realm's first Eikthyr kill will be recorded here.",
  "occurredAt": null,
  "status": "placeholder",
  "sources": ["staff"]
}
```

### Validation Expectations

- Historical claims need a source.
- Telemetry-derived events require deduplication.
- Corrections should reference the original entry.

## 3. Realm State

### Purpose

Realm State stores what is currently true:

- Current king.
- Hand of the King.
- Kingsguard.
- Active houses.
- House leaders.
- House members.
- Current alliances.
- Current wars.
- Active boss gate.
- Current server season or event state.

### Ownership

Staff and validated system updates.

### Mutability

Medium. State changes as the realm changes, but important changes may also create Chronicle entries.

### Persistence Strategy

Start with `src/data/knowledge/realm-state.json` as a snapshot. Later, state may be computed from Chronicle plus direct staff overrides.

### Example Record

```json
{
  "currentKing": {
    "name": "Unclaimed",
    "since": null
  },
  "activeBossGate": {
    "boss": "Eikthyr",
    "status": "not-started"
  }
}
```

### Validation Expectations

- Current leaders and house rosters need staff confirmation.
- State derived from GameOps must include source and update time.
- State changes with historical significance should create Chronicle proposals.

## 4. Raven Mind

### Purpose

Raven Mind stores how the bot should speak and when it should remain silent:

- Plain guide mode.
- Lore mode.
- Snark mode.
- Silence rules.
- Keyword triggers.
- Response boundaries.
- Public vs private response behavior.

### Ownership

Bot maintainers and staff.

### Mutability

Low to medium. Tone may evolve, but the Raven should remain restrained and useful.

### Persistence Strategy

Start with `src/data/knowledge/raven-mind.json` for editable response policy, backed by TypeScript behavior in `src/personality/`.

### Example Record

```json
{
  "modes": [
    {
      "name": "plain-guide",
      "purpose": "Clear answers for rules, onboarding, and administration.",
      "maxSentences": 4
    }
  ],
  "silenceRules": [
    "Remain silent when a keyword match is weak."
  ]
}
```

### Validation Expectations

- Response modes must have clear boundaries.
- Snark mode must never target players harshly.
- Personality must not override factual domain data.

## 5. World Intelligence

### Purpose

World Intelligence stores future live telemetry:

- Online players.
- Joins and leaves.
- Last seen.
- Session lengths.
- Activity by house.
- Server uptime.
- Deaths if available.
- Boss events if available.
- GameOps Bridge API input.

### Ownership

GameOps adapters, validation services, and staff review for promoted events.

### Mutability

High. Telemetry is live, noisy, and subject to correction.

### Persistence Strategy

Start with `src/data/knowledge/world-intelligence.json` as an empty snapshot and event buffer. Later, move to a telemetry store if GameOps data becomes frequent.

### Example Record

```json
{
  "serverStatus": {
    "state": "unknown",
    "updatedAt": null
  },
  "recentEvents": []
}
```

### Validation Expectations

- Raw GameOps payloads must be validated before use.
- Duplicate events must be detected.
- Important events require classification before entering Chronicle.
- Telemetry must not change Realm Canon.

## Internal Citation and Response Use

The Raven does not need to show formal citations to users by default, but internally responses should know which domain supplied the answer:

- Use Realm Canon for rules, setup, progression, rebellion mechanics, and roleplay expectations.
- Use Chronicle for historical recaps and "what happened" questions.
- Use Realm State for current leadership, active conflicts, house rosters, boss gates, and season state.
- Use Raven Mind to choose tone, length, silence, and public/private handling.
- Use World Intelligence for live status only when the data is fresh and trustworthy.

If domains disagree, prefer this order:

1. Realm Canon for policy.
2. Staff-confirmed Realm State for current status.
3. Validated Chronicle for history.
4. Fresh World Intelligence for live status.
5. Raven Mind only for presentation, never for facts.

When information is unknown, the Raven should say it does not yet hold that memory instead of inventing an answer.
