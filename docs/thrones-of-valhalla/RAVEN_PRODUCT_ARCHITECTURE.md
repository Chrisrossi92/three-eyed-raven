# Raven Product Architecture

## Purpose

The Three-Eyed Raven is a lightweight MMO game master layered over Valheim, not just a Discord bot.

Valheim provides the survival game: exploration, combat, gathering, crafting, building, sailing, and bosses. Thrones of Valhalla provides the Realm structure: Houses, Crown authority, Royal Tribute, Royal Hunts, succession, rivalry, recognition, and history. The Three-Eyed Raven provides memory, guidance, recognition, and low-friction administration.

The Raven should make the world feel alive without making it administratively heavy.

## Product Framing

The Raven should behave like the Realm's persistent memory and quiet game master.

It should:

- Help players understand the current Realm.
- Help House leaders report meaningful status without chores.
- Help moderators and Chris record official events without editing files manually.
- Preserve Chronicle history.
- Recognize achievements and titles.
- Support Royal Hunts, House recognition, and succession moments.
- Stay calm in Discord.

It should not become the game itself. Valheim remains the main game.

## Architecture Modules

### 1. Realm Engine

The Realm Engine owns server-wide state.

Responsibilities:

- Current Age.
- Crown and ruler state.
- Royal Tribute state.
- Royal Hunt state.
- Boss progression state.
- Realm decrees.
- Succession state.

The Realm Engine answers the question: "What is happening in the Realm right now?"

### 2. House Engine

The House Engine owns House identity and relationships.

Responsibilities:

- Recognized Houses.
- House leaders.
- House membership.
- Settlements.
- Alliances.
- Rivalries.
- Branches and cadet Houses.
- House weekly check-ins.

The House Engine answers the question: "Who belongs to whom, and where does each House stand?"

### 3. Legacy Engine

The Legacy Engine owns permanent memory and recognition.

Responsibilities:

- Chronicle entries.
- Achievements and badges.
- Titles.
- Major milestones.
- Permanent history.
- Legacy notes for players and Houses.

The Legacy Engine answers the question: "What should the Realm remember?"

### 4. Event Engine

The Event Engine owns structured Realm events.

Responsibilities:

- Royal Hunts.
- Tournaments.
- Ceremonies.
- Succession events.
- Controlled wars.
- Special server events.

The Event Engine answers the question: "What official moments need scheduling, confirmation, and history?"

### 5. Discord Interface

The Discord Interface is the low-friction surface players and staff use.

Responsibilities:

- Slash commands.
- Buttons.
- Modals.
- Ephemeral confirmations.
- Public summaries.
- Read-only Chronicle feed.
- Read-only Achievement feed.
- Calm `#raven` interaction channel.

The Discord Interface should keep interaction simple. It should not require a large channel map or constant public chatter.

### 6. GameOps Bridge

GameOps Bridge is a future optional intelligence source.

Responsibilities:

- Future player presence.
- Future session activity.
- Future boss or battle telemetry if available.
- Future automatic achievement triggers.
- Future server-health context.
- Must remain optional in Phase 1.

The Raven architecture should be ready to consume GameOps data later, but Phase 1 must work without it.

### 7. Persistence Layer

The Persistence Layer stores Realm memory and current state.

Responsibilities:

- Store Realm state.
- Store Houses.
- Store players.
- Store Chronicle.
- Store achievements and titles.
- Store pending submissions.
- Phase 1 can use simple JSON or local persistence unless implementation later chooses a database.

Persistence should be boring, understandable, and easy to back up before it becomes sophisticated.

## Vertical Slice Strategy

Implementation should build thin, complete slices. Each slice should be usable on its own and should prove one real player or admin workflow before expanding the system.

Initial slices:

- Recognize one House.
- Assign one player to a House.
- Show `/realm`.
- Show `/house`.
- Record one Chronicle entry.
- Award one achievement.
- Schedule one Royal Hunt.
- Complete one Royal Hunt.

Each slice should connect the minimum needed state, interaction, persistence, and output. Avoid building large hidden frameworks before the Realm can use a feature.

## The King's Landing Test

Every feature must answer:

```text
If this were the only feature the Raven had, would it still make King's Landing feel more alive?
```

Accepted examples:

- `/realm`.
- Royal Hunt announcement.
- Chronicle entry.
- House recognition.
- Achievement unlock.

Rejected examples:

- Exact resource ledgers.
- Daily chore systems.
- Noisy reminder spam.
- Overbuilt admin dashboards before the bot works.
- Systems that require Chris to manually audit routine play.

The test keeps the Raven focused on visible Realm life instead of administrative machinery.

## Boundaries

The Raven should not be:

- A spreadsheet.
- A surveillance bot.
- A full economy sim in Phase 1.
- A punishment machine.
- A replacement for normal Valheim.
- A noisy chatbot.
- A complex MMO backend before the community proves it needs one.

The architecture should leave room for growth while keeping Phase 1 small enough to build, operate, and trust.

## Related Docs

- [Thrones Of Valhalla Design Docs](README.md)
- [Gameplay Loop Bible](GAMEPLAY_LOOP_BIBLE.md)
- [Phase 1 Raven MVP Spec](PHASE_1_RAVEN_MVP_SPEC.md)
- [Raven Tracking Philosophy](RAVEN_TRACKING_PHILOSOPHY.md)
- [Realm Rules And Progression](REALM_RULES_AND_PROGRESSION.md)
- [Achievements And Legacy](ACHIEVEMENTS_AND_LEGACY.md)
