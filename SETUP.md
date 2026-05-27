# Nyalara Setup Guide

This guide helps a new developer get Nyalara running locally. Use it together with the root [README.md](README.md), [CONTRIBUTING.md](CONTRIBUTING.md), and [docs/firebase-setup.md](docs/firebase-setup.md).

## Prerequisites

Install these tools first:

- `git`
- Node.js 20 or newer
- `pnpm` 9
- Firebase CLI
- Google Cloud CLI

For mobile development:

- Android Studio with an emulator, or
- Xcode with an iOS simulator on macOS

Verify the toolchain:

```bash
node -v
pnpm -v
firebase --version
gcloud --version
```

## Clone And Install

```bash
git clone <your-fork-or-repo-url> nyalara
cd nyalara
pnpm install
```

## Configure Environment Files

### Mobile app

Create the mobile environment file:

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Fill in the required values:

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

Useful local API targets:

- Android emulator: `http://10.0.2.2:3000`
- iOS simulator: `http://127.0.0.1:3000`
- Physical device: `http://<your-lan-ip>:3000`

### Frontend Using Local Backend

When frontend needs to test against backend running on the same developer machine:

1. Start backend from repo root:

```bash
pnpm --filter api dev
```

2. Confirm backend is reachable:

```bash
curl http://localhost:3000/v1/health
```

3. Set `EXPO_PUBLIC_API_BASE_URL` in `apps/mobile/.env` based on FE runtime target:

- Android emulator: `http://10.0.2.2:3000`
- iOS simulator: `http://127.0.0.1:3000`
- Physical device: `http://<your-lan-ip>:3000` (same Wi-Fi as laptop)

Android physical-device workaround (when LAN routing/firewall is problematic):

```bash
adb reverse tcp:3000 tcp:3000
```

Then you can use:

- `EXPO_PUBLIC_API_BASE_URL=http://localhost:3000`

4. Restart Expo after changing `.env`:

```bash
pnpm --filter mobile dev
```

### Backend API

Create the API environment file:

```bash
cp apps/api/.env.example apps/api/.env
```

Set at least:

- `GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json`
- `GOOGLE_CLOUD_PROJECT=<your-project-id>`
- `GEMINI_API_KEY=<your-key>`
- `GEMINI_MODEL=gemini-2.5-flash-lite`

Do not commit `.env` files or service account credentials.

## Firebase And Cloud Setup

Follow [docs/firebase-setup.md](docs/firebase-setup.md) for the detailed Firebase and Admin SDK setup. At minimum:

1. Log in with `firebase` and `gcloud`.
2. Select the correct Firebase and Google Cloud project.
3. Enable Firebase Auth and Firestore.
4. Configure Google sign-in for the mobile app.
5. Provide local Admin credentials for the API.

Seed electricity emission factors before testing energy flows:

```bash
pnpm --filter api seed:emission-factors
```

Seed references and methodology notes:

- `docs/emission-factors-sources.md`

## Run Locally

Start the backend API:

```bash
pnpm --filter api dev
```

Start the mobile app:

```bash
pnpm --filter mobile dev
```

Then open the target platform from Expo:

- Press `a` for Android
- Press `i` for iOS on macOS

## Common Commands

From the repository root:

```bash
pnpm build
pnpm test
pnpm typecheck
```

Useful context-specific commands:

```bash
pnpm --filter api test
pnpm --filter mobile dev
./apps/mobile/node_modules/.bin/tsc --noEmit -p apps/mobile/tsconfig.json
```

## Verification

After setup, use [docs/smoke-testing-guide.md](docs/smoke-testing-guide.md) to verify that authentication, device flows, history, and AI insights work together.

## Deploying The Backend

The backend is designed to run on Google Cloud Run.

Example deploy flow:

```bash
gcloud auth login
gcloud config set project <your-project-id>
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
gcloud run deploy nyalara-api \
  --source apps/api \
  --region <your-region> \
  --allow-unauthenticated \
  --service-account <runtime-sa>@<project-id>.iam.gserviceaccount.com \
  --set-env-vars GOOGLE_CLOUD_PROJECT=<your-project-id>,GEMINI_MODEL=gemini-2.5-flash-lite \
  --set-env-vars GEMINI_API_KEY=<your-gemini-api-key>
```

After deployment, update `EXPO_PUBLIC_API_BASE_URL` in `apps/mobile/.env`.

## Known Caveat

`apps/mobile/src/features/chat/hooks/useGeminiChat.ts` still contains a direct mobile Gemini integration for experimental work. Treat it as non-production behavior until that flow is moved fully behind backend-owned AI access.
