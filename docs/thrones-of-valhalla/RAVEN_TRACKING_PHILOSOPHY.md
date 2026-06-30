# Raven Tracking Philosophy

## Purpose

The Raven exists to preserve the Realm's memory. It should help players and leaders remember what happened, who shaped the Realm, which Houses rose or fell, and how the server progressed across Ages.

The Raven is not an auditor. It should not demand constant evidence, daily reports, screenshots, spreadsheets, or exact accounting of normal play.

## Historian, Not Auditor

The Raven should record meaningful history:

- Who founded a House.
- Which House split into a branch.
- Who supported a Royal Hunt.
- Which boss fell and when.
- Which tournament produced a champion.
- Which decree changed the Realm.
- Which build became a landmark.
- Which betrayal mattered.

The Raven should not try to prove every ordinary action. Perfect tracking is not the goal. Useful, fair, low-friction memory is the goal.

## Data Collection Classes

### 1. Automatic

Automatic tracking is preferred when GameOps, server data, or bot state can capture a fact reliably.

Use for:

- Known server milestones.
- Structured bot records.
- Read-only progress summaries.
- Achievement triggers when telemetry is reliable.
- Future GameOps events that can be trusted.

Automatic does not mean unreviewed permanent history. Major Chronicle records may still require review before becoming official.

### 2. Confirmation

Confirmation tracking uses a player, House leader, or Crown interaction to confirm a broad fact.

Use for:

- House leader weekly status.
- Player or House participation.
- Royal Tribute phase updates.
- Broad contribution confirmation.
- Event signups or attendance signals.

The best confirmation is one click. A short modal is acceptable when the event is meaningful enough to need context.

### 3. Admin Or Mod Confirmed

Staff confirmation should be rare and reserved for official events that alter Realm history, rules, or progression.

Use for:

- Boss defeats.
- Royal Hunt outcomes.
- House founding, disbanding, or splitting.
- Major wars.
- Succession events.
- Crown decrees.
- Rule enforcement.
- Landmark build recognition.

Staff should not be asked to audit routine gathering, building, deposits, deaths, or daily activity.

### 4. Story And Chronicle

Story submissions are optional narrative contributions. They can enrich the Realm, but they must not become required reporting.

Use for:

- Player-written accounts.
- House histories.
- Battle stories.
- Settlement descriptions.
- Betrayal accounts.
- Royal Hunt recaps.
- Legacy reflections.

Chronicle entries should preserve major events only. Not every story needs to become official history.

## What Should Be Tracked

Track facts that help the Realm feel persistent and understandable:

- House membership.
- House leadership.
- House founding, disbanding, and splitting.
- Alliances and betrayals.
- Weekly House check-ins.
- Royal Tribute status.
- Age unlock status.
- Royal Hunt dates and results.
- Boss defeats.
- Tournament winners.
- Achievements and badges.
- Titles.
- Major builds and settlements.
- Major wars and succession events.
- Realm decrees.

Tracking should prioritize state, milestones, and memory over volume.

## What Should Not Be Tracked Exhaustively

Do not exhaustively track routine play:

- Every resource gathered.
- Every chest deposit.
- Every normal death.
- Every routine building change.
- Every player's daily activity.
- Every enemy killed.
- Every item crafted.
- Every repair or upgrade.

Normal Valheim activity is the foundation, not a paperwork stream.

## Possible Discord UX

Discord interactions should keep Raven activity organized and low-noise.

Recommended surfaces:

- Single Raven channel for commands and interactions.
- Read-only Chronicle channel for official history.
- Read-only Achievements channel for permanent badges.
- House leader weekly report prompt.
- Contribution modal for broad participation, not perfect auditing.
- Public progress posts for Royal Tribute.
- Ephemeral confirmations to avoid channel spam.

The Raven should speak when useful. It should not flood channels with minor state changes.

## House Leader Weekly Prompt

A weekly House prompt may ask a leader to confirm light state:

- Active, quiet, recruiting, at war, allied, preparing, or needs Crown attention.
- Optional short note.
- Optional major event nomination.
- Optional participation confirmation for Tribute or Hunt preparation.

This should take under a minute and should not be required every day.

## Contribution Philosophy

Track participation and meaningful milestones, not perfect individual amounts.

Good recognition:

- Supported the First Royal Hunt.
- Contributed to the Black Forest Tribute.
- Helped raise the Walls of King's Landing.
- Fought in the War of Three Banners.
- Founded a cadet branch.

Poor recognition:

- Donated exactly 17 deer hides.
- Deposited 43 stone across five chests.
- Logged in four days this week.
- Killed 28 greydwarfs on Tuesday.

House-level progress is more important than individual micro-tracking. Individual recognition should be reserved for achievements, titles, tournaments, leadership, story moments, and notable contributions.

## Chronicle Standards

The Chronicle should record meaningful events with enough structure to be useful later.

A Chronicle-worthy event should usually answer:

- What happened?
- Who was involved?
- Which House or faction mattered?
- When did it happen?
- Why did it matter to the Realm?
- Was it confirmed, submitted as story, or automatically observed?

Chronicle records should separate factual summaries from lore text. The facts should remain clear even when the Raven's voice adds flavor.

## Anti-Audit Rules

Reject tracking proposals when they require:

- Frequent staff review of normal play.
- Daily player submissions.
- Screenshots as routine proof.
- Exact resource ledgers.
- Manual chest inspections.
- Attendance policing.
- Punishment for ordinary absence.
- Large spreadsheets to understand progression.

The Raven should make the Realm easier to run, not harder.

## Related Docs

- [Thrones Of Valhalla Design Docs](README.md)
- [Gameplay Loop Bible](GAMEPLAY_LOOP_BIBLE.md)
- [Realm Rules And Progression](REALM_RULES_AND_PROGRESSION.md)
- [Achievements And Legacy](ACHIEVEMENTS_AND_LEGACY.md)
