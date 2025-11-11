# Job Tracking App - Frontend

React Native app for tracking job applications.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Update the API URL in `config.js`:
   - For iOS Simulator: Use `http://localhost:3000/api`
   - For Android Emulator: Use `http://10.0.2.2:3000/api`
   - For Physical Device: Use your computer's local IP (e.g., `http://192.168.1.X:3000/api`)

3. Start the app:
```bash
npm start
```

4. Run on your preferred platform:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your physical device

## Features

- Add new job applications with company, position, status, priority, and comments
- View all job applications in a list
- Edit existing applications
- Delete applications
- Filter by status (wishlist, in progress, archived)
- Set priority levels (low, medium, high)
- Pull to refresh the job list

## Tech Stack

- React Native
- Expo
- Axios for API calls
- React Native Picker for dropdowns

