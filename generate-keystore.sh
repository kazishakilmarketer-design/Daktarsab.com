#!/bin/bash

# Generates a keystore file for signing the Android app.
# Make sure you have the Java JDK installed so `keytool` is available.

echo "🔑 Generating Android Upload Keystore..."

echo "Enter a password when prompted (remember it!)."
keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload

echo "✅ Keystore created as upload-keystore.jks"
echo "⚠️ IMPORTANT: Keep this file completely secure and DO NOT commit it to version control."
echo "Move it to the android/app/ directory."
