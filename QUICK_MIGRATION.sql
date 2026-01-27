-- Quick Migration: Add class_id to reels table
-- Run this in your Supabase SQL Editor or via psql

-- Add class_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reels' AND column_name = 'class_id'
    ) THEN
        ALTER TABLE reels ADD COLUMN class_id UUID REFERENCES lessons(id) ON DELETE SET NULL;
        CREATE INDEX idx_reels_class ON reels(class_id);
        COMMENT ON COLUMN reels.class_id IS 'Optional reference to the class/lesson this reel belongs to';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'reels' AND column_name = 'class_id';
