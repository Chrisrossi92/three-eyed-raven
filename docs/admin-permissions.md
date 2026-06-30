# Admin Permissions

## Purpose

Admin-only Raven behavior must require explicit permission checks before it can be used. This protects private guidance, pending decisions, draft rulings, and future Small Council messages from leaking into public channels.

## Current Status

The project has a deterministic permission service at `src/services/discord/discordPermissionService.ts`.

It supports:

- Admin user ID checks.
- Admin role ID checks.
- Admin Raven access checks.
- Small Council channel/thread matching.

`/raven admin summary` is the first admin-only Discord command. `/raven duties` is the first admin-only duties command. `/raven chronicle draft` is the first admin-only Chronicle drafting command. `/raven ask` and `/raven summary` remain public-only and always use the public audience path.

## Configuration

Set these optional environment variables in `.env`:

```bash
RAVEN_ADMIN_USER_IDS=123456789012345678,234567890123456789
RAVEN_ADMIN_ROLE_IDS=345678901234567890
RAVEN_SMALL_COUNCIL_CHANNEL_ID=456789012345678901
```

`RAVEN_SMALL_COUNCIL_CHANNEL_ID` may be a private channel ID or a private thread ID, depending on where the Small Council Chamber lives.

If admin user IDs and role IDs are missing, admin access is denied by default.

## Permission Model

A user may use future admin Raven features if either condition is true:

- Their Discord user ID is listed in `RAVEN_ADMIN_USER_IDS`.
- At least one of their Discord role IDs is listed in `RAVEN_ADMIN_ROLE_IDS`.

The Small Council channel/thread check is separate. It answers whether a channel ID matches the configured Small Council Chamber, but it does not by itself grant admin permission.

## Admin Summary Command

`/raven admin summary` uses `DiscordPermissionService.canUseAdminRaven(...)` before it calls the planner.

If the user is not authorized, the command replies ephemerally and does not call the planner. The denial does not reveal whether admin IDs or role IDs are configured.

If `RAVEN_SMALL_COUNCIL_CHANNEL_ID` is configured, authorized admins must use the command in that channel or thread. If they use it elsewhere, the command replies ephemerally with Small Council guidance and does not call the planner.

If no Small Council channel/thread is configured, authorized admins may use the command anywhere, but the response remains ephemeral.

Authorized responses use:

- planner intent: `admin_summary`
- audience: `private_admin`
- ephemeral reply: yes

## Duties Command

`/raven duties` uses `DiscordPermissionService.canUseAdminRaven(...)` before it calls the duty service.

If the user is not authorized, the command replies ephemerally and does not call the duty service. If `RAVEN_SMALL_COUNCIL_CHANNEL_ID` is configured, authorized admins must use the command in that channel or thread.

The command reads seeded duty reminders only. It does not schedule reminders, complete duties, update duty status, or mutate `duties.json`.

## Chronicle Draft And Preview Commands

`/raven chronicle draft` uses `DiscordPermissionService.canUseAdminRaven(...)` before it calls the draft service.

`/raven chronicle preview` uses the same permission and Small Council checks before it calls the approval service.

If the user is not authorized, the command replies ephemerally and does not call the draft or preview service. If `RAVEN_SMALL_COUNCIL_CHANNEL_ID` is configured, authorized admins must use these commands in that channel or thread.

The draft command creates draft text only. The preview command checks whether an event appears ready for future permanent recording. Neither command mutates `chronicle.json`, creates permanent history, or consumes GameOps data.

Chronicle approval previews are admin-only review artifacts. They validate whether a draft-like event appears ready for permanent recording, but they do not write history.

## Boundaries

- Public commands must never use `private_admin` audience.
- Public commands must never expose admin summaries.
- Admin summaries are read-only and permission-gated.
- Duties are admin-only, read-only, and not scheduled yet.
- Chronicle drafts are admin-only, ephemeral, and not permanent records.
- Chronicle approval previews are no-write review artifacts.
- Future scheduled admin messages should target the Small Council channel/thread only after channel checks are wired into the sending path.
- Chronicle writes and GameOps integration are not part of these commands.
