-- Fix Subjects and Courses Relationship
-- 1. Courses belongs to a Subject (subject_id)
-- 2. Subjects no longer belong to a Course (course_id should be dropped or made nullable)

BEGIN;

-- Add subject_id to courses pointing to subjects
ALTER TABLE courses ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL;

-- Make course_id in subjects nullable (to avoid breaking constraints immediately, we'll eventually drop it)
ALTER TABLE subjects ALTER COLUMN course_id DROP NOT NULL;

-- Try to map existing text 'subject' in courses to real subjects if they match, or create generic ones (Optional/Data Migration)
-- For a safe migration without data loss, we just add the column. 
-- The UI/API will start using subject_id from now on.

COMMIT;
