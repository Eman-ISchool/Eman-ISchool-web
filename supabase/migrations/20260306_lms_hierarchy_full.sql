-- ============================================
-- EDUVERSE LMS HIERARCHY MIGRATION
-- Phase 2: Foundation - Database Schema + Role Extension
-- Date: 2026-03-06
-- ============================================

-- Add supervisor to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'supervisor';

-- Add columns to grades table
ALTER TABLE grades ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add column to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add columns to lessons table
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS teacher_notes TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS rescheduled_from UUID REFERENCES lessons(id) ON DELETE SET NULL;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS meeting_provider TEXT DEFAULT 'google_meet';

-- Add columns to attendance table
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS join_time TIMESTAMPTZ;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS leave_time TIMESTAMPTZ;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS attendance_status TEXT CHECK (attendance_status IN ('present','late','absent','excused'));

-- Add columns to assessments table
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS assessment_type TEXT NOT NULL DEFAULT 'quiz' CHECK (assessment_type IN ('quiz','exam'));
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS attempt_limit INTEGER DEFAULT 1;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS late_submissions_allowed BOOLEAN DEFAULT false;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_grades_supervisor_id ON grades(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_courses_grade_id ON courses(grade_id);
CREATE INDEX IF NOT EXISTS idx_attendance_lesson_student ON attendance(lesson_id, student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);

-- Add RLS policy for supervisor role on grades table
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Policy: Supervisors can SELECT/UPDATE their own grades
CREATE POLICY IF NOT EXISTS "Supervisors can view and edit their assigned grades"
ON grades FOR SELECT
USING (auth.uid() = supervisor_id)
WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE id = supervisor_id AND role = 'supervisor'));

CREATE POLICY IF NOT EXISTS "Supervisors can update their assigned grades"
ON grades FOR UPDATE
USING (auth.uid() = supervisor_id)
WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE id = supervisor_id AND role = 'supervisor'));

-- Comment on grades table
COMMENT ON COLUMN grades.supervisor_id IS 'Supervisor user assigned to manage this grade';
COMMENT ON COLUMN grades.description IS 'Detailed description of the grade/level';
COMMENT ON COLUMN grades.image_url IS 'Cover image or logo for the grade';
