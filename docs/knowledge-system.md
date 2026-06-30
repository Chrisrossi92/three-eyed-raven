# Knowledge System

## Purpose

The knowledge system defines how the Raven knows, remembers, and responds. It is the permanent foundation for server truth, history, current status, personality rules, and future live telemetry.

Knowledge is not one bucket. The Raven must distinguish permanent truth from historical memory, current state, response behavior, and live world intelligence. Each domain has different ownership, mutability, and validation needs.

## The Five Knowledge Domains

### 1. Realm Canon

Permanent server truth:

- Server premise.
- Roles.
- Rules.
- Houses.
- Boss progression.
- Rebellion mechanics.
- Protected areas.
- Roleplay expectations.

Realm Canon is the highest-trust source for answering policy and onboarding questions. It should change only when the King or staff intentionally update server doctrine.

Curated public FAQ entries also live in Realm Canon as `guide_faq` records. They make `/raven ask` reliable for common launch questions while preserving the five-domain architecture. FAQ records should remain public-safe, cite uncertainty with `draft` or `needs_decision`, and may reference Realm State for current public facts.

FAQ aliases must be unique after normalization so deterministic matching stays predictable. Related commands should reference known public Raven commands only. Run `npm run smoke:faq` before adding or changing guide FAQ records.

Linked knowledge uses `domain:id` references with the actual domain names defined by the project, such as `realm-canon:canon-server-premise` or `realm-state:active-boss-gate`. References must point to real addressable records. Run `npm run smoke:references` before adding or editing linked knowledge.

### 2. Chronicle

Historical memory:

- Boss kills.
- Alliances.
- Betrayals.
- Battles.
- Throne changes.
- Rulings.
- Ceremonies.
- Major builds.
- Server-wide events.

The Chronicle records what happened. It should not silently rewrite history. Corrections should be explicit and attributable.

### 3. Realm State

Current living status:

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

Realm State answers "what is true right now." It may be derived from Canon, Chronicle, administrator updates, and eventually validated telemetry.

### 4. Raven Mind

Personality and response logic:

- Plain guide mode.
- Lore mode.
- Snark mode.
- Silence rules.
- Keyword triggers.
- Response boundaries.
- When to answer publicly vs privately.

Raven Mind governs how the bot speaks and when it should remain silent. It must never invent Canon or Chronicle facts.

### 5. World Intelligence

Future live telemetry:

- Online players.
- Joins and leaves.
- Last seen.
- Session lengths.
- Activity by house.
- Server uptime.
- Deaths if available.
- Boss events if available.
- GameOps Bridge API input.

World Intelligence is live or near-live observation. It is useful but not automatically canonical. Important telemetry must be validated before it becomes Chronicle, and it must never overwrite Realm Canon.

## How Domains Interact

The Raven should answer from the most appropriate domain:

- Policy questions use Realm Canon.
- "What happened?" questions use Chronicle.
- "Who is king now?" questions use Realm State.
- Tone and delivery use Raven Mind.
- Live activity questions use World Intelligence.

When a response needs multiple domains, the Raven should keep their roles separate. For example, a boss kill from World Intelligence may update Realm State after validation and later become a Chronicle entry, but it does not change the boss progression rules in Realm Canon.

## Initial Storage

Start with readable JSON files committed under `src/data/knowledge/`. Keep docs as the human-readable source of truth and JSON as machine-readable starter content.

Initial files:

```text
src/data/knowledge/
  realm-canon.json
  chronicle.json
  realm-state.json
  raven-mind.json
  world-intelligence.json
```

## Access Pattern

Commands and events should not read knowledge files directly. They should call a knowledge service or repository in `src/services/knowledge/`, which loads and validates domain files through a clean interface.

The current read-only service is `KnowledgeService`. It provides deterministic helpers for:

- Loading a full domain.
- Retrieving a record by ID.
- Finding records by tag.
- Searching records across domains.
- Resolving curated public guide FAQ matches before broad search.
- Validating guide FAQ quality through `smoke:faq`.
- Validating `domain:id` reference integrity through `smoke:references`.
- Producing public and admin knowledge summaries.
- Producing public onboarding summaries for new players.
- Producing public progression summaries for boss gates, rebellion, throne challenge concepts, onboarding focus, and current gate status.
- Producing public role summaries for King, Hand of the King, Kingsguard, house leader, and house member roles.
- Producing public rules summaries for protected areas, roleplay expectations, rebellion caveats, PvP/raiding placeholders, and launch-status caveats.

This layer has no Discord dependency and no AI integration.

## Seeded v1 Canon

Realm Canon now includes starter records for the Thrones-inspired Valheim premise, launch concept, King, Hand of the King, Kingsguard, house leader, house member, Stark, Lannister, Baratheon, boss progression, rebellion, throne challenges, protected areas, PvP/raiding placeholders, launch-status rules, onboarding, roleplay expectations, and curated public guide FAQ answers.

Known facts are marked as active where appropriate. Uncertain rules and launch details are marked as `draft` or `needs_decision`.

## Answering Rules

- Prefer accurate short answers.
- Include lore flavor only when it does not reduce clarity.
- Cite uncertainty.
- Avoid making up server policy.
- Use admin-authored source content when available.
- Do not promote World Intelligence into Chronicle without validation.
- Do not let Raven Mind override facts from Canon, Chronicle, or Realm State.

## Future Enhancements

- Search indexes.
- Embeddings.
- Admin-editable knowledge.
- Versioned policy records.
- Knowledge review workflow.
- Validation workflow for World Intelligence events.
