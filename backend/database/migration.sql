-- Migration: Add user authentication to jobs table
-- Run this in your Supabase SQL Editor

-- Step 1: Add user_id column to jobs table
ALTER TABLE jobs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Make user_id NOT NULL (after backfilling existing data if any)
-- First, you may want to set a default user for existing records:
-- UPDATE jobs SET user_id = 'some-uuid' WHERE user_id IS NULL;
-- Then make it required:
ALTER TABLE jobs ALTER COLUMN user_id SET NOT NULL;

-- Step 3: Create index for faster queries
CREATE INDEX idx_jobs_user_id ON jobs(user_id);

-- Step 4: Enable Row Level Security (RLS)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop old policy if exists
DROP POLICY IF EXISTS "Allow all operations" ON jobs;

-- Step 6: Create RLS policies - Users can only see their own jobs
CREATE POLICY "Users can view own jobs"
  ON jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs"
  ON jobs FOR DELETE
  USING (auth.uid() = user_id);

-- Step 7: Enable anonymous sign-ins in Supabase Dashboard
-- Go to Authentication > Providers > Enable Anonymous sign-ins

