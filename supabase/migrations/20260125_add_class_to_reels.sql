-- Migration: Add class_id to reels table
-- This enables associating reels with specific classes/lessons

-- Add class_id column to reels table
ALTER TABLE reels
ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES lessons(id) ON DELETE SET NULL;

-- Create index for efficient class-based filtering
CREATE INDEX IF NOT EXISTS idx_reels_class ON reels(class_id);

-- Update RLS policies to include class-based access
-- Students can view published reels from their enrolled classes
DROP POLICY IF EXISTS "Students can view published reels" ON reels;

CREATE POLICY "Students can view published reels" ON reels
    FOR SELECT USING (
        is_published = TRUE AND
        EXISTS (SELECT 1 FROM users WHERE google_id = auth.uid()::text AND role = 'student')
    );

-- Add comment
COMMENT ON COLUMN reels.class_id IS 'Optional reference to the class/lesson this reel belongs to';
