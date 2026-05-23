# API

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Firebase setup for local backend runs is documented in [../../docs/firebase-setup.md](../../docs/firebase-setup.md). The API entrypoint now reads `apps/api/.env` automatically for local runs.

In particular, local Firebase Admin usage still needs Application Default Credentials, typically via `GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json`.

To seed the canonical electricity emission factor used by the MVP:

```bash
pnpm seed:emission-factors
```
