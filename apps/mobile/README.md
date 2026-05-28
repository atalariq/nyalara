# Nyalara Mobile App

The Expo and React Native client for Nyalara — a mobile-first electricity tracking experience built around household devices, daily patterns, and AI-powered insights.

## Features

| Screen               | What It Does                                                      |
| -------------------- | ----------------------------------------------------------------- |
| Welcome & Onboarding | Intro carousel, house type selection, device setup wizard         |
| Dashboard            | Daily kWh stats, carbon budget progress, AI recommendations       |
| Energy               | Real-time usage by room, weekly bar chart, environmental impact   |
| Devices              | Inventory list, toggle on/off, add/edit/delete with bottom sheets |
| Room Detail          | Per-location device breakdown                                     |
| Profile              | User info, household preferences, electricity rate                |
| Goals                | Carbon budget targets, sustainability checkboxes                  |
| Activity History     | Day-by-day usage log with kWh and efficiency metrics              |

## Navigation Architecture

```
RootLayout (Stack)
  ├── (auth)/         → Login, Register
  ├── (onboarding)/   → Welcome, Intro, HouseType, DeviceSetup
  └── (app)/          → Tab Navigator (Dashboard, Energy, Devices, Profile)
                       └→ EnergyHistory, Goals, Room/[location] (hidden)
```

- Custom `AppTabBar` for bottom navigation
- `HamburgerMenu` side drawer for Activity History and Goals
- Auth guard redirects unauthenticated users to onboarding

## Tech Stack

| Category      | Technology                                    |
| ------------- | --------------------------------------------- |
| Framework     | Expo SDK 52 + React Native                    |
| Routing       | Expo Router (file-based, typed routes)        |
| Styling       | NativeWind v4 (Tailwind CSS for React Native) |
| State         | Zustand (9 stores)                            |
| Forms         | React Hook Form + Zod                         |
| Auth          | Firebase Auth (email, Google, guest)          |
| Backend calls | Axios (token-injected ProtectedApiClient)     |
| Bottom sheets | @gorhom/bottom-sheet                          |
| Icons         | Lucide React Native                           |
| Animations    | React Native Reanimated + Animated API        |
| Fonts         | Manrope (5 weights)                           |

## Quick Start

From the repository root:

```bash
pnpm install
pnpm --filter mobile dev
```

### Environment Variables

Create `apps/mobile/.env` from the example file and fill in:

| Variable                                   | Purpose                   |
| ------------------------------------------ | ------------------------- |
| `EXPO_PUBLIC_API_BASE_URL`                 | Backend API base URL      |
| `EXPO_PUBLIC_FIREBASE_API_KEY`             | Firebase Web API key      |
| `EXPO_PUBLIC_FIREBASE_APP_ID`              | Firebase app ID           |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain      |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID`          | Firebase project ID       |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket   |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID        |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`         | Google Sign-In web client |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`         | Google Sign-In iOS client |

Useful local API targets values:

- Android emulator: `http://10.0.2.2:3000`
- iOS simulator: `http://127.0.0.1:3000`
- Physical device: `http://<your-lan-ip>:3000`

### Android Physical Device

If the API is running on your machine but the device can't reach it:

```bash
adb reverse tcp:3000 tcp:3000
```

Then use `EXPO_PUBLIC_API_BASE_URL=http://localhost:3000`.

## Local Development

```bash
pnpm --filter mobile dev           # Start Expo dev server
pnpm --filter mobile typecheck    # Type-check only
```

Press `a` for Android, `i` for iOS (macOS only), or scan the QR code for a physical device with Expo Go.

## Project Structure

```
apps/mobile/src/
├── app/               # Expo Router file-based routes
│   ├── (auth)/        # Login, Register
│   ├── (onboarding)/  # Welcome, Intro, HouseType, DeviceSetup
│   └── (app)/         # Authenticated tab screens
├── features/          # Feature modules (screens, hooks, services, stores)
│   ├── activity/      # Activity history
│   ├── auth/          # Login, register, guest, logout
│   ├── carbon-budget/# Monthly budget tracking
│   ├── chat/          # Gemini chat (feature-flagged)
│   ├── dashboard/     # Dashboard stats & AI recommendations
│   ├── devices/       # Device inventory, toggle, room detail
│   ├── energy/        # Energy screen, history, calculations
│   ├── goals/         # Carbon budget goals
│   ├── onboarding/    # Onboarding flow screens
│   └── profile/       # User profile & preferences
├── providers/         # React context providers (LoadingProvider)
└── shared/            # Shared UI components, config, theme
    ├── components/    # AppButton, AppTabBar, HamburgerMenu, etc.
    ├── config/        # Feature flags, carbon budget config
    └── theme/         # Color tokens
```

## Testing

Mobile tests use plain `.mjs` files colocated with source:

```bash
node apps/mobile/src/features/dashboard/lib/finite-number.test.mjs
```

There is no dedicated test runner configured for mobile. Tests are standalone Node scripts that can be run directly.

## Related Docs

- [Root README](../../README.md)
- [SETUP.md](../../SETUP.md) — Full setup guide
- [CONTRIBUTING.md](../../CONTRIBUTING.md) — Collaboration rules
- [docs/PRD.md](../../docs/PRD.md) — Product requirements
- [docs/ios-setup-guide.md](../../docs/ios-setup-guide.md) — iOS setup on macOS
- [docs/eas-build-guide.md](../../docs/eas-build-guide.md) — EAS build guide
