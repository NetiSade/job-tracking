# Quick Setup Guide

Follow these steps to get your Job Tracking App running:

## 1. Supabase Setup (Do this first!)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings** → **API** and copy:
   - Project URL (SUPABASE_URL)
   - anon/public key (SUPABASE_ANON_KEY)
4. Go to **SQL Editor** and run this query:

```sql
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('wishlist', 'in_progress', 'archived')),
  sort_order INTEGER NOT NULL,
  salary_expectations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Allow all operations (for development)
CREATE POLICY "Allow all operations" ON jobs FOR ALL USING (true);
```

## 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=3000
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
EOF

# Edit .env and add your actual Supabase credentials
# nano .env  (or use any text editor)

# Start the server
npm run dev
```

The backend should now be running on `http://localhost:3000`

## 3. Frontend Setup

Open a **new terminal window** and run:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Update config.js with the correct API URL
# For iOS Simulator: http://localhost:3000/api (default)
# For Android Emulator: http://10.0.2.2:3000/api
# For Physical Device: http://YOUR_COMPUTER_IP:3000/api

# Start Expo
npm start
```

## 4. Run the App

After running `npm start`, you'll see a QR code:

- **iOS Simulator**: Press `i`
- **Android Emulator**: Press `a`
- **Physical Device**:
  1. Install "Expo Go" app from App Store/Play Store
  2. Scan the QR code
  3. Make sure your phone is on the same WiFi as your computer
  4. Update `frontend/config.js` to use your computer's local IP

## Testing the Backend

Test if the backend is working:

```bash
# Health check
curl http://localhost:3000/health

# Get all jobs (should return empty array initially)
curl http://localhost:3000/api/jobs
```

## Common Issues

### "Network Error" in the app

- Make sure backend is running on port 3000
- Check that `config.js` has the correct API URL
- For physical devices, use your computer's IP address (find it with `ifconfig` on Mac/Linux or `ipconfig` on Windows)

### "Missing Supabase credentials"

- Make sure you created the `.env` file in the backend folder
- Double-check your Supabase URL and key are correct

### Database errors

- Make sure you ran the SQL query to create the table
- Verify RLS policies are set up correctly

## Next Steps

Once everything is running:

1. Add your first job application in the app
2. Try editing and deleting jobs
3. Drag jobs up and down to set your preferred order
4. Add comments to track your progress

Enjoy tracking your job applications! 🎉
