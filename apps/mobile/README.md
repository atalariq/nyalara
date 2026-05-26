# Nyalara Mobile App

This package contains the Expo and React Native client for Nyalara. It owns the user-facing experience for authentication, device onboarding, dashboard views, energy history, and insight presentation.

## Quick Start

From the repository root:

```bash
pnpm install
pnpm --filter mobile dev
```

## Local Requirements

- `apps/mobile/.env` based on `apps/mobile/.env.example`
- A reachable API base URL
- Firebase client configuration for Expo

See [../../SETUP.md](../../SETUP.md) for full onboarding and [../../docs/firebase-setup.md](../../docs/firebase-setup.md) for Firebase-specific details.

## Useful Notes

- Routing lives under `src/app`.
- Product-facing screens and flows live under `src/features`.
- The mobile app currently presents a device-centric electricity tracking experience while the platform evolves toward stronger backend verification.

## Related Docs

- [../../README.md](../../README.md)
- [../../SETUP.md](../../SETUP.md)
- [../../docs/PRD.md](../../docs/PRD.md)
