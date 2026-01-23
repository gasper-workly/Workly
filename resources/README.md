# Capacitor icon + splash assets

Drop your master images here, then generate all iOS/Android sizes.

## Files you need
- `icon.png` (1024×1024 PNG)
- `splash.png` (2732×2732 PNG)

## Generate
From the project root:

```bash
npm install
npm run assets
```

Then sync native projects:

```bash
npx cap sync ios
npx cap sync android
```

Open Xcode / Android Studio and rebuild.

