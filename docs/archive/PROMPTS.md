# Backend Implementation Prompts

Use these prompts in a new agent session (Codex as primary, Opencode fallback).  
Project root: repo root

## Prompt 1 — Kickoff and Vertical Slices

```txt
You are working in the repo root.

Read these first:
- docs/PRD.md
- AGENTS.md
- CONTEXT-MAP.md
- apps/api/CONTEXT.md
- apps/mobile/CONTEXT.md
- packages/shared/CONTEXT.md
- docs/agents/issue-tracker.md
- docs/agents/triage-labels.md
- docs/agents/domain.md
- apps/api/docs/adr/

Goal: backend-only implementation in apps/api for electricity MVP.

Use $to-issues to break backend scope into thin vertical slices (AFK-first), with this exact architectural policy:

- Validation stack: Zod + @hono/zod-openapi
- OpenAPI: exposed at /v1/doc (json) and /v1/ui (swagger), public non-prod, restricted in prod
- Auth model:
  - Guest session = Firebase anonymous auth (authenticated)
  - Full account session = non-anonymous account
  - Core tracking APIs allow guest + full account
  - /v1/generate-energy-insight requires full account session
- Firestore ownership:
  - Backend-authoritative writes for canonical docs
  - Mobile should call backend endpoints (not direct canonical Firestore writes)
- Canonical schema: PRD-aligned v1 (hard cutover), legacy root collections are deprecated
- Routes are versioned under /v1
- Error envelope is uniform:
  - success: false
  - error.code
  - error.message
  - error.details? (optional)
- Time/period format:
  - month: YYYY-MM
  - startDate/endDate/usageDate: YYYY-MM-DD
  - API timestamps: ISO 8601 UTC
  - Firestore server timestamps internally
- Rounding:
  - store full precision
  - round in UI only
- Timezone authority:
  - client-provided timezone offset per request
- Insight idempotency:
  - return existing monthly insight unless force=true
- Logging:
  - no full payload logs; only structured metadata
- Module organization:
  - feature-domain structure under apps/api/src (not layer-only structure)

Include these endpoints in v1 slicing:
- GET /v1/health
- GET /v1/emission-factors
- POST /v1/calculate-electricity
- POST /v1/electricity-usages
- GET /v1/electricity-usages?month=YYYY-MM
- GET /v1/monthly-summary?month=YYYY-MM (or equivalent read endpoint)
- POST /v1/recalculate-monthly-summary
- POST /v1/generate-energy-insight

For POST /v1/electricity-usages:
- require clientGeneratedId
- use clientGeneratedId as Firestore document ID
- recalculate monthly summary synchronously in same request

Present proposed issues for approval before writing code.
```

## Prompt 2 — Implement One Slice with TDD

```txt
Implement only the first approved backend slice in apps/api using $tdd.

Constraints:
- Hono + TypeScript
- Zod + @hono/zod-openapi
- Firebase Admin SDK for auth and data access
- /v1 route prefix
- Uniform error envelope
- Feature-domain module structure
- Preserve canonical v1 schema and ADR decisions

Testing requirement for this slice:
- Unit + handler integration tests
- Use public interfaces (avoid implementation-detail tests)

Deliverables:
- code changes
- tests
- short verification results
- brief note for the next slice
```

## Prompt 3 — Diagnose Failures

```txt
Use $diagnose for this failure.

Follow:
reproduce -> minimize -> hypotheses -> instrument -> fix -> regression-test.

Do not patch blindly.
Show ranked hypotheses first, then proceed.
```

## Prompt 4 — Handoff for Next Session

```txt
Use $handoff backend implementation continuation.

Include:
- completed slices
- pending slices
- blockers
- test status
- files changed
- next best prompt/command
```

## Prompt 5 — Fallback If Skill Not Available

```txt
If a requested skill is unavailable, execute the same workflow manually:
- create vertical slices first
- implement one slice at a time
- test each slice before continuing
- keep outputs aligned with apps/api/docs/adr decisions
```

## Grill Decisions Snapshot (Locked)

- Validation + OpenAPI stack:
  - Zod + `@hono/zod-openapi`
- API versioning:
  - All backend routes under `/v1`
- OpenAPI exposure:
  - `/v1/doc` and `/v1/ui` available in non-prod; restricted in prod
- Auth/session policy:
  - Guest session = Firebase anonymous auth (authenticated)
  - Full account session = permanent identity (non-anonymous)
  - Core tracking endpoints allow guest + full account
  - `/v1/generate-energy-insight` requires full account
  - Guest upgrade should link credentials and preserve same `uid`
- Data ownership:
  - Backend-authoritative writes for canonical data
  - Mobile calls backend endpoints for canonical writes
- Canonical data model:
  - PRD-aligned schema v1 under `users/{userId}/...` + `emission_factors/*`
  - Hard cutover; legacy root collections are deprecated
- Shared contracts:
  - Reusable API schemas/types live in `packages/shared`
  - Firestore persistence schema remains backend-owned in `apps/api`
- Required additional endpoints beyond PRD minimum:
  - `POST /v1/electricity-usages`
  - `GET /v1/electricity-usages?month=YYYY-MM`
  - `GET /v1/monthly-summary?month=YYYY-MM` (or equivalent read endpoint)
- Usage-write/idempotency policy:
  - `clientGeneratedId` is required
  - Firestore usage document ID = `clientGeneratedId`
  - Monthly summary recalculated synchronously in usage-write request
- Error contract:
  - Uniform error envelope:
    - `success: false`
    - `error.code`
    - `error.message`
    - optional `error.details`
- Time and formatting:
  - `month`: `YYYY-MM`
  - `startDate`/`endDate`/`usageDate`: `YYYY-MM-DD`
  - API timestamps: ISO 8601 UTC
  - Firestore timestamps stored server-side
  - Timezone authority: client-provided timezone offset per request
- Numeric policy:
  - Store full precision values
  - UI handles display rounding
- Insight generation policy:
  - Return existing monthly insight unless `force=true`
- Logging policy:
  - No full request payload logging; metadata-only structured logs
- Module structure:
  - Feature-domain organization in `apps/api/src`
- Testing policy:
  - Firestore emulator-backed integration tests from day one
  - Emulator tests run in CI for every PR touching `apps/api`
