# Release APK Build Instructions

## Prerequisites
- Java JDK installed
- Android SDK configured
- React Native development environment set up

## Step 1: Generate a Release Keystore

If you don't have a release keystore yet, generate one using the following command:

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**Important:** 
- Replace `my-release-key.keystore` with your desired keystore filename
- Replace `my-key-alias` with your desired key alias
- Remember the passwords you set - you'll need them later!
- Keep this keystore file safe - you'll need it for all future app updates

## Step 2: Configure Keystore Properties

1. Copy the example file:
   ```bash
   cd android
   cp keystore.properties.example keystore.properties
   ```

2. Edit `keystore.properties` and fill in your actual values:
   ```
   storeFile=my-release-key.keystore
   storePassword=your-store-password
   keyAlias=my-key-alias
   keyPassword=your-key-password
   ```

   **Note:** The `storeFile` path should be relative to the `android/app` directory, or use an absolute path.

## Step 3: Build Release APK

### Option 1: Using npm script (Recommended)
```bash
npm run android:build:release
```

### Option 2: Using Gradle directly
```bash
cd android
./gradlew assembleRelease
```

The APK will be generated at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Step 4: Build Release AAB (for Google Play Store)

If you're publishing to Google Play Store, you should build an Android App Bundle (AAB) instead:

```bash
npm run android:build:bundle
```

Or using Gradle:
```bash
cd android
./gradlew bundleRelease
```

The AAB will be generated at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

## Troubleshooting

### If build fails with signing errors:
- Make sure `keystore.properties` exists and has correct values
- Verify the keystore file path is correct
- Check that passwords match what you set when creating the keystore

### Clean build:
If you encounter build issues, try cleaning first:
```bash
npm run android:clean
npm run android:build:release
```

## Security Notes

- **NEVER** commit `keystore.properties` or your release keystore file to version control
- Keep backups of your keystore file in a secure location
- If you lose your keystore, you won't be able to update your app on Google Play Store

