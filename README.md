# Nyalara ⚡

**Mobile-first electricity tracking that starts from the devices you know.**

Nyalara turns household device activity into clear daily patterns, estimated carbon impact, and practical AI-powered recommendations — helping people understand and improve their energy habits without needing to think in raw technical numbers first.

## Highlights

- 📱 **Device-centric tracking** — add household devices, toggle them on/off, and see real-time electricity usage
- 📊 **Dashboard & history** — daily stats, weekly charts, carbon budget progress, and streak tracking
- 🤖 **AI insights** — Gemini-powered monthly energy recommendations grounded in real emission factors
- 🌍 **8 countries, 15 emission factors** — Indonesia (6 regional grids), Malaysia, Singapore, France, Germany, UK, Australia, and USA with verified source attribution
- 🔒 **Backend-authoritative** — verified calculations, server-only summary writes, and user-scoped Firestore security rules
- 🧪 **73 tests, 77% coverage** — integration and unit tests across all core backend features

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│  Mobile App  │────▶│  Hono API   │────▶│    Firestore     │
│  Expo + RN   │     │  + Zod OAPI  │     │  (user-scoped)   │
└──────┬───────┘     └──────┬───────┘     └──────────────────┘
       │                    │
       │              ┌─────┴──────┐
       │              │  Gemini AI  │
       │              └────────────┘
       │
 ┌─────┴───────┐
 │ Firebase Auth │
 └──────────────┘
```

- **Mobile app** owns the user experience, forms, and local optimistic state
- **Backend API** handles verified calculations, persistence, summaries, and insight generation
- **Firestore** stores user-scoped data with security rules (server-only writes for summaries and insights)
- **Firebase Auth** provides email, Google, and guest authentication
- **Gemini** generates contextual energy-saving insights

## Screens

| Screen           | Purpose                                           |
| ---------------- | ------------------------------------------------- |
| Onboarding       | Welcome, intro carousel, house type, device setup |
| Dashboard        | Daily stats, carbon progress, AI recommendations  |
| Energy           | Real-time kWh, weekly chart, room breakdown       |
| Devices          | Inventory management, toggle on/off, edit/delete  |
| Profile          | User info, household preferences, PLN rate        |
| Goals            | Carbon budget targets, sustainability checkboxes  |
| Activity History | Day-by-day usage log with session details         |

## Tech Stack

| Layer       | Technology            | Purpose                           |
| ----------- | --------------------- | --------------------------------- |
| Client      | Expo + React Native   | Cross-platform mobile app         |
| Styling     | NativeWind (Tailwind) | Design system & responsive UI     |
| State       | Zustand               | Lightweight state management      |
| Backend API | Hono + Zod OpenAPI    | Type-safe REST API with docs      |
| Validation  | Zod                   | Request/response validation       |
| Auth        | Firebase Auth         | Email, Google, guest sign-in      |
| Database    | Firestore             | NoSQL with security rules         |
| AI          | Gemini 2.5 Flash Lite | Energy insight generation         |
| Deploy      | Google Cloud Run      | Serverless backend hosting        |
| Contracts   | `@nyalara/shared`     | Shared types between mobile & API |

## Quick Start

```bash
git clone https://github.com/atalariq/nyalara.git
cd nyalara
pnpm install
```

Set up environment files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
```

Run the backend and mobile app:

```bash
pnpm --filter api dev
pnpm --filter mobile dev
```

See [SETUP.md](SETUP.md) for full onboarding and [docs/firebase-setup.md](docs/firebase-setup.md) for Firebase configuration.

## Testing

```bash
pnpm test                # run all tests
pnpm typecheck           # type-check all packages
pnpm --filter api test   # backend tests only (73 tests, 77% coverage)
```

## Live Access

- **Backend API**: [https://nyalara-api-prod-933475028343.asia-southeast2.run.app](https://nyalara-api-prod-933475028343.asia-southeast2.run.app)
- **API Docs**: [https://nyalara-api-prod-933475028343.asia-southeast2.run.app/v1/ui](https://nyalara-api-prod-933475028343.asia-southeast2.run.app/v1/ui)
- **Health Check**: [https://nyalara-api-prod-933475028343.asia-southeast2.run.app/v1/health](https://nyalara-api-prod-933475028343.asia-southeast2.run.app/v1/health)

## Repository Structure

```
nyalara/
├── apps/api/         # Hono backend API
├── apps/mobile/      # Expo React Native app
├── packages/shared/  # Shared TypeScript contracts
└── docs/             # Product & technical documentation
```

## Documentation

- [SETUP.md](SETUP.md) — Full local setup guide
- [CONTRIBUTING.md](CONTRIBUTING.md) — Branch strategy, commit conventions, PR workflow
- [docs/PRD.md](docs/PRD.md) — Product requirements
- [docs/firebase-setup.md](docs/firebase-setup.md) — Firebase and Admin SDK configuration
- [docs/emission-factors-sources.md](docs/emission-factors-sources.md) — Emission factor sources and methodology
- [docs/smoke-testing-guide.md](docs/smoke-testing-guide.md) — End-to-end verification guide
- [docs/ios-setup-guide.md](docs/ios-setup-guide.md) — iOS development setup on macOS
- [docs/eas-build-guide.md](docs/eas-build-guide.md) — Building APK/IPA with EAS
- [apps/api/README.md](apps/api/README.md) — API endpoint reference
- [CONTEXT-MAP.md](CONTEXT-MAP.md) — Internal context index

## License

[MIT](LICENSE)
