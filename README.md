# Job Tracking App

A full-stack React Native application for tracking job applications with a Node.js/Express backend and Supabase database.

## Project Structure

```
job-tracking-app/
├── backend/          # Node.js Express API
│   ├── config/       # Supabase configuration
│   ├── routes/       # API routes
│   ├── server.js     # Main server file
│   └── package.json
├── frontend/         # React Native app
│   ├── components/   # React components
│   ├── services/     # API service layer
│   ├── App.js        # Main app component
│   └── package.json
└── README.md
```

## Features

- **Add Jobs**: Create new job applications with company, position, status, priority, and comments
- **View Jobs**: See all applications in an organized list with color-coded status and priority badges
- **Edit Jobs**: Update any job application details
- **Delete Jobs**: Remove job applications you no longer need
- **Status Tracking**: Track applications as "Wishlist", "In Progress", or "Archived"
- **Priority Levels**: Mark applications as "Low", "Medium", or "High" priority
- **Comments**: Add notes and reminders for each application

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
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

4. Create the database table in Supabase:
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

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON jobs FOR ALL USING (true);
```

5. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update `config.js` with your backend URL:
   - For iOS Simulator: `http://localhost:3000/api`
   - For Android Emulator: `http://10.0.2.2:3000/api`
   - For Physical Device: `http://YOUR_IP:3000/api`

4. Start the Expo dev server:
```bash
npm start
```

5. Run the app:
   - Press `i` for iOS
   - Press `a` for Android
   - Scan QR code with Expo Go for physical device

## API Endpoints

- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

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
- Custom Modal-based pickers
- Full type definitions

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT

