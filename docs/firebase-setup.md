# Firebase Setup

This repo uses two different Firebase integration modes:

- `apps/mobile`: Firebase client SDK for Expo
- `apps/api`: Firebase Admin SDK for backend verification and Firestore access

## Current mobile setup

The mobile app reads Firebase config from environment variables in [`apps/mobile/src/config/firebase.ts`](../apps/mobile/src/config/firebase.ts).

Required variables:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

Optional variable:

```bash
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

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

### Local backend runs

For local development against a real Firebase project, provide Admin credentials with one of the standard ADC methods.

The simplest path is:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
```

In that case, `service-account.json` is required locally, but it should stay outside the repo or be gitignored. Do not commit service account credentials.

### Cloud Run backend runs

For Cloud Run, a checked-in `service-account.json` is usually not needed.

Use the Cloud Run service account attached to the deployment and grant it the Firebase / Firestore permissions the backend needs. The Admin SDK can use those runtime credentials automatically.

## What is and is not required today

Required for mobile:

- Expo Firebase env vars

Required for local backend runs against real Firebase:

- Admin credentials via ADC, commonly `GOOGLE_APPLICATION_CREDENTIALS`

Not required for the current codebase:

- committed `service-account.json`
- `google-services.json`
- `GoogleService-Info.plist`

## Recommended local setup

1. Create a Firebase project.
2. Enable Firebase Auth and Firestore.
3. Register the mobile app in Firebase so you can obtain the client config values.
4. Put the mobile config values into your Expo env setup.
5. Create or use a service account for local backend development.
6. Export `GOOGLE_APPLICATION_CREDENTIALS` before running `apps/api`.

## Why tests did not require credentials

The current backend slices were verified with public-interface tests using injected doubles for Firebase-dependent behavior. That is enough to validate route contracts and backend rules without requiring live Firebase credentials during test runs.
