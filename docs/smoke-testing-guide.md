# Smoke Testing Guide

This guide covers the current backend/mobile migration after the usage-log and backend-owned device changes.

Use it in two setups:

- your own machine with local backend + local mobile app
- your friend's machine with local mobile app + shared deployed backend

Do not ask your friend to point their app at your `localhost`. Remote teammates must use a reachable backend URL.

## Scope

Smoke test these flows:

- device CRUD through backend routes
- electricity usage create through `device_breakdown`
- monthly summary + current streak refresh
- usage history refresh
- insight access rules
- stale insight behavior after usage mutation
- offline create queue and later sync

## Setup A: Your Machine

Use this when you want to test FE and backend together before or after deploy.

### 1. Backend env

Create `apps/api/.env` from `apps/api/.env.example`.

Minimum values:

```env
GOOGLE_CLOUD_PROJECT=carbon-tracker-c1925
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash-lite
```

Make sure the service account belongs to the same Firebase/GCP project the mobile app uses.

### 2. Mobile env

Create `apps/mobile/.env` from `apps/mobile/.env.example`.

For Android emulator, the documented local backend base URL is:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000
```

For iOS simulator, use:

```env
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:3000
```

For a physical device on the same LAN, use your machine IP:

```env
EXPO_PUBLIC_API_BASE_URL=http://YOUR_LAN_IP:3000
```

Also set the Firebase Expo env vars described in [firebase-setup.md](/home/atalariq/Works/carbon-tracker/docs/firebase-setup.md:1).

### 3. Start backend

From repo root:

```bash
pnpm --filter api dev
```

Confirm:

- `GET /v1/health` returns success
- backend logs show no startup credential errors

### 4. Start mobile app

From repo root:

```bash
pnpm --filter mobile dev
```

Open the app in your normal development target.

### 5. Test matrix

Run these in order.

#### Device CRUD

1. Sign in as guest.
2. Create a device.
3. Confirm it appears in the device list after refresh.
4. Edit the device name, watt, or default duration.
5. Confirm the edited values persist.
6. Delete the device.
7. Confirm it disappears from the list.

#### Usage create through `device_breakdown`

1. Create two devices.
2. Trigger a usage submission from the device-driven flow.
3. Confirm backend request hits `POST /v1/electricity-usages`.
4. Confirm history updates after polling refresh.
5. Confirm monthly summary totals increase.
6. Confirm current streak is present in the summary response.

#### Insight auth rules

1. As guest, trigger insight fetch/generation.
2. Confirm backend returns `403 forbidden`.
3. Sign in with a full account.
4. Trigger insight fetch/generation again.
5. Confirm success and returned `isStale`.

#### Stale insight behavior

1. As full account, generate insight for the current month.
2. Create or update another usage log in the same month.
3. Call `POST /v1/generate-energy-insight` again with `force: false`.
4. Confirm returned insight now has `isStale: true` until regenerated.
5. Call again with `force: true`.
6. Confirm returned insight has `isStale: false`.

#### Usage update and delete

Use direct API calls if the current mobile UI does not expose these clearly yet.

1. Create a usage log.
2. Capture its `usageId`.
3. `PATCH /v1/electricity-usages/:usageId` with a changed valid payload.
4. Confirm monthly summary refreshes.
5. `DELETE /v1/electricity-usages/:usageId`.
6. Confirm monthly summary and streak refresh again.

Example:

```bash
curl -X PATCH "$API_BASE_URL/v1/electricity-usages/$USAGE_ID" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inputType": "kwh",
    "input": { "kwh": 3.2, "meterStart": null, "meterEnd": null, "unit": "kwh" },
    "period": { "startDate": "2026-05-01", "endDate": "2026-05-31", "month": "2026-05" },
    "source": { "createdFrom": "mobile", "offlineCreated": false },
    "timestamps": { "usageDate": "2026-05-25", "createdAtClient": "2026-05-25T10:30:00.000Z" }
  }'
```

```bash
curl -X DELETE "$API_BASE_URL/v1/electricity-usages/$USAGE_ID" \
  -H "Authorization: Bearer $ID_TOKEN"
```

#### Offline create queue

1. Put the device in airplane mode or disable network.
2. Trigger usage create from the mobile flow.
3. Confirm the app does not crash.
4. Re-enable network.
5. Wait for the next polling/sync cycle.
6. Confirm the usage appears in history and summary.

## Setup B: Your Friend's Machine

Use this when your friend is testing remotely and cannot reach your local backend.

### 1. Backend target

Your friend should point mobile at a shared reachable backend URL:

- a deployed dev Cloud Run service
- a temporary public preview URL
- their own local backend if they are testing solo

They should not use your `localhost`, your LAN IP, or your emulator-only host mapping.

Example:

```env
EXPO_PUBLIC_API_BASE_URL=https://YOUR-DEV-BACKEND.run.app
```

### 2. Mobile env

Your friend still needs their own `apps/mobile/.env` with the same Firebase project values plus the shared backend URL.

### 3. Minimal remote smoke plan

Ask your friend to verify these exact checks:

1. Launch app and authenticate as guest.
2. Create a device and confirm it persists after app restart.
3. Create a usage from device flow and confirm it shows in history.
4. Confirm monthly summary reflects the new usage.
5. Confirm guest insight access fails cleanly.
6. Sign in with a full account and confirm insight generation succeeds.
7. If possible, test one offline create followed by reconnect.

### 4. Coordination rule

If both of you are testing against the same shared backend and same Firebase project:

- do not share the same user account
- use separate guest sessions or separate full-account test users
- do not assume a clean database between runs

If you want deterministic results, reset only your own test user data before each pass.

## Recommended backend verification during smoke test

Watch backend logs while testing these routes:

- `GET /v1/devices`
- `POST /v1/devices`
- `PATCH /v1/devices/:deviceId`
- `DELETE /v1/devices/:deviceId`
- `POST /v1/electricity-usages`
- `PATCH /v1/electricity-usages/:usageId`
- `DELETE /v1/electricity-usages/:usageId`
- `GET /v1/electricity-usages?month=YYYY-MM`
- `GET /v1/monthly-summary?month=YYYY-MM`
- `POST /v1/generate-energy-insight`

Specifically confirm:

- `device_breakdown` submissions update each referenced device's `defaultDurationMinutes`
- usage mutations refresh summary and current streak synchronously
- usage mutations mark existing monthly insight stale
- guest sessions cannot access insight generation

## Exit criteria

Treat the migration as smoke-tested only if all of these are true:

- device CRUD works from mobile
- usage create works from mobile
- summary/history refresh after create
- current streak is returned with summary
- guest/full-account insight policy behaves correctly
- one offline create survives reconnect
- direct backend `PATCH` and `DELETE` usage routes behave correctly
