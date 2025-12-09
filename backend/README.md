# Job Tracker - Backend API

Node.js/Express API providing authentication, data persistence, and job management logic.

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configuration**:
   Create a `.env` file:
   ```env
   PORT=3000
   SUPABASE_URL=YOUR_URL
   SUPABASE_ANON_KEY=YOUR_KEY
   ```

3. **Database**:
   Run schema migrations from `database/` in your Supabase SQL Editor.

4. **Start Server**:
   ```bash
   npm run dev  # Development
   npm start    # Production (after build)
   ```

## Key Endpoints

- **Auth**: `/auth/google` (Google ID Token verification), `/auth/refresh`
- **Jobs**: `/api/jobs` (CRUD), `/api/jobs/reorder` (Sort persistence)
- **Comments**: `/api/jobs/:id/comments` (Progress tracking)

## Tech Stack
- **Framework**: Express.js
- **Lang**: TypeScript
- **DB**: Supabase (PostgreSQL)
