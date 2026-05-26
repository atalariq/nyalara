# Nyalara

Nyalara is a mobile-first electricity tracking app that helps people understand household energy usage through the devices they use every day. It turns device activity into clear daily patterns, estimated impact, and practical recommendations that support better energy habits.

<!--
## Live Access

- Backend API: https://<public-backend-url>
- Mobile release: https://github.com/<org>/<repo>/releases
-->

## Why Nyalara

Electricity is easy to consume and hard to interpret. Most people know when the bill feels high, but not which devices shape that pattern or how small behavior changes reduce waste. Nyalara makes electricity usage easier to see, track, and improve without requiring users to think in raw technical numbers first.

## Current Demo Highlights

- Email and Google sign-in, with guest access available for exploration
- Device onboarding and device inventory management
- Device toggle and monitoring flows for day-to-day electricity tracking
- Dashboard summaries for daily usage and progress
- Energy and history views for spotting usage patterns
- Smart recommendations and AI-powered insights
- Basic profile and household preference management

## Product Direction

Nyalara is evolving toward a stronger backend-verified platform. The current product experience stays device-centric, while the technical foundation moves toward verified usage records, cleaner synchronization, richer summaries, and more reliable insight generation.

## Simple User Flow

Sign in -> add household devices -> monitor electricity usage -> review daily patterns and history -> receive practical recommendations.

## Simple Data Flow

Mobile app -> Firebase Auth + backend API -> Firestore -> processed summaries and insights returned to the app.

## Core Tech Stack

- Expo and React Native
- TypeScript
- Hono
- Firebase Auth
- Firestore
- Google Cloud Run
- Gemini

## Repository Structure

- `apps/mobile` - Expo app for the Nyalara user experience
- `apps/api` - backend API for calculations, persistence, and insights
- `packages/shared` - shared contracts and types between mobile and backend

## For Developers

To get started quickly, install dependencies, follow the local environment setup guide, and run the mobile app together with the API from the repository root.

```bash
pnpm install
pnpm --filter api dev
pnpm --filter mobile dev
```

Continue with [SETUP.md](SETUP.md) for full local onboarding, [CONTRIBUTING.md](CONTRIBUTING.md) for collaboration rules, and [docs/firebase-setup.md](docs/firebase-setup.md) for Firebase-specific details.

## Further Reading

- [SETUP.md](SETUP.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [docs/PRD.md](docs/PRD.md)
- [apps/api/README.md](apps/api/README.md)
- [docs/firebase-setup.md](docs/firebase-setup.md)
- [docs/smoke-testing-guide.md](docs/smoke-testing-guide.md)
- [CONTEXT-MAP.md](CONTEXT-MAP.md)
