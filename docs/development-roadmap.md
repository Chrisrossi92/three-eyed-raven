# Development Roadmap

## Milestone 0: Foundation

- Strict TypeScript project setup.
- Discord client entrypoint.
- Command and event registration scaffolding.
- Configuration loading.
- JSON repository abstractions.
- Permanent product documentation.

## Milestone 1: Minimal Useful Raven

Foundation completed:

- Add read-only knowledge lookup through `KnowledgeService`.
- Add deterministic Raven response shaping through `RavenResponseFormatter`.
- Add Discord-independent command planning through `RavenCommandPlanner`.
- Wire the first live Discord command: `/raven ask`.
- Add public new-player onboarding: `/raven onboarding`.
- Add the second read-only public command: `/raven summary`.
- Add structured public house lookup: `/raven house`.
- Add structured public progression lookup: `/raven progression`.
- Add structured public role lookup: `/raven roles`.
- Add structured public rules lookup: `/raven rules`.
- Add explicit admin permission configuration and `DiscordPermissionService`.
- Add the first admin-only command: `/raven admin summary`.
- Add admin-only read-only duties foundation and `/raven duties`.
- Add the first Chronicle workflow: `/raven chronicle draft`, an admin-only non-persistent draft command.
- Add Chronicle review/confirm design foundation with no-write approval previews.
- Expose no-write Chronicle approval previews through `/raven chronicle preview`.
- Add permanent Chronicle recording safety foundation with no-write write previews, ID previews, duplicate checks, and audit metadata previews.
- Seed v1 Realm Canon for the Thrones-inspired Valheim launch premise, roles, houses, progression, rebellion concepts, protected-area placeholders, PvP/raiding placeholders, launch-status rules, onboarding, roleplay expectations, and curated public guide FAQ answers.
- Seed v1 Realm State for the launch ruler, known roleplay roles, house placeholders, boss gate, launch phase, and pending decisions.
- Seed v1 Raven Mind with plain guide mode, lore mode, snark mode, silence rules, keyword trigger examples, and response boundaries.
- Add a smoke check for loading domains, retrieving records by ID, tag search, search, and summaries.
- Add a smoke check for plain, lore, snark, private admin, public boundary, and missing-knowledge responses.
- Add a smoke check for ask, public summary, admin summary, public admin-boundary, and missing-query planning.
- Add planner smoke coverage for known house lookup, unknown house fallback, and public-safe house responses.
- Add planner smoke coverage for default progression, boss progression, rebellion, current gate, unknown-topic fallback, and public-safe responses.
- Add planner smoke coverage for role overview, King, Hand, Kingsguard, house leader, house member, unknown-role fallback, and public-safe responses.
- Add planner smoke coverage for onboarding premise, houses, current gate, Raven command hints, and public-safe output.
- Add planner smoke coverage for default rules, protected areas, roleplay, rebellion, unknown-topic fallback, and public-safe responses.
- Add planner smoke coverage for guide FAQ priority in `/raven ask`, including house joining, current boss gate, betrayal, protected areas, unknown-query fallback, and public-safe output.
- Add FAQ quality smoke coverage for public guide records, unique aliases, valid related commands, and admin-only content guardrails.
- Add domain-reference smoke coverage for `domain:id` format, duplicate references, valid domains, and real record targets.
- Add aggregate smoke command `npm run smoke` for standard pre-change and pre-commit validation.
- Add a smoke check for the `/raven` command adapter defaults, mode pass-through, public audience enforcement, ask metadata, and summary metadata.
- Add a smoke check for admin user IDs, admin role IDs, Small Council channel matching, missing-config denial, and public command isolation.
- Add command smoke coverage for admin denial without planner calls, Small Council mismatch denial, authorized admin summary, and `private_admin` planner use.
- Add duties smoke coverage for loading, active summary, category filter, priority filter, admin command denial, Small Council mismatch, authorized output, and no duty file mutation.
- Add command smoke coverage for Chronicle draft denial without draft service calls, Small Council mismatch denial, authorized draft output, and no `chronicle.json` mutation.
- Add command smoke coverage for Chronicle preview denial without preview service calls, Small Council mismatch denial, ready/not-ready output, and no `chronicle.json` mutation.
- Add Chronicle approval smoke coverage for ready previews, missing required fields, separated factual/lore fields, no-write marker, and no `chronicle.json` mutation.
- Add Chronicle recording smoke coverage for write preview readiness, ID preview, audit metadata, duplicate candidates, missing required fields, no-write marker, and no `chronicle.json` mutation.

Remaining before expanding command work:

- Decide which `needs_decision` canon records can become active.
- Keep `/raven ask` stable before adding more command surfaces.
- Keep admin command expansion narrow until permission behavior has real server usage.
- Wire any future Small Council messages only after channel targeting is tested.

## Milestone 2: Admin Knowledge Management

- Add admin-only commands to add, edit, and review knowledge entries.
- Add audit records for administrative changes.
- Add validation for structured knowledge files.
- Add channel configuration.
- Keep permanent Chronicle recording deferred until approval and audit behavior are finalized.

## Milestone 3: Memory and Chronicle

- Add manual memory entry commands.
- Add event timeline lookup.
- Add house and player history records.
- Add chronicle formatting.
- Add scheduled realm summaries.

## Milestone 4: Roleplay Systems

- Add house profiles.
- Add rebellion mechanics explanations.
- Add war and alliance records.
- Add achievement celebration workflows.
- Add staff approval states for sensitive events.

## Milestone 5: GameOps Bridge Adapter

- Add inbound adapter.
- Validate and normalize events.
- Store live event history.
- Announce only meaningful milestones.
- Add deduplication and retry handling.

## Milestone 6: Storage Upgrade Evaluation

Evaluate moving from JSON to a database if memory volume, concurrent writes, search, or admin audit needs outgrow file-backed persistence.
