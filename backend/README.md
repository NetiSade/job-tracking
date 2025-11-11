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

3. Create the following table in your Supabase database:

```sql
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('wishlist', 'in_progress', 'archived')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional, for production)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (adjust for your needs)
CREATE POLICY "Allow all operations" ON jobs FOR ALL USING (true);
```

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

- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

