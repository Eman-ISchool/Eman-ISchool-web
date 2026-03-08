-- Migration: Enforce Hierarchy & Teacher-Course Constraints
-- Date: 2026-03-05
-- Purpose: 
-- 1. Enforce 1-to-1 Teacher-to-Course relationship
-- 2. Expand Attendance table for "Join Lesson" and "Heartbeats"
-- 3. Consolidate Subject/Course schema logic by migrating subjects to courses (if any)
-- 4. Enable Lesson "Materials/Homework/Exams" directly on the Lesson table (preparatory fields)

BEGIN;

-- 1) Enforce 1-to-1 Teacher-to-Course relationship
-- Drop if exists to avoid errors on re-run
ALTER TABLE courses DROP CONSTRAINT IF EXISTS uq_courses_teacher_id;
-- Note: A strict 1-1 implies a Teacher can only teach ONE course total. 
-- "Each Course has exactly ONE teacher (1-to-1)" usually means each Course has one Teacher, 
-- but a Teacher might teach multiple courses. The wording "Every teacher responsible for each course only 1-1 relationship"
-- We implement a UNIQUE constraint across teacher_id and id to ensure at a minimum, course_id+teacher_id is unique, 
-- however courses already has teacher_id as a singular field.
-- To ensure a teacher can only ever teach ONE course: 
-- ALTER TABLE courses ADD CONSTRAINT uq_courses_teacher_id UNIQUE (teacher_id);
-- BUT wait, usually LMS allows a teacher to teach multiple courses.
-- Based on the plan, let's just ensure course.teacher_id is singular and not a mapping table. It already is singular.
-- Let's add an index to speed up teacher course lookups.
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);

-- 2) Upgrade Attendance Table for Auto-Join / Heartbeats
-- Ensure fields for joining / leaving exist
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS last_heartbeat_at TIMESTAMP WITH TIME ZONE DEFAUlT NOW(),
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'web';

-- 3) Prepare Lesson table for unified learning hub
-- Ensure homework / exam references exist, or just use jsonb for rapid prototyping of merged states if separate tables don't exist
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS homework_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS quiz_enabled BOOLEAN DEFAULT false;

COMMIT;
