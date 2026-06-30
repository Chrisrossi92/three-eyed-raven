# Contributor Guide

## Development Philosophy

This project values long-term maintainability over quick command sprawl. Add behavior in small, well-named modules and keep Discord adapters thin.

## Setup

```bash
npm install
cp .env.example .env
npm run typecheck
npm run build
npm run smoke
```

Use the individual smoke scripts only when debugging a focused area. `npm run smoke` is the standard pre-change and pre-commit validation command.

## Before Adding a Feature

Ask:

- Is this a command, event reaction, service, repository, or personality concern?
- Does it belong in human-readable docs, machine-readable JSON, or both?
- Can the behavior be tested without Discord?
- Does this preserve immersion without becoming noisy?

## Code Rules

- Use strict TypeScript.
- Keep service logic independent of Discord objects.
- Validate external input.
- Avoid global mutable state.
- Prefer small repositories over direct file reads in commands.
- Keep comments sparse and useful.

## Documentation Rules

Update docs when adding or changing:

- Bot responsibilities.
- Server policy knowledge.
- Memory categories.
- Personality behavior.
- GameOps assumptions.
- Roadmap priorities.

## Review Checklist

- Does the feature respect the Raven's voice?
- Is it useful without being spammy?
- Are uncertain facts handled honestly?
- Are Discord-specific types kept out of domain services where practical?
- Is JSON persistence hidden behind a repository?
- Would a future database or GameOps adapter fit without rewriting this feature?
- Did `npm run typecheck`, `npm run build`, and `npm run smoke` pass?
