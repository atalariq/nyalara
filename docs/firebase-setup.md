# Firebase Setup

This repo uses two different Firebase integration modes:

- `apps/mobile`: Firebase client SDK for Expo
- `apps/api`: Firebase Admin SDK for backend verification and Firestore access

## Required CLIs

For a practical local setup, install:

- Firebase CLI: `firebase`
- Google Cloud CLI: `gcloud`

Example installation references:

- Firebase CLI: <https://firebase.google.com/docs/cli>
- Google Cloud CLI: <https://cloud.google.com/sdk/docs/install>

Verify both are available:

```bash
firebase --version
gcloud --version
```

## Current mobile setup

The mobile app reads Firebase config from environment variables in [`apps/mobile/src/config/firebase.ts`](../apps/mobile/src/config/firebase.ts).

Start from [`apps/mobile/.env.example`](../apps/mobile/.env.example) and copy it to a local `.env` file for the mobile app.

The local auth integration target for this repo is the Firebase project `nyalara`.
The local protected mobile API target is `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000`.

Required variables:

```bash
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=nyalara.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=nyalara
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=nyalara.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

Optional variable:

```bash
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

Typical setup:

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

## Dev-only guest session verification

Issue `#9` uses a local/dev-only verification path rather than product behavior. The goal is to mint a real Firebase anonymous-auth token from the mobile client configuration outside Expo runtime, then use it against the first protected backend route.

From the repo root:

```bash
pnpm --filter mobile auth:mint-guest-token
```

That package script runs `apps/mobile/scripts/mint-anonymous-auth-token.mjs`.

That script defaults to `apps/mobile/.env`, uses the Firebase web API key plus project ID from that file, and prints a minimal JSON object with:

- `projectId`
- `uid`
- `isAnonymous`
- `idToken`

Example output:

```json
{"projectId":"nyalara","uid":"guest-uid","isAnonymous":true,"idToken":"<firebase-id-token>"}
```

Use the returned `idToken` as a bearer token for the first protected backend smoke test:

```bash
curl -X POST http://10.0.2.2:3000/v1/calculate-electricity \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <idToken>" \
  -d '{
    "inputType": "kwh",
    "timezoneOffsetMinutes": 420,
    "input": {
      "kwh": 120,
      "meterStart": null,
      "meterEnd": null,
      "unit": "kwh"
    },
    "period": {
      "startDate": "2026-05-01",
      "endDate": "2026-05-31",
      "month": "2026-05"
    }
  }'
```

The expected success path is a verified JSON response from `POST /v1/calculate-electricity`.

### Do we need `google-services.json` or `GoogleService-Info.plist`?

Not for the current mobile codepath.

The app is using the Firebase JavaScript SDK through Expo, not a native Firebase integration. That means the Expo env vars above are the active configuration source today.

You would need `google-services.json` and/or `GoogleService-Info.plist` later if the mobile app starts using native Firebase-dependent features such as:

- `@react-native-firebase`
- Firebase Cloud Messaging push notifications
- Crashlytics
- native Analytics integrations
- Dynamic Links or other native-only setup flows

## Current backend setup

The backend initializes Firebase Admin in [`apps/api/src/features/platform/firebase/firebase-admin.ts`](../apps/api/src/features/platform/firebase/firebase-admin.ts) with plain `initializeApp()`.

That means credentials come from Application Default Credentials.

Start from [`apps/api/.env.example`](../apps/api/.env.example) and copy it to a local `.env` file for the API app.

For this slice, the backend must use Admin credentials for the same Firebase project, `nyalara`, and use Firestore in that project as its local data target.

### Local backend runs

For local development against a real Firebase project, provide Admin credentials with one of the standard ADC methods.

The simplest path is:

```bash
cp apps/api/.env.example apps/api/.env
export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
```

Keep `GOOGLE_CLOUD_PROJECT=nyalara` in `apps/api/.env` and make sure the service account file also belongs to `nyalara`.

In that case, `service-account.json` is required locally, but it should stay outside the repo or be gitignored. Do not commit service account credentials.

If you use a shell env loader, keep the real value in `apps/api/.env` and avoid committing it.

The current backend entrypoint also reads `apps/api/.env` automatically for local runs, so `pnpm --filter api dev` and `pnpm --filter api start` will pick up values from that file without an extra `source .env` step.

## Local auth smoke-test backend target

Use the API dev server on port `3000` as the follow-on auth smoke-test target.

- Android emulator target: `http://10.0.2.2:3000`
- iOS simulator target: `http://localhost:3000`
- Physical device target: `http://<your-machine-lan-ip>:3000`

The acceptance target for future auth smoke tests in this repo is `http://10.0.2.2:3000`, because it gives the Android emulator a stable route to the same local backend process started with `pnpm --filter api dev`.

### Cloud Run backend runs

For Cloud Run, a checked-in `service-account.json` is usually not needed.

Use the Cloud Run service account attached to the deployment and grant it the Firebase / Firestore permissions the backend needs. The Admin SDK can use those runtime credentials automatically.

## What is and is not required today

Required for mobile:

- Expo Firebase env vars
- `apps/mobile/.env` based on `apps/mobile/.env.example`

Required for local backend runs against real Firebase:

- Admin credentials via ADC, commonly `GOOGLE_APPLICATION_CREDENTIALS`
- `apps/api/.env` based on `apps/api/.env.example`

Not required for the current codebase:

- committed `service-account.json`
- `google-services.json`
- `GoogleService-Info.plist`

## Recommended local setup

1. Install `firebase` and `gcloud`.
2. Authenticate both CLIs:

```bash
firebase login
gcloud auth login
gcloud auth application-default login
```

3. Create or select a Google Cloud / Firebase project:

```bash
gcloud config set project nyalara
firebase use nyalara
```

4. Enable Firebase Auth and Firestore for `nyalara`.
5. Register the mobile app in Firebase so you can obtain the client config values.
6. Copy `apps/mobile/.env.example` to `apps/mobile/.env` and fill in the Firebase web config.
7. Create or use a service account for local backend development.
8. Copy `apps/api/.env.example` to `apps/api/.env`.
9. Set `GOOGLE_APPLICATION_CREDENTIALS` to the local service account file path before running `apps/api`.
10. Seed the canonical emission factor document required by the electricity MVP:

```bash
pnpm --filter api seed:emission-factors
```

### Getting a local service account file

One common workflow is:

1. Open Google Cloud Console or Firebase Console for the project.
2. Create a service account with the permissions your backend needs.
3. Download the JSON key to a secure local path outside the repo.
4. Point `GOOGLE_APPLICATION_CREDENTIALS` at that file.

Do not commit the JSON key.

## Why tests did not require credentials

The current backend slices were verified with public-interface tests using injected doubles for Firebase-dependent behavior. That is enough to validate route contracts and backend rules without requiring live Firebase credentials during test runs.
