# Carbon Tracker

Carbon Tracker is an electricity-focused carbon footprint tracker built for mobile-first use. It helps users log household electricity usage, convert kWh into estimated CO2e, review monthly trends, and receive practical energy-saving insights.

## User Overview

Current MVP scope:

- sign in with Firebase Auth
- log electricity usage with direct `kwh` input or `meter_reading`
- calculate electricity emissions from a backend-managed emission factor
- review usage history and monthly summaries
- generate energy-saving insights from backend AI workflows

This repo is still implementation-first. The source-of-truth product scope lives in [docs/PRD.md](docs/PRD.md).

## Repository Overview

This is a monorepo with three main contexts:

- [`apps/mobile`](apps/mobile): Expo mobile client
- [`apps/api`](apps/api): Hono backend API
- [`packages/shared`](packages/shared): shared contracts and cross-context types

Use [CONTEXT-MAP.md](CONTEXT-MAP.md) to find the right context docs quickly.

## Developer Overview

Before changing code, read:

- [AGENTS.md](AGENTS.md)
- [CONTEXT-MAP.md](CONTEXT-MAP.md)
- [docs/PRD.md](docs/PRD.md)
- [docs/firebase-setup.md](docs/firebase-setup.md)

Backend contributors should also read:

- [apps/api/CONTEXT.md](apps/api/CONTEXT.md)
- [apps/api/docs/adr/0001-zod-and-hono-zod-openapi.md](apps/api/docs/adr/0001-zod-and-hono-zod-openapi.md)
- [apps/api/docs/adr/0002-backend-authoritative-writes.md](apps/api/docs/adr/0002-backend-authoritative-writes.md)
- [apps/api/docs/adr/0003-guest-vs-full-account-policy.md](apps/api/docs/adr/0003-guest-vs-full-account-policy.md)
- [apps/api/docs/adr/0004-canonical-schema-v1-hard-cutover.md](apps/api/docs/adr/0004-canonical-schema-v1-hard-cutover.md)

## Local Setup

Install dependencies from the repo root:

```bash
pnpm install
```

Install required CLIs for Firebase-backed local work:

```bash
firebase --version
gcloud --version
```

Firebase setup is split by app role:

- Mobile client setup: [docs/firebase-setup.md](docs/firebase-setup.md)
- Backend Admin SDK setup: [docs/firebase-setup.md](docs/firebase-setup.md)

Quick entry points:

- Mobile app: [apps/mobile/README.md](apps/mobile/README.md)
- Backend API: [apps/api/README.md](apps/api/README.md)

Environment templates:

- Mobile env template: [apps/mobile/.env.example](apps/mobile/.env.example)
- API env template: [apps/api/.env.example](apps/api/.env.example)

## Current Backend Surface

Implemented backend endpoints under `/v1`:

- `GET /v1/health`
- `GET /v1/emission-factors`
- `POST /v1/calculate-electricity`

The backend uses:

- Hono + TypeScript
- Zod + `@hono/zod-openapi`
- Firebase Admin SDK for auth verification and Firestore access
- a uniform JSON error envelope

## Documentation

- Product requirements: [docs/PRD.md](docs/PRD.md)
- Firebase setup: [docs/firebase-setup.md](docs/firebase-setup.md)
- Agent workflow: [docs/AGENTIC-WORKFLOW.md](docs/AGENTIC-WORKFLOW.md)
- Operator prompts: [docs/PROMPTS.md](docs/PROMPTS.md)
- Repo automation guidance: [docs/agents/domain.md](docs/agents/domain.md)
