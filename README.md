# three-eyed-raven

The Three-Eyed Raven is a Discord bot foundation for a persistent Game of Thrones-inspired Valheim roleplay server.

It is designed to become the server's living guide, chronicler, administrator, storyteller, and assistant while remaining modular enough to later consume live intelligence from GameOps Bridge.

## Current State

This repository contains the long-term architecture, documentation, strict TypeScript setup, a read-only knowledge service, deterministic Raven response shaping, a Discord-independent command planner, six public read-only Discord commands, one admin-only read-only command, and one admin-only Chronicle draft command. It intentionally does not implement a large command surface yet.

## Knowledge Domains

The Raven's knowledge is organized into five permanent domains:

- `Realm Canon`: permanent server truth such as rules, houses, progression, and rebellion mechanics.
- `Chronicle`: validated history such as boss kills, alliances, battles, rulings, and major builds.
- `Realm State`: current living status such as the King, active houses, wars, alliances, and boss gate.
- `Raven Mind`: personality, tone, silence rules, keyword triggers, and response boundaries.
- `World Intelligence`: future live telemetry from GameOps Bridge and other server intelligence inputs.

See [docs/knowledge-domain-contract.md](docs/knowledge-domain-contract.md) for the permanent contract.

The v1 seed data now includes launch Realm Canon, current Realm State, and Raven Mind response rules under `src/data/knowledge/`. Realm Canon also includes curated public `guide_faq` records for common launch questions. The service layer in `src/services/knowledge/` can load domains, retrieve records by ID, find records by tag, search records, resolve guide FAQ matches, and produce public/admin summaries.

Guide FAQ records are public canon. Before adding more public guide content, run `npm run smoke:faq`; aliases must be unique, related commands must point to known public Raven commands, and FAQ content must not carry private/admin-only material. Linked knowledge uses `domain:id` references, such as `realm-state:active-boss-gate`, and `npm run smoke:references` must pass before adding or editing linked knowledge.

The response layer in `src/services/raven/` turns knowledge records and summaries into Raven-ready plain, lore, or snark responses while respecting public/private admin audience boundaries. `RavenCommandPlanner` maps simple intents such as ask, public summary, and admin summary into that flow. For `/raven ask`, curated guide FAQ records are checked before broad knowledge search so common launch questions get reliable public-safe answers.

`/raven ask` answers specific public-safe questions. `/raven onboarding` gives new players a start-here path. `/raven summary` gives a public overview of known server canon and current state. `/raven house` returns public-safe structured house information from Realm Canon and Realm State. `/raven progression` explains public progression, boss gates, rebellion, throne challenge concepts, and the current launch gate. `/raven roles` explains public roleplay and server roles. `/raven rules` explains public server rules, protected areas, roleplay expectations, rebellion caveats, PvP/raiding placeholders, and launch-status caveats. These public commands are read-only, always use the public audience path, and do not write Chronicle records, expose admin-only notes, or use GameOps Bridge.

`/raven admin summary` is read-only and permission-gated. `/raven duties` shows read-only seeded admin reminders. `/raven chronicle draft` creates a lore-style draft only. `/raven chronicle preview` checks whether an event is ready for future permanent recording and returns a no-write approval preview. The Chronicle recording service can produce no-write write-safety previews with duplicate checks, but permanent Chronicle recording remains deferred. Admin workflows use configured admin user IDs or role IDs, prefer the Small Council Chamber when configured, and reply ephemerally.

The Small Council Chamber can be configured with `RAVEN_SMALL_COUNCIL_CHANNEL_ID`; see [docs/admin-permissions.md](docs/admin-permissions.md).

## First Commands

```bash
npm install
npm run typecheck
npm run build
npm run smoke
npm run dev
```

Use `npm run smoke` as the standard pre-change and pre-commit smoke validation command. Individual smoke scripts still exist for targeted debugging when one area fails.

Copy `.env.example` to `.env` and fill in the Discord values before running the bot.

Register Discord commands after setting `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, and optionally `DISCORD_GUILD_ID`:

```bash
npm run commands:register
```

Using `DISCORD_GUILD_ID` registers the command to one development server. Without it, registration is global and can take longer to appear.

Optional admin configuration:

```bash
RAVEN_ADMIN_USER_IDS=123,456
RAVEN_ADMIN_ROLE_IDS=789
RAVEN_SMALL_COUNCIL_CHANNEL_ID=012
```

Example commands:

```text
/raven ask question:new player
/raven onboarding
/raven onboarding mode:lore
/raven summary
/raven house name:Stark
/raven house name:Lannister mode:lore
/raven progression
/raven progression topic:current gate
/raven progression topic:rebellion mode:lore
/raven roles
/raven roles role:kingsguard mode:lore
/raven rules
/raven rules topic:protected areas
/raven rules topic:roleplay mode:lore
/raven admin summary
/raven duties category:chronicle priority:high
/raven chronicle draft event:House Stark defeated Eikthyr and became the first house to draw blood. type:boss_kill house:House Stark players:Kriatiri, Chris mode:lore
/raven chronicle preview event:House Stark defeated Eikthyr and became the first house to draw blood. type:boss_kill title:First Blood at Eikthyr house:House Stark players:Kriatiri, Chris tags:boss, stark
```

## Documentation

Start with [docs/project-vision.md](docs/project-vision.md), then read [docs/product-architecture.md](docs/product-architecture.md), [docs/admin-duties.md](docs/admin-duties.md), [docs/chronicle-workflow.md](docs/chronicle-workflow.md), and [docs/development-roadmap.md](docs/development-roadmap.md).
