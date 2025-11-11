-- Migration: Create job_comments table for tracking job progress comments
-- Run this in your Supabase SQL Editor

ALTER TABLE jobs DROP COLUMN IF EXISTS comments;
-- Step 1: Create job_comments table
CREATE TABLE IF NOT EXISTS job_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_job_comments_job_id ON job_comments(job_id);

-- Step 3: Enable Row Level Security
ALTER TABLE job_comments ENABLE ROW LEVEL SECURITY;

-- Step 4: Policies to restrict access to comment owners
CREATE POLICY "Users can view own comments"
  ON job_comments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own comments"
  ON job_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON job_comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON job_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Step 5: Trigger to update job updated_at when comments change
CREATE OR REPLACE FUNCTION update_job_timestamp()
RETURNS TRIGGER AS $$
DECLARE
  target_job UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_job := OLD.job_id;
  ELSE
    target_job := NEW.job_id;
  END IF;

  UPDATE jobs
  SET updated_at = NOW()
  WHERE id = target_job;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS job_comments_timestamp_trigger ON job_comments;
CREATE TRIGGER job_comments_timestamp_trigger
AFTER INSERT OR UPDATE OR DELETE ON job_comments
FOR EACH ROW
EXECUTE FUNCTION update_job_timestamp();