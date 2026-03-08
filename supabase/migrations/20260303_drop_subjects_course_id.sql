-- Migration: Drop course_id column from subjects table
-- Date: 2026-03-03
-- Purpose: Remove the deprecated course_id foreign key from subjects table
--          after making it nullable and adding courses.subject_id

-- Drop the foreign key constraint and column
ALTER TABLE subjects DROP COLUMN IF EXISTS course_id;

-- Drop the index that was on course_id
DROP INDEX IF EXISTS idx_subjects_course;

-- Verification query (run after migration to confirm):
-- SELECT column_name FROM information_schema.columns WHERE table_name='subjects' AND column_name='course_id';
-- Should return 0 rows
