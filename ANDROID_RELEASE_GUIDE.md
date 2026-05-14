# Android Production Deployment Guide

This guide covers everything you need to know to generate a production `.aab` file for the Google Play Store using Capacitor.

## 1. Setup Keystore

If you haven't generated a keystore yet, you can use the provided script (make sure you have Java installed to use `keytool`):

```bash
./generate-keystore.sh
```

Follow the prompts to enter a secure password and details. Make sure you answer "yes" (or "y") when to confirm.

By default, the script creates `upload-keystore.jks` with the alias `upload`. 
Move this file to the `android/app/` folder:

```bash
mv upload-keystore.jks android/app/
```

**⚠️ IMPORTANT:** Never commit your `.jks` file to your Git repository!

## 2. Configure Credentials

We've updated `android/app/build.gradle` to read credentials dynamically from Gradle properties so you don't expose your password in code.

Create or update `android/gradle.properties` (or add them securely to your CI/CD pipeline) with the following details:

```properties
# android/gradle.properties
MYAPP_UPLOAD_STORE_FILE=upload-keystore.jks
MYAPP_UPLOAD_KEY_ALIAS=upload
MYAPP_UPLOAD_STORE_PASSWORD=your_actual_password_here
MYAPP_UPLOAD_KEY_PASSWORD=your_actual_password_here
```

## 3. Generate App Icons and Splash Screens

To easily generate all required icons and splash screen sizes automatically:

1. Place your main high-res icon file at `assets/icon.png` (at least 1024x1024).
2. Place your main splash screen image at `assets/splash.png` (at least 2732x2732).
3. Run the Capacitor Assets generator:

```bash
npx @capacitor/assets generate --android
```

This will automatically create all the `mipmap` sizes required by Android.

## 4. Build the App Bundle (.aab)

Whenever you make changes to your Vite web app (`src/`), you must sync them to Android:

```bash
npm run build
npx cap sync android
```

To build the final production bundle, run:

```bash
cd android
./gradlew bundleRelease
```

Once the build successfully completes, you can find the final `.aab` file located here:
`android/app/build/outputs/bundle/release/app-release.aab`

You can now upload this file to the **Google Play Console**!
