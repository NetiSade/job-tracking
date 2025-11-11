# Job Tracking App - Frontend (TypeScript)

React Native app for tracking job applications built with TypeScript and Expo.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables or update `config.ts` with:
   - `API_URL` — your backend URL (`http://localhost:3000/api` for simulator, `http://10.0.2.2:3000/api` for Android emulator, or `http://YOUR_IP:3000/api` for physical device)
   - `SUPABASE` keys (if not using `.env` values)

3. Start the app:
```bash
npm start
```

4. Run on your preferred platform:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your physical device

## Features

- Add, edit, and delete job applications with company, position, status, and priority
- Track a timeline of comments for each job with timestamps
- Edit existing comments or add new progress updates
- View last updated date on every job card
- Filter by status (wishlist, in progress, archived, all)
- Pull to refresh the job list
- Modern UI with floating action button, modal forms, and progress timeline

## Tech Stack

- React Native with TypeScript
- Expo
- Axios for API calls
- Custom modal-based pickers (no external dependencies)
- Full type safety with TypeScript interfaces and reusable hooks
