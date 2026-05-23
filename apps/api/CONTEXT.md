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
- **Input type**: either `kwh` or `meter_reading`.
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
Usage mode with a verified Firebase ID token from Firebase anonymous auth; can access core user-scoped tracking APIs.
_Avoid_: unauthenticated local-only guest

**Full Account Session**:
Usage mode with a verified Firebase ID token from a permanent account identity; required for AI insight generation.
_Avoid_: anonymous guest session

**Canonical Schema v1**:
The PRD-aligned Firestore model under `users/{userId}/...` plus `emission_factors/*`; this is the only backend-supported schema after hard cutover.
_Avoid_: legacy root collections

**Legacy Schema v0**:
Pre-cutover mobile collections such as root `devices`, `dailyUsage`, and `userProfiles`.
_Avoid_: canonical schema
