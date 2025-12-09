# Job Tracker - Mobile App

A React Native mobile application built with Expo, featuring seamless authentication and real-time job tracking.

## Features

- **Google Sign-In**: Secure authentication integrated with Supabase.
- **Job Management**: Create, view, edit, and delete job applications.
- **Interactive UI**: Drag-and-drop ordering, animations (Reanimated), and Paper UI components.
- **Dark Mode Support**: Adapts to system theme preferences.

## Setup Development Build

Ideally, you should run a Development Build to support native modules (Reanimated, Google Sign-In).

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Prebuild & Run**:
   - For Android (APK):
     ```bash
     npx eas build --profile development --platform android
     ```
     Install the resulting APK on your device/emulator.

   - Then start the bundler:
     ```bash
     npm start
     ```

## Environment Config

Ensure your `backend` is running and accessible. Update `config.ts` or use `.env` if configured to point to your backend URL (e.g., `http://10.0.2.2:3000` for Emulator).

## Key Libraries
- **Expo**: Framework
- **React Native Paper**: UI Components
- **React Native Reanimated**: Animations
- **@react-native-google-signin/google-signin**: Authentication
