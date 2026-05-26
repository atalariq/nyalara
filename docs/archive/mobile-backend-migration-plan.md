# Mobile Migration Plan For Backend API Alignment

## Goal

Migrate the current mobile app from the legacy device-centric model to the backend-aligned electricity usage model.

The target is:

- mobile keeps the current screen set where practical, but moves core data flows onto backend API contracts
- mobile uses direct Firestore writes only for `preferences/main`
- mobile stops using legacy root collections like `devices`, `dailyUsage`, and `userProfiles` for the core product flow
- device inventory becomes backend-owned under `users/{userId}/devices/{deviceId}`
- usage logs become the canonical tracking record, with device breakdown as the primary mobile input path

This plan is aligned to the backend that exists in the repo on 2026-05-25.
Do not assume routes or namespace behavior that are not implemented yet.

## Current Problem

The backend and mobile app do not currently speak the same product model.

Backend is built around:

- `electricity_usages`
- `monthly_summaries`
- `insights`
- `emission_factors`
- backend-verified calculations

Mobile is still built around:

- `devices`
- `dailyUsage`
- `userProfiles`
- device-centric dashboard and energy flows

That means this is not just API wiring. Mobile must change its data authority, API layer, and shared contracts even if the visible screens largely stay in place.

## Target Architecture

### Product model

Keep the current high-level screens, but re-anchor them on a usage-log-centric model:

- Dashboard
- Add Usage
- Devices
- Usage History
- Insight
- Preferences

### Authority split

Backend-owned data:

- device inventory CRUD
- verified usage creation
- verified usage update/delete
- monthly summary recomputation
- streak recomputation
- usage history reads
- insight reads
- insight generation
- emission factor source of truth

Mobile-owned data:

- local form state
- local estimated preview
- offline draft queue
- direct Firestore write to `preferences/main`

Non-goals for this migration:

- reviving environment-namespace work
- reintroducing direct client writes for canonical usage, summary, or insight documents
- preserving legacy device-centric navigation as a first-class flow

## What Must Change In Mobile

### 1. Keep screens, replace legacy data authority

Do not spend MVP time redesigning navigation unless it blocks integration.
Instead, replace the legacy root-collection authority behind the current screens.

Legacy sources to remove from the active data flow:

- root `devices`
- root `dailyUsage`
- root `userProfiles`

Relevant legacy files:

- [DashboardScreen.tsx](/home/atalariq/Works/carbon-tracker/apps/mobile/src/features/dashboard/screens/DashboardScreen.tsx:27)
- [EnergyScreen.tsx](/home/atalariq/Works/carbon-tracker/apps/mobile/src/features/energy/screens/EnergyScreen.tsx:1)
- [deviceService.ts](/home/atalariq/Works/carbon-tracker/apps/mobile/src/features/devices/services/deviceService.ts:17)
- [dailyUsageService.ts](/home/atalariq/Works/carbon-tracker/apps/mobile/src/features/energy/services/dailyUsageService.ts:17)

Recommended approach:

- preserve screen layout where possible
- replace hooks/services under those screens first
- delete dead legacy code later after the new path is stable

### 2. Replace legacy Firestore usage/history/summary reads with backend APIs

Mobile should no longer use Firestore as the canonical read source for:

- usage history
- monthly summary
- insight

Device inventory should also stop using root Firestore collections and move behind backend CRUD endpoints.

Use backend routes that exist today:

- `POST /v1/electricity-usages`
- `GET /v1/electricity-usages`
- `GET /v1/monthly-summary`
- `POST /v1/generate-energy-insight`
- `GET /v1/emission-factors`

Important current constraint:

- there is no `GET /v1/energy-insight` route yet
- `POST /v1/generate-energy-insight` already returns the existing persisted insight when `force` is omitted or `false`
- the first mobile insight slice should target the current route shape unless backend adds a dedicated read route

### 3. Keep direct Firestore writes only for preferences

Preferences should move from legacy `userProfiles` to canonical path:

- `users/{userId}/preferences/main`

Important current constraint:

- environment namespace work was explicitly deprioritized and should not be folded into this migration

Legacy profile code that should be replaced:

- [profileService.ts](/home/atalariq/Works/carbon-tracker/apps/mobile/src/features/profile/services/profileService.ts:5)

### 4. Expand the mobile API layer

Current mobile API integration is too small. It only covers calculate-electricity.

Existing code:

- [protected-api-client.ts](/home/atalariq/Works/carbon-tracker/apps/mobile/src/shared/api/protected-api-client.ts:1)
- [app-calculate-electricity-service.ts](/home/atalariq/Works/carbon-tracker/apps/mobile/src/features/energy/services/app-calculate-electricity-service.ts:1)
- [calculate-electricity-service.ts](/home/atalariq/Works/carbon-tracker/apps/mobile/src/features/energy/services/calculate-electricity-service.ts:7)

Add mobile service modules for:

- list devices
- create device
- update device
- delete device
- create usage
- update usage
- delete usage
- list usage history
- get monthly summary
- generate insight
- get emission factors

The protected client also needs `GET`, `PATCH`, and `DELETE` support because the current transport only supports `POST`.

### 5. Move shared DTOs into `packages/shared`

The shared package must define the backend route DTOs used by mobile.

Add shared contracts for:

- device CRUD request/response
- create usage request/response
- update usage request/response
- delete usage response
- list usages response
- monthly summary response
- streak shape bundled with summary/mutation responses
- generate insight request/response
- emission factor response
- common error envelope
- common month/query primitives

Current shared package is partial:

- [packages/shared/src/index.ts](/home/atalariq/Works/carbon-tracker/packages/shared/src/index.ts:1)

### 6. Re-anchor the existing screen set on usage logs

Keep the existing screen set where possible, but shift its data contracts:

- Dashboard reads backend summary/streak/history
- Devices reads backend inventory and provides prefill hints for usage input
- Add Usage submits backend-owned usage logs
- Energy/History reads backend usage logs and groups them client-side by day
- Insight reads/generates through backend only
- Preferences keeps canonical `preferences/main`

### 7. Keep local estimated preview logic

Mobile should still calculate estimated CO2e locally for:

- instant UX response
- offline usage flow
- first-run usability

Backend remains the authority for verified values.

### 8. Cache emission factors for local estimates

Mobile should:

- fetch active factor from `GET /v1/emission-factors`
- cache the most recent active factor locally
- use cached factor for local estimated preview

If first run is offline and no factor is cached yet:

- allow draft creation
- use a bootstrap fallback factor
- clearly mark the result as estimated only

### 9. Add an offline draft queue

Offline usage logging should not create canonical usage docs directly.

Instead:

- save draft locally
- assign stable `clientGeneratedId`
- allow local draft edits before sync
- retry in background when connectivity returns
- submit to `POST /v1/electricity-usages`

Important current constraint:

- offline support is only required for draft creation/edit before first sync
- editing or deleting a persisted backend usage log still requires connectivity

Draft states should be explicit:

- pending
- syncing
- verified
- failed

### 10. Gate insight features by auth mode

Guest session:

- can manage device inventory
- can create usage
- can edit/delete persisted usage logs when online
- can view history
- can view monthly summary
- cannot read insight
- cannot generate insight

Full account session:

- can do all of the above
- can read insight
- can generate insight

## What Backend Must Support

### Already present in this repo

Backend already registers the core routes in:

- [create-app.ts](/home/atalariq/Works/carbon-tracker/apps/api/src/app/create-app.ts:74)

Available routes:

- `GET /v1/health`
- `GET /v1/emission-factors`
- `POST /v1/calculate-electricity`
- `POST /v1/electricity-usages`
- `GET /v1/electricity-usages`
- `GET /v1/monthly-summary`
- `POST /v1/recalculate-monthly-summary`
- `POST /v1/generate-energy-insight`

### Backend additions or confirmations needed

#### 1. Add backend-owned device inventory CRUD

Required routes:

- `GET /v1/devices`
- `POST /v1/devices`
- `PATCH /v1/devices/:deviceId`
- `DELETE /v1/devices/:deviceId`

Expected behavior:

- device inventory is stored under `users/{userId}/devices/{deviceId}`
- delete is hard delete
- historical usage logs remain valid because they use snapshot-based device breakdown

#### 2. Expand usage-log contracts beyond create-only

Required routes:

- `PATCH /v1/electricity-usages/:usageId`
- `DELETE /v1/electricity-usages/:usageId`

Expected behavior:

- update is replace-style and may switch `inputType`
- delete returns `deletedUsageId` plus refreshed `monthlySummary` and `streak`
- create/update/delete recalculate monthly summary and current streak synchronously

#### 3. Make `device_breakdown` the primary mobile input path

Required behavior:

- support `inputType = device_breakdown | kwh | meter_reading`
- for `device_breakdown`, client sends only `deviceId` and `durationMinutes`
- backend resolves device metadata, snapshots it, and derives kWh server-side
- each `deviceId` may appear at most once per usage log

#### 4. Decide whether a dedicated insight read route is needed

Current behavior:

- there is no `GET /v1/energy-insight?month=YYYY-MM`
- `POST /v1/generate-energy-insight` returns the existing persisted insight when `force` is omitted or `false`

Decision point:

- either keep mobile on the existing POST route for both "load current insight" and "regenerate"
- or add a separate GET route later if the product needs a strict read-only contract

#### 5. Keep insight full-account-only

Insight read and generate should both require a full account session.

#### 6. Keep usage creation idempotent by `clientGeneratedId`

Required for offline retry safety.

Repeated submission of the same draft should behave as idempotent success, not create duplicates.

Current backend implementation already uses `clientGeneratedId` as the Firestore document ID for `users/{userId}/electricity_usages/{usageId}`.
Before relying on the offline queue, add explicit integration coverage for duplicate submission semantics.

## FE User Flow Diagram

```text
[User opens app]
  -> [Auth session restored]
  -> [Guest or Full Account]

[Dashboard]
  -> GET /v1/monthly-summary?month=YYYY-MM
  -> GET /v1/electricity-usages?month=YYYY-MM
  -> streak comes from the summary response as current streak, not month-relative streak
  -> if Full Account:
       POST /v1/generate-energy-insight { month, force?: false }
     else:
       show insight locked state

[Devices]
  -> GET /v1/devices
  -> POST /v1/devices
  -> PATCH /v1/devices/:deviceId
  -> DELETE /v1/devices/:deviceId

[Add Usage]
  -> user selects input type
  -> preferred path: choose devices + durationMinutes
  -> fallback paths: kWh or meter readings
  -> mobile calculates local estimated CO2e
  -> if online:
       POST /v1/electricity-usages
       -> refresh summary/history
     else:
       save offline draft locally
       -> show pending sync

[Reconnect]
  -> background queue retries pending drafts
  -> POST /v1/electricity-usages
  -> refresh summary/history
  -> draft becomes verified or failed

[Edit Persisted Log]
  -> requires online connectivity
  -> PATCH /v1/electricity-usages/:usageId
  -> response returns usage + monthly summary + current streak

[Delete Persisted Log]
  -> requires online connectivity
  -> DELETE /v1/electricity-usages/:usageId
  -> response returns deletedUsageId + monthly summary + current streak

[Insight Screen]
  -> if Guest:
       block access
     else:
       POST /v1/generate-energy-insight { month }
       -> returns existing insight if present
       -> if user requests refresh:
            POST /v1/generate-energy-insight { month, force: true }

[Preferences]
  -> read/write users/{userId}/preferences/main
```

## BE User Flow Diagram

```text
[Request arrives]
  -> verify Firebase ID token
  -> classify session: guest or full account

[POST /v1/electricity-usages]
  -> validate payload
  -> check clientGeneratedId idempotency
  -> if inputType=device_breakdown:
       resolve devices from canonical inventory
       snapshot name/watt
       compute electricityKwh from watt * duration
     else:
       validate non-device path
  -> load active emission factor
  -> compute verified totalKgCo2e
  -> write canonical usage record
  -> update referenced device presets from submitted durations
  -> recompute monthly summary + current streak
  -> return usage + monthly summary + current streak

[PATCH /v1/electricity-usages/:usageId]
  -> require online connectivity from client
  -> replace full valid payload
  -> allow switching inputType
  -> recompute monthly summary + current streak
  -> mark insight stale if affected
  -> return usage + monthly summary + current streak

[DELETE /v1/electricity-usages/:usageId]
  -> delete usage record
  -> recompute monthly summary + current streak
  -> mark insight stale if affected
  -> return deletedUsageId + monthly summary + current streak

[GET /v1/electricity-usages]
  -> validate month query
  -> read canonical usage records for user/month
  -> return ordered history

[GET /v1/monthly-summary]
  -> validate month query
  -> read canonical monthly summary
  -> return summary or not found

[POST /v1/generate-energy-insight]
  -> require full account session
  -> read preferences
  -> read monthly summary
  -> read usage IDs
  -> if cached insight exists and force=false: return cached insight
  -> else call Gemini
  -> persist insight
  -> return insight
```

## FE <-> BE Data Flow Diagram

```text
                         +----------------------+
                         |      Mobile App      |
                         |----------------------|
                         | Auth session         |
                         | Usage form           |
                         | Local estimate       |
                         | Offline draft queue  |
                         | Preferences UI       |
                         +----------+-----------+
                                    |
                         Bearer token + JSON
                                    v
                         +----------------------+
                         |    Hono Backend API  |
                         |----------------------|
                         | Auth verify          |
                         | Calc verify          |
                         | Summary recompute    |
                         | Insight read/gen     |
                         +----+------------+----+
                              |            |
                              |            |
                              v            v
                +-------------------+   +------------------+
                | Firestore         |   | Gemini           |
                |-------------------|   |------------------|
                | users/...         |   | insight generate |
                | monthly_summaries |   +------------------+
                | insights          |
                | emission_factors  |
                +-------------------+

Direct mobile Firestore access:
Mobile App -> users/{userId}/preferences/main
only
```

## Old-To-New Mapping

```text
Old mobile concept            New source
devices inventory             backend CRUD /v1/devices
dailyUsage                    remove/hide
dashboard totals              GET /v1/monthly-summary
energy history                GET /v1/electricity-usages
save usage                    POST /v1/electricity-usages
edit usage                    PATCH /v1/electricity-usages/:usageId
delete usage                  DELETE /v1/electricity-usages/:usageId
estimate preview              local calc + cached emission factor
insight load                  POST /v1/generate-energy-insight { force: false }
insight refresh               POST /v1/generate-energy-insight { force: true }
userProfiles                  users/{userId}/preferences/main
```

## Recommended Migration Order

### Slice 1: Contract and authority cutover

1. Freeze UI structure where possible.
2. Replace root Firestore-backed services with backend contracts.
3. Preserve current screens while swapping their data sources.

### Slice 2: Shared contract and transport completion

1. Expand `packages/shared` with all mobile-facing DTOs.
2. Refactor backend and mobile imports to use shared DTOs.
3. Add `GET` support to the protected mobile API client.

### Slice 3: API service layer

1. Add mobile services for all required backend routes.
2. Keep token-attaching protected client as the common transport layer.
3. Support `GET`, `POST`, `PATCH`, and `DELETE`.

### Slice 4: Dashboard and history

1. Replace dashboard totals with API-backed monthly summary.
2. Replace energy history with API-backed usage history.

### Slice 5: Add usage flow

1. Make `device_breakdown` the primary UX path.
2. Keep `kwh` and `meter_reading` as fallback paths.
3. Keep local estimated preview.
4. Submit canonical writes through `POST /v1/electricity-usages`.
5. Add online-only persisted edit/delete flows.

### Slice 6: Insight flow

1. Add full-account-only insight screen behavior.
2. Start with `POST /v1/generate-energy-insight` as both load and refresh transport.
3. Only add `GET /v1/energy-insight` later if the product needs a separate read contract.

### Slice 7: Preferences migration

1. Move profile logic from `userProfiles` to `preferences/main`.
2. Keep the path canonical and do not reopen namespace work here.

### Slice 8: Offline queue

1. Add local draft storage.
2. Add background retry.
3. Add explicit per-draft sync state.
4. Ensure backend idempotency behavior for retries.

### Slice 9: Legacy cleanup

1. Remove dead device/dailyUsage/profile assumptions.
2. Delete unused legacy code after the new path is stable.

## Concrete File Areas Likely To Change

Mobile:

- `apps/mobile/src/app/(app)/_layout.tsx`
- `apps/mobile/src/app/(app)/*`
- `apps/mobile/src/features/dashboard/*`
- `apps/mobile/src/features/energy/*`
- `apps/mobile/src/features/devices/*`
- `apps/mobile/src/features/profile/*`
- `apps/mobile/src/shared/api/*`
- `apps/mobile/src/config/firebase.ts`

Backend:

- `apps/api/src/app/create-app.ts`
- `apps/api/src/features/energy-insights/*`
- `apps/api/src/features/electricity-usages/*`

Shared:

- `packages/shared/src/index.ts`

## Bottom Line

The mobile app should stop behaving like a device tracker with direct legacy Firestore persistence.

It should become:

- a usage-log client
- backed by shared backend DTOs
- reading core product data from backend APIs
- writing only preferences directly to canonical Firestore
- using local-only drafts for offline usage creation
