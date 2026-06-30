# Phase 1 Raven MVP Spec

## Purpose

Phase 1 translates the Thrones of Valhalla gameplay foundation into a small, usable first Raven bot experience.

The goal is not to automate the whole Realm. The goal is to give players, House leaders, moderators, and Chris a simple way to see current Realm status, record major milestones, and preserve official history without turning Valheim into paperwork.

## Core Constraints

- Keep it simple.
- No daily chores.
- No noisy Discord spam.
- No million-channel setup.
- No exhaustive tracking.
- No spreadsheets.
- No screenshot proof requirements.
- No features requiring more than about 15 players online at once.
- The Raven is historian, not auditor.
- Valheim remains the main game.

## Phase 1 Discord Surfaces

### `#raven`

The main bot interaction channel.

Use for:

- Slash commands.
- Buttons.
- Short modals.
- Ephemeral confirmations.
- Public posts only when the summary is useful to the Realm.

`#raven` should be the default place to interact with the bot so players do not need to learn a large channel map.

### `#chronicle`

Read-only official history feed.

Use for major events only:

- Boss defeats.
- Royal Hunt results.
- House founding, splitting, or disbanding.
- Major alliances or betrayals.
- Crown decrees.
- Tournament winners.
- Succession moments.
- Landmark builds.

Player submissions should not post directly here. They should go through review first.

### `#achievements`

Read-only badge and title recognition feed.

Use for meaningful unlocks only:

- Permanent achievements.
- House achievements.
- Tournament recognition.
- Title grants, changes, or removals when public.
- Legacy awards.

This channel should feel like recognition, not noise.

### Optional Existing Normal Channels

The Raven may reference or support existing normal channels, but Phase 1 should not require a large new channel structure.

Acceptable existing channels:

- `#general`
- `#screenshots`
- `#roleplay`

Do not create a huge channel list for Phase 1.

## Player-Facing Commands And Features

### `/realm`

Shows the current Realm state.

Should include:

- Current Age.
- Crown.
- Ruler.
- Current Royal Tribute status.
- Next Royal Hunt status.
- Recognized Houses.
- Upcoming event if any.

Acceptance goal: a stranger can type `/realm` and understand what is happening.

### `/house`

Shows a selected House or the user's House if known.

Should include:

- House name.
- Leader.
- Member count.
- Status.
- Current goal.
- Settlement name if known.
- Alliances if known.
- Rivals if known.
- Branch relationship if relevant.

This command should help players understand the House map without asking staff to explain it repeatedly.

### `/chronicle submit`

Allows an optional story submission.

Behavior:

- Opens a short modal.
- Captures a short title or summary.
- Captures what happened.
- Captures involved Houses or players if provided.
- Sends submission to admin or mod review.
- Does not post directly to the official Chronicle.

This is optional flavor and history support. It must not become required reporting.

### `/me`

Shows the user's own Realm identity.

Should include:

- House.
- Achievements.
- Current title if any.
- Recent legacy notes.

This is a personal memory view, not an activity leaderboard.

## House Leader-Facing Commands And Features

### `/house-checkin`

A weekly or occasional light House report.

Interaction style:

- Buttons where possible.
- Short modal when text is useful.
- Ephemeral confirmation after submission.
- Public summary only if useful.

Fields and options:

- Status: Active, Quiet, Recruiting, Preparing, At War, Needs Crown Attention.
- Major update: optional short text.
- Tribute support: yes, no, or partial.
- New member request: optional.
- Alliance or rivalry update: optional.

The check-in should take under one minute. It should not be required daily and should not punish a House for missing a week.

## Admin And Mod-Facing Commands And Features

### `/admin house recognize`

Officially recognizes a House.

Should record:

- House name.
- Leader.
- Settlement name if known.
- Founding date.
- Optional branch relationship.

May produce a Chronicle entry or public recognition post when appropriate.

### `/admin house update`

Updates official House state.

Possible updates:

- Leader.
- Status.
- Alliance.
- Rivalry.
- Branch or split.
- Disbandment.
- Settlement name.

This command handles official state changes, not routine House management.

### `/admin member assign`

Assigns a player to a House after approval.

Should support:

- New player placement.
- Approved House change.
- Removing a player from a House if needed.

House membership should be clear, but it should not become a daily attendance system.

### `/admin age set`

Sets the current Age.

Use for:

- Launch state.
- Boss defeat progression.
- Staff-corrected Realm state.

Age changes should be official and visible through `/realm`.

### `/admin tribute update`

Updates broad Royal Tribute progress.

Preferred tracking:

- House-level status.
- Simple percentage.
- Simple status such as Not Started, Gathering, Nearly Complete, Complete.
- Short public note when useful.

Avoid exact individual accounting.

### `/admin hunt schedule`

Schedules a Royal Hunt and posts an announcement.

Should record:

- Boss.
- Date and time.
- Required Age or Tribute state.
- Altar access note.
- Crown representative if known.

The announcement should be clear, but not spammy.

### `/admin hunt complete`

Records a Royal Hunt result.

Should support:

- Boss defeated or failed.
- Participating Houses if known.
- Notable players if known.
- Unlocking the next Age if appropriate.
- Posting an official Chronicle entry.
- Triggering achievements or title follow-up when appropriate.

This is an official Realm milestone and should be admin or mod confirmed.

### `/admin achievement award`

Awards a permanent achievement or badge.

Should record:

- Achievement.
- Award target: player or House.
- Awarded by.
- Awarded at.
- Optional reason.

Achievements are permanent historical recognition.

### `/admin title grant`

Grants, changes, or removes a title.

Should support:

- Granting a title.
- Replacing a title.
- Removing a title.
- Recording the reason when useful.

Titles are social recognition and may change over time.

### `/admin chronicle approve`

Approves an optional Chronicle submission into official history.

Should support:

- Reviewing pending submissions.
- Editing or clarifying summary text before approval.
- Assigning event type.
- Adding involved Houses or players.
- Posting to `#chronicle` after approval.

Submissions should never become official automatically.

## Conceptual Data Model

This is a conceptual model only. It does not require code yet and does not require a database in Phase 1 unless later chosen.

### `realm.json`

- `currentAge`
- `crownHouse`
- `ruler`
- `currentTribute`
- `nextHunt`
- `recognizedHouses`

### `houses.json`

- `id`
- `name`
- `leaderDiscordId`
- `memberDiscordIds`
- `status`
- `settlementName`
- `alliances`
- `rivals`
- `branchOf`
- `foundedAt`

### `players.json`

- `discordId`
- `displayName`
- `houseId`
- `achievements`
- `currentTitle`
- `legacyNotes`

### `chronicle.json`

- `id`
- `date`
- `type`
- `summary`
- `involvedHouses`
- `involvedPlayers`
- `approvedBy`
- `source`: admin, manual, story, or automatic

### `achievements.json`

- `id`
- `name`
- `description`
- `category`
- `awardedToType`: player or house
- `awardedToId`
- `awardedAt`
- `awardedBy`

### `submissions.json`

Stores pending Chronicle submissions from players and House leaders.

Should include enough context for review, but should not treat submissions as official history until approved.

## Phase 1 Event Flows

### 1. New Player Joins Realm

1. Player learns the server path and travels to King's Landing.
2. Player chooses or requests a House.
3. House approves the player.
4. Admin or mod runs `/admin member assign`.
5. Player can use `/me` and `/house` to see their identity.

### 2. House Recognized

1. House leader or Crown agrees the House is ready.
2. Admin or mod runs `/admin house recognize`.
3. House appears in `/realm`.
4. House can be viewed with `/house`.
5. Optional Chronicle or achievement recognition may be posted.

### 3. Weekly House Check-In

1. House leader runs `/house-checkin` or responds to a Raven prompt.
2. Leader selects status and optionally adds a short update.
3. Raven stores the broad status.
4. Admins can review Houses needing Crown attention.
5. Public summary is posted only when useful.

### 4. Tribute Progress Update

1. Houses contribute through normal Valheim play.
2. House leaders or admins confirm broad progress.
3. Admin or mod runs `/admin tribute update`.
4. `/realm` reflects the current Tribute state.
5. Public progress post is made only when helpful.

### 5. Royal Hunt Scheduled

1. Realm earns the right to challenge the boss.
2. Crown chooses date and conditions.
3. Admin or mod runs `/admin hunt schedule`.
4. Raven posts a clear announcement.
5. `/realm` shows the upcoming Hunt.

### 6. Royal Hunt Completed

1. Crown or representative opens the altar.
2. Realm attempts the boss.
3. Admin or mod runs `/admin hunt complete`.
4. Raven records result.
5. Raven posts official Chronicle entry if appropriate.
6. Next Age is unlocked if appropriate.
7. Achievements or titles can be awarded as follow-up.

### 7. Achievement Awarded

1. Player or House earns meaningful recognition.
2. Admin or mod runs `/admin achievement award`.
3. Raven records permanent achievement.
4. Raven posts to `#achievements`.
5. `/me` or `/house` reflects the award.

### 8. Chronicle Story Submitted And Approved

1. Player or House leader runs `/chronicle submit`.
2. Submission enters review queue.
3. Admin or mod reviews it.
4. Admin or mod runs `/admin chronicle approve`.
5. Raven posts approved history to `#chronicle`.
6. Submission becomes official Chronicle only after approval.

## Explicitly Out Of Scope For Phase 1

- No automatic GameOps integration yet.
- No boss telemetry yet.
- No perfect resource accounting.
- No automated punishments.
- No public daily reminders.
- No economy.
- No war engine.
- No PvP automation.
- No web dashboard.
- No AI answering yet.
- No database requirement unless later chosen.
- No complex House leveling.
- No individual contribution leaderboard.

## Acceptance Criteria

- A stranger can type `/realm` and understand what is happening.
- A House leader can complete check-in in under one minute.
- Chris and moderators can record major Realm events without editing files manually.
- The Raven can post official Chronicle and Achievement messages.
- The system feels like Realm memory, not homework.
- Discord remains calm and readable.

## Related Docs

- [Thrones Of Valhalla Design Docs](README.md)
- [Gameplay Loop Bible](GAMEPLAY_LOOP_BIBLE.md)
- [Raven Tracking Philosophy](RAVEN_TRACKING_PHILOSOPHY.md)
- [Realm Rules And Progression](REALM_RULES_AND_PROGRESSION.md)
- [Achievements And Legacy](ACHIEVEMENTS_AND_LEGACY.md)
