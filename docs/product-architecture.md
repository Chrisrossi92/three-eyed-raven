# Product Architecture

## Architectural Priority

Architecture comes before breadth. The project should grow by adding well-contained services, commands, events, and knowledge modules rather than by placing behavior directly inside Discord handlers.

## High-Level Layers

```text
Discord Gateway
  -> events/
  -> commands/
  -> services/
  -> data/
  -> personality/
```

## Source Layout

- `src/index.ts`: process entrypoint.
- `src/config/`: environment and runtime configuration.
- `src/events/`: Discord event adapters.
- `src/commands/`: slash command definitions and execution adapters.
- `src/services/`: domain behavior such as knowledge lookup, memory, announcements, reminders, and chronicle writing.
- `src/personality/`: voice, tone, message shaping, and silence rules.
- `src/data/`: JSON persistence schemas, repositories, and seed content.
- `src/utils/`: shared utilities that are not domain-specific.

## Core Rule

Discord-specific code should stay near `commands/` and `events/`. Domain behavior belongs in services so future inputs, such as GameOps Bridge events, can reuse the same logic.

## Central Product Decision: Knowledge Domains

The Raven's knowledge is divided into five permanent domains:

- `Realm Canon`: permanent server truth, such as rules, houses, boss progression, rebellion mechanics, protected areas, and roleplay expectations.
- `Chronicle`: historical memory, such as boss kills, alliances, betrayals, battles, throne changes, rulings, ceremonies, major builds, and server-wide events.
- `Realm State`: current living status, such as the King, Hand, Kingsguard, active houses, active wars, alliances, boss gate, and season state.
- `Raven Mind`: personality and response logic, including plain guide mode, lore mode, snark mode, silence rules, keyword triggers, and public/private response boundaries.
- `World Intelligence`: future live telemetry, such as online players, joins, leaves, last seen, session lengths, house activity, uptime, deaths, boss events, and GameOps Bridge input.

These domains are an architectural boundary, not just a content organization scheme. Commands, events, scheduled jobs, and future GameOps adapters should ask the knowledge layer for domain-specific data instead of mixing facts, memory, state, tone rules, and telemetry in one structure.

Curated public FAQ records live inside `Realm Canon` as `guide_faq` records instead of a sixth knowledge domain. They are staff-owned guide answers for common launch questions, not historical memory or live telemetry. They may reference Realm State when an answer needs current public facts, such as the active boss gate.

## Knowledge Flow

```text
Discord Commands / Events
  -> RavenCommandPlanner
  -> KnowledgeRepository or KnowledgeService
  -> Domain JSON files
  -> RavenResponseFormatter
  -> Discord output

GameOps Bridge
  -> World Intelligence adapter
  -> validation
  -> Realm State and Chronicle updates when appropriate
```

World Intelligence can inform the Raven, but it must not directly rewrite Realm Canon. It should become Chronicle only after validation.

## Response Shaping

The Raven's response shaping layer lives in `src/services/raven/`. It takes selected knowledge records or summary objects and returns a `RavenResponse` with:

- mode: plain, lore, or snark.
- audience: public or private admin.
- content.
- source metadata.
- fallback state.

This layer is deliberately separate from Discord commands. It enforces public/private audience boundaries before command adapters exist, which keeps sensitive draft and pending-decision material out of public responses by default.

## Command Planning

The command-planning layer lives in `src/services/raven/ravenCommandPlanner.ts`. It accepts a simple Discord-independent request:

- intent: ask, public summary, or admin summary.
- query when needed.
- response mode.
- audience.

The planner maps that request to `KnowledgeService` retrieval and `RavenResponseFormatter` output. For `ask`, it checks curated public `guide_faq` records before broad knowledge search. It does not register slash commands, send messages, check Discord permissions, or perform live bot behavior.

## Live Commands

The live Discord command surface is intentionally narrow:

- `/raven ask`: answers specific public-safe questions.
- `/raven onboarding`: gives new players a public start-here path.
- `/raven summary`: returns a public overview of known server canon and current state.
- `/raven house`: returns public-safe structured house information from Realm Canon and Realm State.
- `/raven progression`: explains public boss gates, house progression, rebellion, throne challenge concepts, onboarding focus, and current launch gate.
- `/raven roles`: explains public roleplay and server roles from Realm Canon and Realm State.
- `/raven rules`: explains public server rules, protected areas, roleplay expectations, rebellion caveats, PvP/raiding placeholders, and launch-status caveats.
- `/raven admin summary`: returns a private admin summary for authorized users.
- `/raven duties`: returns admin-only read-only duty reminders from seeded duty data.
- `/raven chronicle draft`: creates an admin-only lore-style Chronicle draft without recording it permanently.
- `/raven chronicle preview`: returns an admin-only no-write approval preview for a future Chronicle record.

All subcommands support an optional `mode` with `plain`, `lore`, or `snark`. Public subcommands always use the public audience path. `/raven house`, `/raven progression`, `/raven roles`, and `/raven rules` accept free-text values because launch content may still change. `/raven admin summary` uses `private_admin` only after permission and Small Council checks pass. `/raven duties`, `/raven chronicle draft`, and `/raven chronicle preview` use admin permission and Small Council checks, reply ephemerally, and do not mutate persisted data. `ChronicleRecordingService` can produce no-write write-safety previews, but no command writes Chronicle entries or consumes GameOps Bridge data. Scheduled duty reminders are deferred.

## Admin Permission Foundation

Admin-only Raven features must use `DiscordPermissionService` from `src/services/discord/`. Raw admin user, role, or Small Council channel checks should not be scattered through command files.

The Small Council Chamber is configured by `RAVEN_SMALL_COUNCIL_CHANNEL_ID`. It may point to a private channel or private thread. Matching that channel does not grant admin access by itself; admin access comes from configured user IDs or role IDs.

`/raven admin summary`, `/raven duties`, `/raven chronicle draft`, and `/raven chronicle preview` are permission-gated and reply ephemerally. If a Small Council channel/thread is configured, those commands must be used there. Public commands cannot reach private admin audience paths.

## Initial Runtime Flow

1. `index.ts` loads environment configuration.
2. A Discord client is created with required intents.
3. Commands and event handlers are registered.
4. Handlers delegate to services.
5. Services read or write JSON-backed repositories.
6. Responses are shaped through the personality layer before being sent.

## Boundaries

### Commands

Commands expose explicit user actions through Discord slash commands. They should validate input, call services, and return concise responses.

The current command adapter is `src/commands/raven.ts`. It parses Discord input, creates planner requests, enforces admin permission decisions for `/raven admin summary` and `/raven chronicle draft`, and replies with planned response content or draft text.

### Events

Events react to Discord activity such as readiness, messages, member joins, and interactions. They should remain thin and avoid business logic.

### Services

Services own behavior and should be testable without Discord. Future services may include:

- `KnowledgeService`
- `KnowledgeRepository`
- `RavenCommandPlanner`
- `RavenResponseFormatter`
- `DiscordPermissionService`
- `MemoryService`
- `ChronicleService`
- `AnnouncementService`
- `ReminderService`
- `HouseService`
- `ProgressionService`
- `GameOpsBridgeService`

### Data

JSON persistence is acceptable at the start. Repositories should hide file details so the project can later move to a database without changing command handlers.

### Personality

The personality layer decides how the Raven speaks, when it should be plain, when it should use lore, and when it should remain silent.

## Anti-Patterns To Avoid

- Large command files containing business logic.
- Hard-coded lore scattered across handlers.
- Direct JSON file manipulation from Discord adapters.
- GameOps-specific assumptions inside core services.
- Overly theatrical responses for routine administration.
- Mixing Canon, Chronicle, Realm State, Raven Mind, and World Intelligence into one untyped blob.
