# Job Tracking Backend (TypeScript)

Backend API for the Job Tracking application built with Node.js, Express, and TypeScript.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example` and add your Supabase credentials:
```
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the SQL migrations in Supabase (SQL Editor):
   - `database/fresh-install.sql` if this is a brand-new project
   - `database/migration_add_job_comments.sql` if you are upgrading an existing database

These scripts create:
- `jobs` table (with status/priority columns and RLS policies)
- `job_comments` table for tracking progress updates per job
- Trigger to keep `jobs.updated_at` in sync when comments change

4. Run the server (development with auto-reload):
```bash
npm run dev
```

Or build and run for production:
```bash
npm run build
npm start
```

## TypeScript

This backend is written in TypeScript with:
- Strict type checking enabled
- Full type definitions for Express and Supabase
- Shared type definitions in `types/index.ts`

## API Endpoints

### Jobs
- `GET /api/jobs` — Get all jobs (with embedded comments)
- `GET /api/jobs/:id` — Get a single job (with comments)
- `POST /api/jobs` — Create a new job
- `PUT /api/jobs/:id` — Update job details (company, position, status, priority)
- `DELETE /api/jobs/:id` — Delete a job and its comments

### Comments
- `POST /api/jobs/:jobId/comments` — Add a new progress comment to a job
- `PUT /api/comments/:commentId` — Edit an existing comment
- `DELETE /api/comments/:commentId` — Delete a comment

All endpoints enforce user ownership through Supabase Row Level Security.
