# Job Tracking Monorepo

A full-stack job tracking solution featuring a Node.js/Express backend, Supabase database, and dual clients (React Native Mobile + React Web).

## Project Structure

```
job-tracking-monorepo/
├── backend/            # Express.js API & Supabase helpers
├── mobile/             # React Native (Expo) iOS/Android app
├── web/                # React (Vite) Web Dashboard
├── packages/           # Shared libraries (types, utils)
├── packages/shared/    # Shared TypeScript types & utility functions
└── package.json        # Root monorepo configuration
```

## Features

- **Cross-Platform**: Track jobs on the go with Mobile or manage them deeply via Web.
- **Job Management**: Create, edit, delete, and filter job applications.
- **Drag & Drop Ordering**: Persisted, custom sorting of jobs (synced across devices).
- **Progress Timeline**: Comment threads for each job to track interview stages and notes.
- **Shared Authentication**: Google Sign-In and session management.

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- Supabase Account & Project
- Expo CLI (for Mobile)

### 1. Backend Setup
 Navigate to `backend/` and follow its [README](./backend/README.md) to set up the database and start the server.

### 2. Client Setup
- **Mobile**: Go to `mobile/` and follow the [Mobile README](./mobile/README.md).
- **Web**: Go to `web/` and follow the [Web README](./web/README.md).

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Supabase (PostgreSQL + Auth)
- **Mobile**: React Native, Expo, React Native Paper, Reanimated
- **Web**: React, Vite, dnd-kit, TailwindCSS (if applicable), Lucide Icons
- **Shared**: Monorepo architecture for shared types/logic

## License

MIT
