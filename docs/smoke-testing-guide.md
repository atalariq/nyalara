# Smoke Testing Guide

Use this guide after completing [SETUP.md](../SETUP.md). Its purpose is simple: confirm that the mobile app, authentication, backend API, and core electricity flows work together on a real local setup.

## What This Guide Covers

- authentication
- device onboarding and device persistence
- dashboard and history refresh
- AI insight access
- basic end-to-end electricity tracking behavior

## Before You Start

Make sure:

- `apps/mobile/.env` is configured
- `apps/api/.env` is configured
- Firebase Auth and Firestore are available
- the backend emission factor has been seeded

Start the backend:

```bash
pnpm --filter api dev
```

Start the mobile app:

```bash
pnpm --filter mobile dev
```

## Recommended Smoke Test Pass

Run these checks in order.

### 1. Authentication

1. Open the app.
2. Create an account with email, or sign in with Google.
3. Confirm the app reaches the main experience without auth errors.
4. Optionally confirm guest access works for exploration.

### 2. Device Onboarding

1. Add a device during onboarding or from the devices screen.
2. Confirm the device appears in the list.
3. Edit or remove the device if that flow is exposed in the current UI.
4. Restart the app and confirm the device state persists.

### 3. Dashboard Refresh

1. Toggle device usage or follow the current device-monitoring flow.
2. Return to the dashboard.
3. Confirm the dashboard shows updated daily usage information.

### 4. Energy And History Views

1. Open the energy screen.
2. Confirm the screen loads without API or auth failures.
3. Open the history flow.
4. Confirm recorded usage appears and the screen handles empty states cleanly.

### 5. AI Insights

1. Use an account that has access to the current insight flow.
2. Confirm recommendations or insight content can load successfully.
3. If insight generation fails, confirm the UI degrades predictably instead of crashing.

## Backend Checks

While running the smoke test, confirm:

- `GET /v1/health` responds successfully
- the backend starts without Firebase credential errors
- protected routes accept a valid authenticated session

If needed, manually verify the health endpoint:

```bash
curl http://localhost:3000/v1/health
```

## Exit Criteria

Treat the local setup as verified when:

- sign-in works
- the app can persist at least one device
- dashboard and history views load successfully
- the core energy flow is usable end to end
- AI insight behavior is understandable and stable enough for demo use
