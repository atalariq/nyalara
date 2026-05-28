# EAS Build Guide

This guide covers building the Nyalara mobile app for distribution using Expo Application Services (EAS).

## Prerequisites

- Expo account with access to project `5798d034-0bfc-419d-9788-f87a714d5ec1`
- EAS CLI installed (`npm install -g eas-cli`)
- Logged in: `eas login`

## Environment Secrets

The `eas.json` configuration references a `GOOGLE_SERVICES_JSON` secret. Set it up:

```bash
# Read the current google-services.json and encode it
cat apps/mobile/google-services.json | base64

# Create the secret in EAS
eas secret:create --name GOOGLE_SERVICES_JSON --value <base64-encoded-value>
```

Also set any `.env` variables needed at build time:

```bash
eas secret:create --name EXPO_PUBLIC_API_BASE_URL --value "https://nyalara-api-prod-933475028343.asia-southeast2.run.app"
eas secret:create --name EXPO_PUBLIC_FIREBASE_API_KEY --value "your-key"
# ... repeat for each EXPO_PUBLIC_* variable
```

## Build Profiles

The `eas.json` defines three build profiles:

| Profile       | Purpose                         | Distribution |
| ------------- | ------------------------------- | ------------ |
| `development` | Development client with dev tools | Internal     |
| `preview`     | Internal testing APK             | Internal     |
| `production`  | Release builds for distribution   | Store/Internal |

## Build Commands

### Android APK (for submission/testing)

```bash
cd apps/mobile
eas build --platform android --profile preview
```

This produces an APK file. After the build completes, EAS provides a download link. Use this link as the "URL Akses" for submissions.

### Android AAB (for Play Store)

```bash
eas build --platform android --profile production
```

### iOS IPA (requires Apple Developer account)

```bash
eas build --platform ios --profile development
```

For App Store submission:

```bash
eas build --platform ios --profile production
```

Then submit:

```bash
eas submit --platform ios --profile production
```

## Checking Build Status

```bash
eas build:list
```

Or visit the Expo dashboard: [https://expo.dev/accounts/raharinda/projects/nyalara](https://expo.dev/accounts/raharinda/projects/nyalara)

## Local Development Alternative

For day-to-day development, you don't need EAS. Use the local dev server:

```bash
# Start the backend
pnpm --filter api dev

# Start the mobile app
pnpm --filter mobile dev

# Press 'a' for Android emulator, 'i' for iOS simulator
```

## Troubleshooting

### Build fails with "GOOGLE_SERVICES_JSON not found"

Ensure the secret is set in EAS:

```bash
eas secret:list
```

If missing, follow the "Environment Secrets" section above.

### Environment variables not available at build time

All `EXPO_PUBLIC_*` variables must be set as EAS secrets or provided via `eas.json` `env` section. They are embedded at build time, not runtime.

### iOS build requires Apple Developer Team

iOS builds require a paid Apple Developer account and a provisioning profile configured in Expo. For simulator-only testing, use the local dev server (`pnpm --filter mobile dev` then press `i`).

## Related Docs

- [ios-setup-guide.md](ios-setup-guide.md) — iOS development setup on macOS
- [../../SETUP.md](../../SETUP.md) — Full project setup
- [../../CONTRIBUTING.md](../../CONTRIBUTING.md) — Collaboration rules