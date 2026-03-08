-- Migration: Assignments and Submissions v2
-- Date: 2026-02-18
-- Purpose: Add lesson_id and is_open to assignments; add file_url, file_name, teacher_comment_at to assignment_submissions

-- Add lesson_id and is_open to assignments table
ALTER TABLE assignments
ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT TRUE;

-- Add file upload and teacher comment fields to assignment_submissions table
ALTER TABLE assignment_submissions
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS teacher_comment_at TIMESTAMPTZ;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assignments_lesson ON assignments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON assignment_submissions(student_id);

-- Add comment for documentation
COMMENT ON COLUMN assignments.lesson_id IS 'Foreign key to lessons table - ties assignment to specific lesson';
COMMENT ON COLUMN assignments.is_open IS 'Whether students can submit to this assignment';
COMMENT ON COLUMN assignment_submissions.file_url IS 'Supabase Storage URL for submitted file';
COMMENT ON COLUMN assignment_submissions.file_name IS 'Original filename for display';
COMMENT ON COLUMN assignment_submissions.teacher_comment_at IS 'Timestamp when teacher provided feedback';
