# Mobile Context (`apps/mobile`)

## Mission

Provide a reliable Expo client experience for electricity carbon tracking:

- authenticate users with Firebase Auth,
- capture electricity usage inputs,
- present estimates and sync/verification state,
- display dashboard/history/insight outputs from backend and Firestore.

## Scope boundaries

In scope:

- App navigation and screen flows (auth, onboarding, dashboard, energy, profile)
- Input validation and UX states
- Local estimated calculations for instant feedback
- Firestore read/write for user-owned data
- Offline-capable user flows

Out of scope in this context:

- Backend-only authority decisions (verified calculation, summary recomputation, insight generation)
- Non-electricity domains unless product scope is explicitly expanded

## Current implementation reality

The app currently includes device-centric flows (device setup, per-device estimates) and utility calculators.
The product PRD sets a near-term electricity-usage MVP centered on usage logs, monthly summaries, and backend-verified calculations.
Current auth/data flows include legacy patterns (for example anonymous-auth guest and root-level collections) that are treated as pre-cutover behavior.

When editing mobile code, prefer moves that converge toward the PRD contract and avoid introducing new off-scope domains.

## Ubiquitous language

- **Estimated value**: client-side provisional result shown instantly.
- **Verified value**: backend-authoritative calculation state after sync/verification.
- **Usage log**: user entry for a specific period/month.
- **Canonical record**: the authoritative record the product treats as the source of truth for a user action or measurement; for electricity tracking, usage logs are canonical while devices are supporting inventory.
- **Device**: a user-owned inventory item that represents an electrical appliance or electronics entry the user tracks in the app; it helps compose usage input but is not itself a usage event.
- **Canonical device path**: the backend-owned home for device inventory is `users/{userId}/devices/{deviceId}`, not a legacy root collection.
- **Device inventory CRUD**: device inventory supports full create, read, update, and delete behavior through backend APIs in MVP.
- **Hard device delete**: deleting a device removes it from active inventory immediately; historical usage logs remain intact because they keep their own snapshots.
- **Default duration preset**: the suggested initial duration stored on a device to help prefill future usage input; it is a convenience hint, not a recorded usage fact.
- **Last-submitted preset update**: after a usage log is submitted from device breakdown, each referenced device updates its default duration preset to the latest confirmed duration for future prefilling.
- **Form-ready device feed**: the device list response includes the fields needed for both inventory display and usage-log prefilling, including watt and default duration preset.
- **Projection**: a non-canonical, on-demand estimate derived from presets or recent data for UX purposes; it is not persisted as a separate source of truth in MVP.
- **Stale insight**: an insight whose underlying usage data may have changed since the last generation; in MVP this is acceptable until the user explicitly regenerates insight.
- **Explicit stale insight flag**: the contract-level boolean signal that tells the client whether an insight no longer reflects the latest persisted usage-log state.
- **Synchronous derived refresh**: the expectation that creating, editing, or deleting a usage log updates dependent monthly summary and streak within the same backend request lifecycle.
- **Compound usage-write response**: the backend response shape returned after creating, editing, or deleting a usage log; it includes the latest usage-log mutation result together with refreshed monthly summary and streak so FE can update immediately.
- **Delete usage-log response**: the delete response returns the deleted usage ID together with refreshed monthly summary and streak, without echoing the full removed log snapshot in MVP.
- **Raw usage-log feed**: the month-scoped list of usage logs returned by backend for MVP; FE may aggregate it by day for charts instead of depending on a dedicated daily-summary endpoint.
- **Ordered monthly usage feed**: the MVP month-scoped usage-log list is returned newest-first and does not require pagination.
- **Device breakdown**: the per-device contribution snapshot attached to a usage log, carrying enriched facts such as device identity, name snapshot, watt snapshot, and duration so backend can derive kWh without depending on future device metadata.
- **Minimal device-breakdown input**: the mobile request shape where each line item sends only `deviceId` and `durationMinutes`; backend enriches it into a full persisted snapshot.
- **Unique device-per-log rule**: a usage log may reference a given device at most once in its device breakdown; repeated duration for the same device must be merged into one line item.
- **Historical snapshot integrity**: once a usage log is stored, later edits or deletion of the source device do not rewrite the meaning of that log because its device breakdown is snapshot-based.
- **Input type**: the user-facing path used to create a usage log; the product supports `device_breakdown`, `kwh`, and `meter_reading`, with `device_breakdown` as the preferred primary path.
- **Usage date**: the single calendar day a usage log belongs to; one log never spans multiple days even though a user may create multiple logs on the same day.
- **Effective tracking timezone**: the explicit timezone context used to interpret a usage date, streak day, and monthly grouping for a log; MVP carries this explicitly rather than inferring only from device-local clock behavior.
- **Daily usage pattern**: the product may have multiple usage logs on the same calendar day; daily totals, streaks, and summaries are derived by aggregating those logs rather than enforcing one log per day.
- **Usage-log correction**: in MVP, a user may edit or delete an existing usage log directly; correction audit history is intentionally out of scope.
- **Replace-style usage-log update**: editing a usage log may replace its full valid input payload, including switching between supported input types, rather than only patching a few fields in place.
- **Draft-local edit**: an unsynced local usage draft may be edited on-device before it is uploaded; this is distinct from editing a persisted backend usage log.
- **Streak day**: a calendar day in the user's effective timezone that counts toward consistency because at least one usage log exists for that day.
- **Streak**: a run of consecutive streak days derived from current usage-log presence, not from device count or insight generation; when a log is edited or deleted, the streak recalculates retroactively from the latest persisted data.
- **Current streak**: the streak value returned with dashboard-oriented summary responses; it reflects the user's latest persisted tracking run and does not change when the user merely switches the selected month in UI.
- **Pending sync**: a local draft that has not yet been submitted successfully to the backend API.
- **Persisted tracking state**: the backend-confirmed set of usage logs that powers streaks, monthly summaries, and insight generation; local drafts do not enter this state until sync succeeds.
- **Monthly summary**: period aggregate shown in dashboard.
- **Insight**: backend-generated Gemini advice rendered to the user.
- **Offline draft queue**: the local-only store of usage drafts waiting for network availability and backend submission.
- **Client-generated ID**: the stable identifier assigned to an offline draft before submission and reused on every retry so the backend can treat repeated submissions as the same usage log intent.
- **Environment namespace**: the configured prefix that selects the top-level data space inside the shared Firebase project, with `dev_`-prefixed collections for development and unprefixed collections for production.
- **Cached emission factor**: the most recently fetched active electricity emission factor from the backend, stored locally so estimated previews can work without a live network request.
- **Bootstrap fallback factor**: the built-in emergency emission factor used only when the app has never fetched an active factor and the user is offline; any result derived from it is provisional until backend verification.
- **API-contract-first migration**: the frontend migration approach where mobile features integrate through backend route DTOs first and only touch canonical Firestore documents directly for explicitly allowed cases such as `preferences/main`.
- **Guest session**: authenticated session using Firebase anonymous auth; can manage device inventory and usage logs for core tracking flows, but cannot access insight features.
- **Full account session**: authenticated session using permanent identity (email/social); required for account-bound insight features, including reading and generating insights.

## Invariants and rules

1. Client calculations are UX aids, not source-of-truth.
2. Never expose server secrets (Gemini key, Admin credentials) in mobile.
3. Keep Firestore paths user-scoped for private data.
4. Offline actions must surface clear status (`estimated`, `pending sync`, `verified`, or error).
5. Streaks, monthly summaries, and insights are based on persisted backend data, not unsynced local drafts.
6. Keep payload shapes aligned with backend/shared contracts.
7. Device presets may help input UX, but only submitted usage logs count as actual consumption.
8. Creating, editing, or deleting a usage log must refresh monthly summary and streak from persisted data; insight may remain stale until regenerated.

## Integration expectations

- Auth: Firebase Auth with persisted session.
- Data store: Firestore client SDK (with offline support patterns).
- Backend integration: call API endpoints for verified calculation, summary recompute, and insight generation.
- Contract source: `packages/shared` types and backend API contracts.

## Quality bar for changes

- Validate forms and guard invalid writes.
- Preserve predictable loading/error/offline UI states.
- Avoid schema drift from backend expectations.
- Add/adjust tests where behavior is logic-heavy (validation, mapping, local calculation helpers).
