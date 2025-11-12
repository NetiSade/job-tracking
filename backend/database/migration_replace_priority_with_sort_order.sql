-- Migration: Replace priority system with explicit per-user job ordering
-- Run this in your Supabase SQL Editor

-- 1. Add new sort_order column (temporarily nullable while we backfill)
ALTER TABLE jobs
ADD COLUMN sort_order INTEGER;

-- 2. Backfill existing rows with a stable order per user based on creation time
WITH ordered_jobs AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY created_at ASC, id ASC
    ) - 1 AS new_sort_order
  FROM jobs
)
UPDATE jobs
SET sort_order = ordered_jobs.new_sort_order
FROM ordered_jobs
WHERE jobs.id = ordered_jobs.id;

-- 3. Enforce NOT NULL and uniqueness within each user's list
ALTER TABLE jobs
ALTER COLUMN sort_order SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_user_sort_order
  ON jobs(user_id, sort_order);

-- 4. Drop the old priority column and constraint
ALTER TABLE jobs
DROP COLUMN IF EXISTS priority;

-- 5. Ensure updated_at stays accurate when sort_order changes
CREATE OR REPLACE FUNCTION update_job_timestamp_on_write()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS maintain_job_timestamp ON jobs;
CREATE TRIGGER maintain_job_timestamp
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_job_timestamp_on_write();


