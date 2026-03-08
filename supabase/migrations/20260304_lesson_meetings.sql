-- Add lesson_meetings table
-- Migration: 20260304_lesson_meetings.sql
-- Description: Single source of truth for Google Meet/other provider meetings for lessons

CREATE TABLE IF NOT EXISTS lesson_meetings (
    lesson_id UUID PRIMARY KEY REFERENCES lessons(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('google_calendar', 'google_meet_spaces')),
    meet_url TEXT NOT NULL,
    meeting_code TEXT,
    event_id TEXT,
    created_by_teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invalid', 'regenerated')),
    last_validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    validation_errors TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp_lesson_meetings()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_lesson_meetings ON lesson_meetings;
CREATE TRIGGER set_timestamp_lesson_meetings
BEFORE UPDATE ON lesson_meetings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp_lesson_meetings();

-- RLS Policies
ALTER TABLE lesson_meetings ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access to all authenticated users for lesson_meetings" ON lesson_meetings FOR SELECT USING (auth.role() = 'authenticated');

-- Allow insert/update/delete for teachers and admins
CREATE POLICY "Allow insert for teachers and admins for lesson_meetings" ON lesson_meetings FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND (role = 'teacher' OR role = 'admin')
    )
);

CREATE POLICY "Allow update for teachers and admins for lesson_meetings" ON lesson_meetings FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND (role = 'teacher' OR role = 'admin')
    )
);

CREATE POLICY "Allow delete for teachers and admins for lesson_meetings" ON lesson_meetings FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND (role = 'teacher' OR role = 'admin')
    )
);
