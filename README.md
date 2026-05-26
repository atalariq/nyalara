# Carbon Tracker Monorepo

Carbon Tracker is a mobile-first electricity carbon tracking product.

Users can:

- sign in (email, Google, or guest)
- manage device inventory
- log electricity usage
- see dashboard/history progress
- receive practical recommendations

This repository is a monorepo containing mobile app, backend API, and shared contracts.

## Monorepo Structure

- `apps/mobile` - Expo React Native client
- `apps/api` - Hono backend API
- `packages/shared` - shared DTO/types between mobile and backend

Use [CONTEXT-MAP.md](CONTEXT-MAP.md) to navigate context docs.

## Quick Start

1. Clone and install:

```bash
git clone <repo-url> carbon-tracker
cd carbon-tracker
pnpm install
```

2. Complete setup:

- Follow [SETUP.md](SETUP.md) for full local onboarding:
  - Firebase setup
  - env files
  - backend deploy
  - mobile build/test

3. Run locally:

```bash
pnpm --filter api dev
pnpm --filter mobile dev
```

## Product And Domain References

- Product scope: [docs/PRD.md](docs/PRD.md)
- Context map: [CONTEXT-MAP.md](CONTEXT-MAP.md)
- Mobile domain glossary: [apps/mobile/CONTEXT.md](apps/mobile/CONTEXT.md)
- Backend domain glossary: [apps/api/CONTEXT.md](apps/api/CONTEXT.md)
- Shared domain glossary: [packages/shared/CONTEXT.md](packages/shared/CONTEXT.md)
- ADRs (cross-context): [docs/adr](docs/adr)

## Engineering Commands

From repo root:

```bash
pnpm dev
pnpm dev:api
pnpm dev:mobile
pnpm build
pnpm test
pnpm typecheck
```

## Testing And Verification

- Smoke tests: [docs/smoke-testing-guide.md](docs/smoke-testing-guide.md)
- Firebase setup details: [docs/firebase-setup.md](docs/firebase-setup.md)

## Agentic Workflow (Matt Pocock Skills)

This repo supports agentic development with local skills in `.agents/skills/`.

Read:

- [docs/AGENTIC-WORKFLOW.md](docs/AGENTIC-WORKFLOW.md)
- [docs/PROMPTS.md](docs/PROMPTS.md)
- [AGENTS.md](AGENTS.md)

Recommended workflow:

1. `grill-with-docs` to clarify decisions against context docs
2. `to-issues` to create thin vertical slices
3. `tdd` to implement one behavior at a time
4. `handoff` to preserve state between sessions

## Notes

- Current MVP scope is electricity tracking only.
- Treat backend as authority for canonical usage state.
- Keep secrets out of client bundles and committed files.
