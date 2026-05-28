# iOS Development Setup Guide

This guide covers setting up the Nyalara mobile app for iOS development on macOS.

## Prerequisites

Install these tools before proceeding:

| Tool          | Version       | Install                                          |
| ------------- | ------------- | ------------------------------------------------ |
| Xcode         | 16+           | Mac App Store or `xcode-select --install`        |
| Node.js       | 20+           | `fnm install 20` or download from nodejs.org     |
| pnpm          | 9+            | `npm install -g pnpm@9`                          |
| CocoaPods     | latest        | `sudo gem install cocoapods`                     |
| Watchman      | latest        | `brew install watchman`                          |
| Expo CLI      | latest        | `npm install -g eas-cli`                         |

Verify your toolchain:

```bash
xcodebuild -version    # Xcode 16+
node -v                # v20+
pnpm -v                # 9+
pod --version          # 1.14+
watchman --version     # any recent
```

## Clone and Install

```bash
git clone https://github.com/atalariq/nyalara.git
cd nyalara
pnpm install
```

## Configure Environment

### Mobile environment

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Fill in the required values in `apps/mobile/.env`:

- `EXPO_PUBLIC_API_BASE_URL` — Backend API URL (use `http://127.0.0.1:3000` for local)
- All `EXPO_PUBLIC_FIREBASE_*` values from your Firebase project settings
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` and `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

### Backend environment (for local API testing)

```bash
cp apps/api/.env.example apps/api/.env
```

See [../../SETUP.md](../../SETUP.md) for full backend setup details.

### Firebase configuration

The `GoogleService-Info.plist` file for iOS is already included in the repository at `apps/mobile/GoogleService-Info.plist`. No additional download is needed.

If you need to regenerate it:

1. Go to [Firebase Console](https://console.firebase.google.com/) → Nyalara project
2. Project Settings → iOS app → Download `GoogleService-Info.plist`
3. Place it at `apps/mobile/GoogleService-Info.plist`

## Run the App

### iOS Simulator (recommended for development)

1. Start the backend API (if testing against local):

   ```bash
   pnpm --filter api dev
   ```

2. Start the mobile app:

   ```bash
   pnpm --filter mobile dev
   ```

3. Press `i` in the Expo terminal to open the iOS simulator.

### Physical iPhone

For testing on a physical iPhone:

1. You need an Apple Developer account ($99/year) enrolled in the Apple Developer Program.
2. Open `apps/mobile/ios/` in Xcode (generated after first `expo run:ios`).
3. Select your team and provisioning profile.
4. Build and run on your connected device.

Alternatively, use EAS Build:

```bash
eas build --platform ios --profile development
```

See [eas-build-guide.md](eas-build-guide.md) for full EAS build instructions.

## Common Issues

### CocoaPods errors

```bash
cd apps/mobile/ios && pod install && cd ../../..
```

If issues persist:

```bash
cd apps/mobile/ios && pod deintegrate && pod install && cd ../../..
```

### Metro bundler cache issues

```bash
pnpm --filter mobile start -- --clear
```

### Xcode build errors

1. Open Xcode → Settings → Locations → confirm Command Line Tools points to your Xcode installation
2. Clean build folder: `Product → Clean Build Folder` (⇧⌘K)
3. Delete derived data: `~/Library/Developer/Xcode/DerivedData`

### "Unable to open file" for GoogleService-Info.plist

Confirm the file exists at `apps/mobile/GoogleService-Info.plist` and that the Xcode project references it correctly. Run `cd apps/mobile && npx expo prebuild --clean` to regenerate native projects.

### iOS simulator not found

```bash
xcrun simctl list devices
```

If no simulators appear, open Xcode → Settings → Platforms and install the iOS platform.

## Related Docs

- [../../SETUP.md](../../SETUP.md) — Full setup guide
- [../../CONTRIBUTING.md](../../CONTRIBUTING.md) — Collaboration rules
- [eas-build-guide.md](eas-build-guide.md) — EAS build for APK/IPA