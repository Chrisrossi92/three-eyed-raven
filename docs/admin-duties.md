# Admin Duties

## Purpose

Admin duties are read-only seed reminders for Chris and trusted staff. They help the Raven surface what needs attention without scheduling messages, writing state, or marking work complete.

## Current Status

Duties live in:

```text
src/data/admin/duties.json
```

The current duties system is read-only. It supports loading, filtering, and summarizing duties for admin review.

## Command

`/raven duties` shows active admin duties.

Optional filters:

- `category`
- `priority`
- `mode`

The command is admin-only, replies ephemerally, and requires the Small Council Chamber when `RAVEN_SMALL_COUNCIL_CHANNEL_ID` is configured.

## Duty Shape

Each duty includes:

- id
- title
- description
- category
- priority
- status
- cadence
- audience
- tags

The only supported audience is `admin`.

## Seed Categories

Current seed categories include:

- announcements
- houses
- progression
- rules
- events
- chronicle
- recap
- small_council

## Deferred Work

The duties foundation intentionally does not include:

- scheduled delivery
- completion actions
- writes or updates
- recurring automation
- GameOps integration

Future reminder delivery should target the Small Council Chamber only after scheduling and channel safety are designed.
