-- Migration: Add Course Modules for hierarchical lesson organization
-- Date: 2026-03-03
-- Purpose: Create course_modules table for organizing lessons into modules
--          Add module_id to lessons table for linking lessons to modules

-- Create course_modules table
CREATE TABLE IF NOT EXISTS course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for course_modules
CREATE INDEX IF NOT EXISTS idx_course_modules_course ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_order ON course_modules(course_id, display_order);

-- Add module_id to lessons table (nullable for backward compatibility)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES course_modules(id) ON DELETE SET NULL;

-- Create index for lessons.module_id
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);

-- Verification query (run after migration to confirm):
-- SELECT column_name FROM information_schema.columns WHERE table_name='lessons' AND column_name='module_id';
-- Should return 1 row
