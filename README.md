# Job Tracking App

A full-stack React Native application for tracking job applications with a Node.js/Express backend and Supabase database.

## Project Structure

```
job-tracking-app/
├── backend/
│   ├── config/             # Supabase configuration helpers
│   ├── routes/             # API route handlers (jobs, auth, comments)
│   ├── database/           # SQL migration scripts
│   ├── types/              # Shared backend TypeScript interfaces
│   ├── server.ts           # Express server entry point
│   └── package.json
├── frontend/
│   ├── components/         # Reusable React Native components
│   ├── hooks/              # Custom hooks for data & form logic
│   ├── services/           # API clients and auth helpers
│   ├── utils/              # Shared utilities (dates, styling)
│   ├── App.tsx             # Main application component
│   ├── tsconfig.json
│   └── package.json
└── README.md
```

## Features

- **Job Management**: Create, edit, and delete applications with company, position, status, and priority
- **Progress Timeline**: Maintain a chronological list of comments for each job (add & edit comments)
- **Timestamp Visibility**: Display the last updated date on every job card and the exact time for each comment
- **Status Filtering**: Quickly filter jobs by `Wishlist`, `In Progress`, `Archived`, or view `All`
- **Priority Badges**: Color-coded priorities (`Low`, `Medium`, `High`) for quick scanning
- **Modern UI**: Floating action button, modal forms, and clean typography
- **Pull to Refresh**: Manually refresh the job list to sync with the backend

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn
- Supabase account
- Expo CLI (for React Native)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Supabase credentials:
```
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the SQL scripts in `database/` via the Supabase SQL Editor:
   - `fresh-install.sql` for new projects
   - `migration_add_job_comments.sql` to upgrade an existing database with comment support

5. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000`.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure API/Supabase URLs by either:
   - Creating an `.env` file (`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SUPABASE_URL`, etc.), or
   - Editing `config.ts` directly with the correct values (`http://localhost:3000/api`, `http://10.0.2.2:3000/api`, or `http://YOUR_IP:3000/api`)

4. Start the Expo dev server:
```bash
npm start
```

5. Run the app:
   - Press `i` for iOS Simulator
   - Press `a` for Android emulator
   - Scan the QR code with Expo Go on a physical device (ensure the device shares the same network)

## API Endpoints

### Jobs
- `GET /api/jobs` — Get all jobs (with embedded comments)
- `GET /api/jobs/:id` — Get a single job
- `POST /api/jobs` — Create a new job
- `PUT /api/jobs/:id` — Update job details
- `DELETE /api/jobs/:id` — Delete a job

### Comments
- `POST /api/jobs/:jobId/comments` — Add a new comment to a job
- `PUT /api/comments/:commentId` — Update an existing comment
- `DELETE /api/comments/:commentId` — Delete a comment

All endpoints are protected with Supabase Row Level Security to ensure each user only accesses their own data.

## Tech Stack

### Backend (TypeScript)
- Node.js
- Express.js
- TypeScript (strict mode)
- Supabase (PostgreSQL)
- CORS
- dotenv
- ts-node for development

### Frontend (TypeScript)
- React Native with TypeScript
- Expo
- Axios
- Custom hooks and reusable components
- Typed data models shared across the app

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT
