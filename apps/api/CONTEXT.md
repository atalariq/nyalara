# Backend Context (`apps/api`)

## Mission

Provide trusted backend behavior for the electricity-only carbon tracking MVP:

- validate authenticated requests,
- verify electricity-to-CO2e calculations,
- produce monthly summaries,
- generate practical energy-saving insights via Gemini.

## Scope boundaries

In scope:

- Electricity usage only (kWh and meter reading input forms)
- Emission factor lookup from Firestore
- Verified calculation responses
- Monthly summary recomputation
- Insight generation and persistence

Out of scope in this context:

- Transport/food/waste tracking
- Carbon offset marketplace and gamification features
- Client-side UX concerns not required for API contracts

## Ubiquitous language

- **Usage record**: a user-owned electricity usage entry for a specific period.
- **Canonical record**: the backend-authoritative record type used as the source of truth for downstream calculations and derived views; usage records are canonical for electricity tracking.
- **Device**: a user-owned inventory record for an electrical appliance or electronics item; it is managed separately from usage records and may be referenced by them.
- **Device location**: the room classification stored on each device (`bedroom`, `bathroom`, `living_room`, `kitchen`, `dining_room`, `other`); create requests may omit it and backend defaults to `other`.
- **Canonical device path**: the backend-owned storage path for device inventory is `users/{userId}/devices/{deviceId}` within canonical schema v1.
- **Device inventory CRUD**: device inventory is a mutable user-owned collection with backend-supported create, read, update, and delete operations in MVP.
- **Hard device delete**: deleting a device removes the inventory record itself rather than archiving it; historical usage records remain valid because they preserve their own snapshots.
- **Default duration preset**: the suggested initial duration stored on a device for future input assistance; it is not part of persisted consumption history until a usage record is created from user confirmation.
- **Last-submitted preset update**: after a usage record is submitted from device breakdown, each referenced device updates its default duration preset to the latest confirmed duration for future prefilling.
- **Form-ready device feed**: the backend device list response includes the fields needed for both inventory display and usage-log prefilling, including watt and default duration preset.
- **Projection**: a non-canonical estimate derived on demand from presets or recent data for UX support; MVP does not persist projections as standalone records.
- **Stale insight**: a persisted insight that may no longer reflect the latest usage-record set after log changes; MVP accepts this until the user requests regeneration.
- **Explicit stale insight flag**: the backend-exposed boolean signal that marks whether a returned insight is stale relative to the latest persisted usage-record state.
- **Synchronous derived refresh**: the backend behavior where usage-record mutations recalculate monthly summary and streak before the request completes, so the response can reflect the latest persisted state.
- **Compound usage-write response**: the mutation response shape that returns the latest usage-record result together with freshly recalculated monthly summary and streak in the same request.
- **Delete usage-record response**: the delete response returns the deleted usage ID together with refreshed monthly summary and streak, without returning the full removed record snapshot in MVP.
- **Raw usage-log feed**: the backend list response that returns month-scoped usage records as canonical entries; daily chart groupings are left to FE in MVP.
- **Ordered monthly usage feed**: the MVP month-scoped usage-record list is returned newest-first and remains unpaginated.
- **Device breakdown**: the optional snapshot of per-device usage contributions stored inside a usage record, carrying enough enriched facts for backend to derive kWh and keep downstream summaries stable even if the source device later changes.
- **Minimal device-breakdown input**: the request-time line-item shape where client sends only `deviceId` and `durationMinutes`, and backend resolves device metadata before persisting the snapshot.
- **Unique device-per-log rule**: a usage record may reference a given device at most once in its device breakdown; duplicate line items for the same device are invalid.
- **Historical snapshot integrity**: once a usage record is persisted, later edits or deletion of the source device do not change that record's meaning because the embedded breakdown is snapshot-based.
- **Input type**: the backend-supported creation mode for a usage record; the supported modes are `device_breakdown`, `kwh`, and `meter_reading`, with `device_breakdown` treated as the primary mobile path.
- **Usage date**: the single calendar day a usage record belongs to; a record never spans multiple days even though a user may create multiple records on the same date.
- **Effective tracking timezone**: the explicit timezone context the backend uses to interpret usage date, streak day, and month grouping for a usage record.
- **Daily usage pattern**: a user may create multiple usage records on the same calendar day; daily totals, streaks, and summaries are computed by aggregating them.
- **Usage-record correction**: in MVP, a user may edit or delete an existing usage record directly; correction audit history is intentionally out of scope.
- **Replace-style usage-record update**: editing a usage record may replace its full valid input payload, including switching between supported input types, before backend recomputes derived values.
- **Draft-local edit**: an unsynced local usage draft may change on-device before upload; this is separate from editing a persisted backend usage record, which requires online connectivity.
- **Streak day**: a calendar day in the user's effective timezone that has at least one usage record and therefore counts toward daily tracking consistency.
- **Streak**: the derived sequence of consecutive streak days for a user; it is computed from current usage-record existence, not from device inventory, and recalculates retroactively after edits or deletions.
- **Current streak**: the streak value returned with dashboard-oriented summary responses; it reflects the user's latest persisted tracking run and is not month-relative.
- **Electricity kWh**: normalized usage value used in calculation.
- **Emission factor**: active `kgCo2ePerKwh` reference from `emission_factors/*`.
- **Estimated result**: client-calculated value before backend verification.
- **Verified result**: backend-calculated authoritative value.
- **Monthly summary**: aggregate totals per `YYYY-MM` period.
- **Insight**: structured Gemini output (title, summary, suggestions) based on user data.

## Invariants and rules

1. Backend is the authority for `verified` calculation status.
2. `totalKgCo2e = electricityKwh * emissionFactorKgCo2ePerKwh`.
3. `meterEnd` must be `>= meterStart` for `meter_reading`.
4. User-scoped data access is limited to `users/{userId}/...`.
5. Gemini is called only from backend; secrets never reach the mobile client.
6. Emission factors are read from storage and can change without mobile redeploy.
7. Creating, editing, or deleting a usage record must recalculate monthly summary and streak from persisted data; insight may remain stale until regenerated.
8. Editing persisted usage records requires online backend access; only unsynced local drafts may be edited offline.

## API surface (MVP)

- `GET /health`
- `GET /emission-factors`
- `POST /calculate-electricity`
- `POST /generate-energy-insight`
- `POST /recalculate-monthly-summary`

All user-specific endpoints require Firebase ID token verification.

## Data authority

Backend-owned writes:

- `calculation.status = verified`
- `calculation.method = server_verified`
- `monthly_summaries/*`
- `insights/*`

Client may submit input and estimated values, but backend re-validates and may overwrite derived values.

## Quality bar for changes

- Validate payloads with schema validation (Zod recommended).
- Keep responses JSON and contract-stable.
- Add or update tests for calculation, validation, and authorization behavior.
- Preserve electricity-only MVP scope unless product docs explicitly expand it.

## Language

**API Contract Schema**:
Schema for request/response payloads exchanged between mobile and backend. This is shared across contexts.
_Avoid_: DB schema, internal document schema

**Persistence Schema**:
Schema for Firestore documents written/read by backend, including backend-owned fields and server-managed timestamps.
_Avoid_: shared DTO, client contract

**Guest Session**:
Usage mode with a verified Firebase ID token from Firebase anonymous auth; can access core user-scoped tracking APIs for device inventory and usage logging, but not insight features.
_Avoid_: unauthenticated local-only guest

**Full Account Session**:
Usage mode with a verified Firebase ID token from a permanent account identity; required for reading and generating insight features.
_Avoid_: anonymous guest session

**Canonical Schema v1**:
The PRD-aligned Firestore model under `users/{userId}/...` plus `emission_factors/*`; this is the only backend-supported schema after hard cutover.
_Avoid_: legacy root collections

**Legacy Schema v0**:
Pre-cutover mobile collections such as root `devices`, `dailyUsage`, and `userProfiles`.
_Avoid_: canonical schema

**Offline Draft Queue**:
Local-only mobile storage for electricity usage drafts that have not yet been submitted to backend APIs and therefore are not canonical usage records.
_Avoid_: pending Firestore sync, canonical usage record

**Persisted tracking state**:
The backend-confirmed set of usage records that downstream streaks, monthly summaries, and insights derive from; local drafts are excluded until they are stored successfully.
_Avoid_: unsynced draft state, optimistic streak state

**Client-generated ID**:
The caller-provided identifier attached to a usage draft and used by the backend as an idempotency key so repeated submissions represent the same usage record intent.
_Avoid_: duplicate create request, random retry token

**Environment Namespace**:
The configured prefix that selects the top-level collection family inside the shared Firebase project, with `dev_`-prefixed collections for development and unprefixed collections for production.
_Avoid_: inferred environment, mixed dev/prod collections

**Bootstrap Fallback Factor**:
The mobile-only emergency factor used for first-run offline estimation before any active emission factor has been fetched; backend verification always supersedes it.
_Avoid_: canonical emission factor, verified factor
