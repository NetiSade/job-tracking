-- Migration: Add salary expectations field to jobs table
-- Run this in your Supabase SQL Editor

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS salary_expectations TEXT;

