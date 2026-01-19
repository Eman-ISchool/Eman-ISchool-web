-- Migration: Add AI Educational Reels Tables
-- This enables AI-powered educational video reels feature with generation tracking

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE reel_status AS ENUM ('queued', 'processing', 'pending_review', 'approved', 'rejected', 'failed');

-- ============================================
-- TABLES
-- ============================================

-- Reels Table: Stores AI-generated educational video reels
CREATE TABLE IF NOT EXISTS reels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0 AND duration_seconds <= 120),
    status reel_status DEFAULT 'queued',
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    lesson_material_id TEXT, -- Reference to specific lesson material (text-based content)
    subject TEXT,
    grade_level TEXT,
    generation_request_id TEXT, -- External AI service request ID
    is_published BOOLEAN DEFAULT FALSE, -- Only visible to students when true
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reel Progress Table: Tracks student progress on watching reels
CREATE TABLE IF NOT EXISTS reel_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reel_id UUID REFERENCES reels(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    watched_seconds INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE, -- Set to true when watched >= 98% of duration
    is_saved BOOLEAN DEFAULT FALSE, -- Student bookmarked/saved this reel
    last_watched_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reel_id, student_id)
);

-- Generation Logs Table: Tracks AI generation attempts and results
CREATE TABLE IF NOT EXISTS generation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reel_id UUID REFERENCES reels(id) ON DELETE SET NULL,
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
    lesson_material_id TEXT,
    action TEXT NOT NULL, -- 'generation_requested', 'generation_started', 'generation_completed', 'generation_failed', 'content_flagged', 'regeneration_requested'
    status TEXT NOT NULL, -- 'success', 'failed', 'pending'
    error_message TEXT,
    metadata JSONB DEFAULT '{}', -- Additional context (AI service response, timing, etc.)
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Reels indexes
CREATE INDEX IF NOT EXISTS idx_reels_teacher ON reels(teacher_id);
CREATE INDEX IF NOT EXISTS idx_reels_lesson ON reels(lesson_id);
CREATE INDEX IF NOT EXISTS idx_reels_status ON reels(status);
CREATE INDEX IF NOT EXISTS idx_reels_published ON reels(is_published);
CREATE INDEX IF NOT EXISTS idx_reels_subject ON reels(subject);
CREATE INDEX IF NOT EXISTS idx_reels_grade_level ON reels(grade_level);
CREATE INDEX IF NOT EXISTS idx_reels_created_at ON reels(created_at DESC);

-- Reel progress indexes
CREATE INDEX IF NOT EXISTS idx_reel_progress_reel ON reel_progress(reel_id);
CREATE INDEX IF NOT EXISTS idx_reel_progress_student ON reel_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_reel_progress_completed ON reel_progress(is_completed);
CREATE INDEX IF NOT EXISTS idx_reel_progress_saved ON reel_progress(is_saved);

-- Generation logs indexes
CREATE INDEX IF NOT EXISTS idx_generation_logs_reel ON generation_logs(reel_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_teacher ON generation_logs(teacher_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_lesson ON generation_logs(lesson_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_action ON generation_logs(action);
CREATE INDEX IF NOT EXISTS idx_generation_logs_status ON generation_logs(status);
CREATE INDEX IF NOT EXISTS idx_generation_logs_created_at ON generation_logs(created_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Reels updated_at trigger
CREATE TRIGGER update_reels_updated_at
    BEFORE UPDATE ON reels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Reel progress updated_at trigger
CREATE TRIGGER update_reel_progress_updated_at
    BEFORE UPDATE ON reel_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on new tables
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE reel_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;

-- Reels policies
CREATE POLICY "Teachers can view their own reels" ON reels
    FOR SELECT USING (
        teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
    );

CREATE POLICY "Teachers can create reels" ON reels
    FOR INSERT WITH CHECK (
        teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
    );

CREATE POLICY "Teachers can update their own reels" ON reels
    FOR UPDATE USING (
        teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
    );

CREATE POLICY "Students can view published reels" ON reels
    FOR SELECT USING (
        is_published = TRUE AND
        EXISTS (SELECT 1 FROM users WHERE google_id = auth.uid()::text AND role = 'student')
    );

CREATE POLICY "Admins can view all reels" ON reels
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE google_id = auth.uid()::text AND role = 'admin')
    );

CREATE POLICY "Admins can manage all reels" ON reels
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE google_id = auth.uid()::text AND role = 'admin')
    );

CREATE POLICY "Service role full access to reels" ON reels
    FOR ALL USING (auth.role() = 'service_role');

-- Reel progress policies
CREATE POLICY "Students can view their own progress" ON reel_progress
    FOR SELECT USING (
        student_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
    );

CREATE POLICY "Students can create their progress" ON reel_progress
    FOR INSERT WITH CHECK (
        student_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
    );

CREATE POLICY "Students can update their own progress" ON reel_progress
    FOR UPDATE USING (
        student_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
    );

CREATE POLICY "Teachers can view progress on their reels" ON reel_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM reels r
            WHERE r.id = reel_progress.reel_id
            AND r.teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
        )
    );

CREATE POLICY "Service role full access to reel_progress" ON reel_progress
    FOR ALL USING (auth.role() = 'service_role');

-- Generation logs policies
CREATE POLICY "Teachers can view their own generation logs" ON generation_logs
    FOR SELECT USING (
        teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
    );

CREATE POLICY "Admins can view all generation logs" ON generation_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE google_id = auth.uid()::text AND role = 'admin')
    );

CREATE POLICY "Service role full access to generation_logs" ON generation_logs
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TYPE reel_status IS 'Status of AI-generated educational reel: queued, processing, pending_review, approved, rejected, failed';

COMMENT ON TABLE reels IS 'AI-generated educational video reels with bilingual metadata and approval workflow';
COMMENT ON TABLE reel_progress IS 'Tracks student watch progress and saved status for each reel';
COMMENT ON TABLE generation_logs IS 'Audit trail for AI generation attempts, results, and errors';

COMMENT ON COLUMN reels.video_url IS 'URL to the generated video file (should use signed URLs for security)';
COMMENT ON COLUMN reels.duration_seconds IS 'Video duration in seconds (max 120 seconds)';
COMMENT ON COLUMN reels.is_published IS 'Only published reels are visible to students';
COMMENT ON COLUMN reel_progress.is_completed IS 'Set to true when student watches >= 98% of the reel';
COMMENT ON COLUMN generation_logs.action IS 'Type of generation event: generation_requested, generation_started, generation_completed, generation_failed, content_flagged, regeneration_requested';
