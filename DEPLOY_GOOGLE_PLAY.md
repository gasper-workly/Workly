## Google Play production release (Workly)

This repo is a Capacitor app that loads the web UI from Vercel (`capacitor.config.ts`).

### 1) Accept Play App Signing

In Play Console:
- **Setup** → **App integrity**
- **Play App Signing** → accept the ToS
- Choose **Google-generated app signing key** (recommended)

### 2) Create your upload keystore (one-time)

Run these from PowerShell (Windows) in the repo root:

```powershell
.\android\keystore\create-upload-keystore.ps1
.\android\keystore\export-upload-certificate.ps1
```

- The `.jks` stays on your machine and is ignored by git.
- Back up the `.jks` + passwords.
- If Play Console asks for an **upload certificate**, upload the generated `workly-upload-cert.pem`.

### 3) Bump Android version (every release)

Edit `android/app/build.gradle`:
- Increase `versionCode` (must be higher than the last upload)
- Set `versionName` (human readable)

### 4) Build web + sync native

```bash
npm run build
npx cap sync android
```

### 5) Build a signed `.aab` (Android Studio)

Android Studio:
- Open the `android/` folder
- **Build** → **Generate Signed Bundle / APK…**
- Select **Android App Bundle**
- Select your upload keystore: `android/keystore/workly-upload.jks` (alias `upload`)
- Build **release**

### 6) Upload to Play Console production

Play Console:
- **Release** → **Production** → **Create new release**
- Upload the `.aab`
- Add release notes
- Complete required policy forms (Data safety, Content rating, Target audience, etc.)
- Submit for review / publish

