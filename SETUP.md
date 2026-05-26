# Carbon Tracker Setup Guide

This guide is for peers/new developers who want a full local setup:

- clone and install
- Firebase config
- backend local run + deploy
- mobile build/run
- verification/testing
- agentic workflow usage

For domain and product context, read:

- [docs/PRD.md](docs/PRD.md)
- [CONTEXT-MAP.md](CONTEXT-MAP.md)
- [AGENTS.md](AGENTS.md)

## 1. Prerequisites

Install these first:

- `git`
- `node` (recommended: Node 20+)
- `pnpm` (repo uses `pnpm@9`)
- `firebase` CLI
- `gcloud` CLI

Mobile local development:

- Android: Android Studio + emulator
- iOS: Xcode (macOS only)
- Expo Dev Client support (this app uses native modules)

Verify:

```bash
node -v
pnpm -v
firebase --version
gcloud --version
```

## 2. Clone And Install

```bash
git clone <your-fork-or-repo-url> carbon-tracker
cd carbon-tracker
pnpm install
```

## 3. Environment Setup

### 3.1 Mobile env

Copy the mobile template:

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Fill required values in `apps/mobile/.env`:

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

Optional:

- `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `EXPO_PUBLIC_ENABLE_STARTUP_TELEMETRY=true` (for startup timing logs)

Local backend URL examples:

- Android emulator: `http://10.0.2.2:3000`
- iOS simulator: `http://127.0.0.1:3000`
- physical device: `http://<your-lan-ip>:3000`

### 3.2 API env

Copy the API template:

```bash
cp apps/api/.env.example apps/api/.env
```

Fill `apps/api/.env`:

- `GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json`
- `GOOGLE_CLOUD_PROJECT=<your-project-id>`
- `GEMINI_API_KEY=<your-key>`
- `GEMINI_MODEL=gemini-2.5-flash-lite` (or your preferred model)

Important:

- do not commit `.env` files
- do not commit service account JSON keys

## 4. Firebase Project Setup

Follow [docs/firebase-setup.md](docs/firebase-setup.md) for details. Minimum checklist:

1. `firebase login`
2. `gcloud auth login`
3. `gcloud auth application-default login`
4. Select project in both CLIs
5. Enable Firebase Auth + Firestore
6. Configure OAuth clients for Google sign-in

Seed emission factors (required for electricity flows):

```bash
pnpm --filter api seed:emission-factors
```

## 5. Run Locally

Start backend:

```bash
pnpm --filter api dev
```

Start mobile:

```bash
pnpm --filter mobile dev
```

Then run a platform:

- press `a` in Expo terminal for Android
- press `i` for iOS (macOS)

## 6. Build/Test Commands

From repo root:

```bash
pnpm build
pnpm test
pnpm typecheck
```

Context-specific:

```bash
pnpm --filter api test
pnpm --filter mobile dev
./apps/mobile/node_modules/.bin/tsc --noEmit -p apps/mobile/tsconfig.json
```

Smoke test reference:

- [docs/smoke-testing-guide.md](docs/smoke-testing-guide.md)

## 7. Deploy Backend To Cloud Run

This repo can deploy backend (`apps/api`) to Cloud Run.

### 7.1 Prepare project and APIs

```bash
gcloud auth login
gcloud config set project <your-project-id>
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

### 7.2 Choose runtime service account

Create or select a service account for Cloud Run runtime, then grant Firestore/Firebase access required by API logic.

Minimum expectation:

- can read/write Firestore data used by API
- can verify Firebase Auth tokens via Admin SDK

### 7.3 Deploy

Example source deploy:

```bash
gcloud run deploy carbon-tracker-api \
  --source apps/api \
  --region <your-region> \
  --allow-unauthenticated \
  --service-account <runtime-sa>@<project-id>.iam.gserviceaccount.com \
  --set-env-vars GOOGLE_CLOUD_PROJECT=<your-project-id>,GEMINI_MODEL=gemini-2.5-flash-lite \
  --set-env-vars GEMINI_API_KEY=<your-gemini-api-key>
```

After deploy, take the Cloud Run URL and set:

- `EXPO_PUBLIC_API_BASE_URL=<cloud-run-url>` in `apps/mobile/.env`

## 8. Agentic Workflow (Matt Pocock Skills)

This repo includes local skills in `.agents/skills/` and an operator guide:

- [docs/AGENTIC-WORKFLOW.md](docs/AGENTIC-WORKFLOW.md)

Recommended sequence:

1. `grill-with-docs` to lock decisions
2. `to-issues` for thin vertical slices
3. `tdd` for one behavior at a time (RED -> GREEN -> REFACTOR)
4. `handoff` before ending a session

Session bootstrap references:

- [docs/PROMPTS.md](docs/PROMPTS.md)

## 9. Known Caveat

`apps/mobile/src/features/chat/hooks/useGeminiChat.ts` currently calls Gemini directly via `EXPO_PUBLIC_GEMINI_API_KEY`.

That is convenient for experimentation but not aligned with strict backend-only AI key policy. Treat it as temporary and avoid using production secrets on client builds.
