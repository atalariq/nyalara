# Shared Context (`packages/shared`)

## Mission

Define and maintain cross-context contracts used by both mobile (`apps/mobile`) and backend (`apps/api`), so both sides speak the same data language.

## Scope boundaries

In scope:

- Shared TypeScript types for API responses and domain payloads
- Cross-context DTOs and primitive validation-friendly shapes
- Stable naming used by both client and server

Out of scope in this context:

- Feature logic specific to only one app
- Infrastructure/runtime code
- UI state modeling that does not cross process boundaries

## Current implementation reality

The package currently contains starter contracts (`ApiResponse`, `AuthUser`, `CarbonActivity`).
Some existing types still reflect broader carbon domains (for example transport/food/waste categories) that are ahead of current PRD scope.

For current MVP work, prefer electricity-first shared contracts and avoid widening domain scope unless requirements change.

## Ubiquitous language

- **Contract**: a shared type relied on by multiple contexts.
- **DTO**: serialized payload shape crossing network/storage boundaries.
- **Breaking change**: any type change that requires coordinated updates in mobile and backend.
- **Versioning point**: explicit path/model split when a backward-incompatible contract is unavoidable.
- **Canonical Contract v1**: PRD-aligned electricity API contracts used by current backend/mobile integration.
- **Canonical usage-log DTO**: the mobile-facing contract for the authoritative electricity tracking record that downstream summaries, insights, and streaks derive from.
- **Device DTO**: the mobile-facing API contract for a user-owned electrical device record managed through backend endpoints.
- **Canonical device DTO**: the shared contract for device inventory managed under the user-scoped canonical backend path rather than a legacy root collection.
- **Device CRUD DTOs**: the shared request and response contracts that support listing, creating, updating, and deleting device inventory through backend APIs.
- **Hard-delete device rule**: deleting a device removes the inventory item itself and does not rewrite historical usage-log payloads.
- **Default-duration DTO field**: the shared device field used to prefill future usage input as a hint, not as canonical consumption data.
- **Last-submitted preset rule**: device responses expose a default duration preset that may be overwritten by the most recently confirmed duration submitted through device-breakdown logging.
- **Form-ready device-list DTO**: the shared device list response contract exposes the fields needed for both inventory UI and usage-log prefilling without extra lookups.
- **Projection DTO**: if exposed at all in MVP, a transient response shape for estimated future usage rather than a persisted record type.
- **Stale-insight DTO rule**: shared contracts may expose that an insight is older than the latest usage-log changes, but MVP does not require automatic regeneration on every log mutation.
- **Stale-insight DTO flag**: the explicit shared boolean field that tells the client whether the current insight payload is stale relative to the latest persisted usage logs.
- **Synchronous refresh DTO rule**: shared mutation responses may include freshly recalculated derived data because usage-log writes complete only after monthly summary and streak are refreshed.
- **Compound usage-write DTO**: the shared response contract that combines a usage-log mutation result with refreshed monthly summary and streak so the client does not need follow-up reads for immediate UI consistency.
- **Delete usage-log DTO**: the shared delete response contract that carries the deleted usage ID plus refreshed monthly summary and streak, without the full removed usage payload.
- **Raw usage-log list DTO**: the shared list response contract that returns canonical usage-log entries for a month without pre-aggregating them into daily chart buckets.
- **Ordered monthly usage-list DTO rule**: the MVP month query returns a newest-first usage-log list without pagination fields.
- **Device breakdown DTO**: the serialized per-device contribution shape embedded in a usage-log request or response as a backend-enriched snapshot, not as a live foreign-key join or FE-owned final calculation.
- **Minimal device-breakdown request DTO**: the shared write-side line-item shape that only requires `deviceId` and `durationMinutes`, leaving snapshot enrichment to backend.
- **Unique device-breakdown DTO rule**: a write payload may include a device at most once in a single usage-log request.
- **Historical snapshot DTO rule**: shared usage-log contracts preserve the recorded meaning of a log even if the referenced device later changes or is deleted.
- **Input type DTO**: the shared enum-like contract that identifies whether a usage-log request is created from `device_breakdown`, `kwh`, or `meter_reading`.
- **Usage-date DTO**: the shared date field that anchors a usage log to exactly one calendar day rather than a multi-day range.
- **Tracking-timezone DTO field**: the explicit shared timezone field used alongside usage date so backend can group logs into days and months deterministically.
- **Mutable usage-log DTO rule**: the initial shared contracts support creating, reading, updating, and deleting usage logs for MVP, without preserving a separate audit history of corrections.
- **Replace-style update DTO rule**: shared update contracts may submit a full valid usage-log payload, including a changed input type, rather than only sparse field patches.
- **Draft-local edit DTO rule**: shared draft handling may allow local edits before upload, but persisted usage-log update contracts assume online backend mutation.
- **Streak DTO**: the mobile-facing derived shape that reports current consistency progress from usage-log presence, typically including current streak and supporting dates.
- **Retroactive streak rule**: shared streak contracts reflect the current persisted usage-log set, so edits or deletions may change previously displayed streak progress.
- **Current-streak DTO rule**: when streak is bundled with a month-scoped summary response, it still represents the user's latest persisted streak rather than a month-relative streak.
- **Guest-capable tracking DTO rule**: device and usage-log contracts are valid for both guest sessions and full-account sessions; insight contracts remain full-account-only.
- **Mobile-facing API DTO**: a request or response contract for a backend route consumed by the mobile app; canonical route DTOs belong in this package rather than being duplicated in app-specific code.
- **API-contract-first migration**: the migration approach where frontend features are rewritten against shared backend route DTOs before any direct adoption of backend-owned persistence shapes.
- **Legacy Contract v0**: older payload conventions tied to pre-cutover mobile data flows.

## Invariants and rules

1. Shared contracts must be framework-agnostic (no Expo/Hono runtime imports).
2. Type names should match backend domain terms from PRD/context docs.
3. Avoid ambiguous unions that hide invalid states.
4. Any breaking contract change must be coordinated with both `apps/mobile` and `apps/api`.
5. Keep API response envelopes consistent across endpoints.

## Contract strategy for this repo

- Prefer modeling electricity usage, calculations, summaries, and insight payloads explicitly.
- Define the request and response DTO for every mobile-facing backend route in this package.
- Distinguish estimated vs verified calculation states in shared types.
- Keep date/month formats explicit (`YYYY-MM`, ISO timestamps) where relevant.

## Quality bar for changes

- Keep exports focused and intentional.
- Remove duplicate or conflicting type declarations.
- Add lightweight compile-time checks/examples when introducing non-trivial types.
- Document migrations in related PR/issue notes when contract changes are breaking.
