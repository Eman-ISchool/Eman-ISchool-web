-- Migration: Add AI Video Reels Pipeline Tables
-- This adds support for source content, transcripts, storyboards, visibility, and processing jobs
-- Date: 2026-01-26

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE source_content_type AS ENUM ('video', 'document', 'recording', 'external_link');
CREATE TYPE source_status AS ENUM ('uploaded', 'processing', 'transcribing', 'ready', 'failed');
CREATE TYPE processing_job_status AS ENUM ('pending', 'processing', 'paused', 'completed', 'failed');
CREATE TYPE processing_job_type AS ENUM ('transcription', 'segmentation', 'generation');
CREATE TYPE visibility_type AS ENUM ('class', 'grade_level', 'group');
CREATE TYPE external_video_provider AS ENUM ('youtube', 'vimeo', 'other');

-- ============================================
-- TABLES
-- ============================================

-- Source Content Table: Stores original uploaded materials from which reels are generated
CREATE TABLE IF NOT EXISTS source_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    type source_content_type NOT NULL,
    file_url TEXT,
    file_hash VARCHAR(64),
    original_filename VARCHAR(255) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    duration_seconds INTEGER CHECK (duration_seconds <= 7200), -- Max 2 hours
    page_count INTEGER CHECK (page_count <= 100), -- Max 100 pages
    status source_status DEFAULT 'uploaded',
    transcript_id UUID REFERENCES transcripts(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transcripts Table: Stores AI-generated transcriptions from video content
CREATE TABLE IF NOT EXISTS transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES source_content(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    segments JSONB NOT NULL,
    language VARCHAR(10) NOT NULL,
    confidence DECIMAL(3,2),
    word_count INTEGER NOT NULL,
    is_manual BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storyboards Table: Stores AI-generated storyboards for reel creation from documents
CREATE TABLE IF NOT EXISTS storyboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES source_content(id) ON DELETE CASCADE NOT NULL,
    target_audience VARCHAR(100) NOT NULL,
    scenes JSONB NOT NULL,
    summary TEXT NOT NULL,
    estimated_duration INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reel Visibility Table: Granular visibility assignments for reels
CREATE TABLE IF NOT EXISTS reel_visibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reel_id UUID REFERENCES reels(id) ON DELETE CASCADE NOT NULL,
    visibility_type visibility_type NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    grade_level VARCHAR(20),
    group_id UUID REFERENCES student_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reel_id, visibility_type, class_id, grade_level, group_id)
);

-- External Video Links Table: Stores external video references (YouTube, etc.)
CREATE TABLE IF NOT EXISTS external_video_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reel_id UUID REFERENCES reels(id) ON DELETE CASCADE NOT NULL,
    provider external_video_provider NOT NULL,
    external_id VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    title VARCHAR(255),
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    is_available BOOLEAN DEFAULT TRUE,
    last_checked_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider, external_id)
);

-- Processing Jobs Table: Tracks async processing pipeline status
CREATE TABLE IF NOT EXISTS processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES source_content(id) ON DELETE CASCADE NOT NULL,
    type processing_job_type NOT NULL,
    status processing_job_status DEFAULT 'pending',
    current_step VARCHAR(50),
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EXTEND EXISTING TABLES
-- ============================================

-- Extend reels table with pipeline-related columns
ALTER TABLE reels
    ADD COLUMN IF NOT EXISTS source_id UUID REFERENCES source_content(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS source_type VARCHAR(20),
    ADD COLUMN IF NOT EXISTS segment_index INTEGER,
    ADD COLUMN IF NOT EXISTS segment_of UUID REFERENCES reels(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS storyboard_id UUID REFERENCES storyboards(id) ON DELETE SET NULL;

-- Extend reel_progress table with engagement columns
ALTER TABLE reel_progress
    ADD COLUMN IF NOT EXISTS is_bookmarked BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS marked_understood BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS understood_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS replay_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_position DECIMAL(5,2) DEFAULT 0;

-- ============================================
-- INDEXES
-- ============================================

-- Source content indexes
CREATE INDEX IF NOT EXISTS idx_source_content_teacher ON source_content(teacher_id);
CREATE INDEX IF NOT EXISTS idx_source_content_hash ON source_content(file_hash);
CREATE INDEX IF NOT EXISTS idx_source_content_status ON source_content(status);
CREATE INDEX IF NOT EXISTS idx_source_content_type ON source_content(type);
CREATE INDEX IF NOT EXISTS idx_source_content_created_at ON source_content(created_at DESC);

-- Transcripts indexes
CREATE INDEX IF NOT EXISTS idx_transcripts_source ON transcripts(source_id);

-- Storyboards indexes
CREATE INDEX IF NOT EXISTS idx_storyboards_source ON storyboards(source_id);

-- Reel visibility indexes
CREATE INDEX IF NOT EXISTS idx_reel_visibility_reel ON reel_visibility(reel_id);
CREATE INDEX IF NOT EXISTS idx_reel_visibility_class ON reel_visibility(class_id);
CREATE INDEX IF NOT EXISTS idx_reel_visibility_grade ON reel_visibility(grade_level);
CREATE INDEX IF NOT EXISTS idx_reel_visibility_group ON reel_visibility(group_id);

-- External video links indexes
CREATE INDEX IF NOT EXISTS idx_external_video_links_reel ON external_video_links(reel_id);
CREATE INDEX IF NOT EXISTS idx_external_video_links_provider ON external_video_links(provider);

-- Processing jobs indexes
CREATE INDEX IF NOT EXISTS idx_processing_jobs_source ON processing_jobs(source_id);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON processing_jobs(status) WHERE status IN ('pending', 'processing', 'paused');
CREATE INDEX IF NOT EXISTS idx_processing_jobs_created_at ON processing_jobs(created_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Source content updated_at trigger
CREATE TRIGGER update_source_content_updated_at
    BEFORE UPDATE ON source_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on new tables
ALTER TABLE source_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reel_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_video_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;

-- Source content policies
CREATE POLICY "Teachers can view their own source content" ON source_content
    FOR SELECT USING (teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text);

CREATE POLICY "Teachers can create source content" ON source_content
    FOR INSERT WITH CHECK (teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text);

CREATE POLICY "Teachers can update their own source content" ON source_content
    FOR UPDATE USING (teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text);

CREATE POLICY "Teachers can delete their own source content" ON source_content
    FOR DELETE USING (teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text);

CREATE POLICY "Admins can view all source content" ON source_content
    FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE google_id = auth.uid()::text AND role = 'admin'));

CREATE POLICY "Service role full access to source_content" ON source_content
    FOR ALL USING (auth.role() = 'service_role');

-- Transcripts policies
CREATE POLICY "Teachers can view transcripts for their source content" ON transcripts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM source_content sc
            WHERE sc.id = transcripts.source_id
            AND sc.teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
        )
    );

CREATE POLICY "Teachers can create transcripts" ON transcripts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM source_content sc
            WHERE sc.id = transcripts.source_id
            AND sc.teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
        )
    );

CREATE POLICY "Teachers can update transcripts" ON transcripts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM source_content sc
            WHERE sc.id = transcripts.source_id
            AND sc.teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
        )
    );

CREATE POLICY "Admins can view all transcripts" ON transcripts
    FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE google_id = auth.uid()::text AND role = 'admin'));

CREATE POLICY "Service role full access to transcripts" ON transcripts
    FOR ALL USING (auth.role() = 'service_role');

-- Storyboards policies
CREATE POLICY "Teachers can view storyboards for their source content" ON storyboards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM source_content sc
            WHERE sc.id = storyboards.source_id
            AND sc.teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
        )
    );

CREATE POLICY "Teachers can create storyboards" ON storyboards
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM source_content sc
            WHERE sc.id = storyboards.source_id
            AND sc.teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
        )
    );

CREATE POLICY "Teachers can update storyboards" ON storyboards
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM source_content sc
            WHERE sc.id = storyboards.source_id
            AND sc.teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
        )
    );

CREATE POLICY "Admins can view all storyboards" ON storyboards
    FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE google_id = auth.uid()::text AND role = 'admin'));

CREATE POLICY "Service role full access to storyboards" ON storyboards
    FOR ALL USING (auth.role() = 'service_role');

-- Reel visibility policies
CREATE POLICY "Teachers can manage visibility for their reels" ON reel_visibility
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM reels r
            WHERE r.id = reel_visibility.reel_id
            AND r.teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
        )
    );

CREATE POLICY "Admins can view all reel visibility" ON reel_visibility
    FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE google_id = auth.uid()::text AND role = 'admin'));

CREATE POLICY "Service role full access to reel_visibility" ON reel_visibility
    FOR ALL USING (auth.role() = 'service_role');

-- External video links policies
CREATE POLICY "Teachers can manage external links for their reels" ON external_video_links
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM reels r
            WHERE r.id = external_video_links.reel_id
            AND r.teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
        )
    );

CREATE POLICY "Students can view external links for published reels" ON external_video_links
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM reels r
            WHERE r.id = external_video_links.reel_id
            AND r.is_published = TRUE
        )
    );

CREATE POLICY "Admins can view all external video links" ON external_video_links
    FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE google_id = auth.uid()::text AND role = 'admin'));

CREATE POLICY "Service role full access to external_video_links" ON external_video_links
    FOR ALL USING (auth.role() = 'service_role');

-- Processing jobs policies
CREATE POLICY "Teachers can view processing jobs for their source content" ON processing_jobs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM source_content sc
            WHERE sc.id = processing_jobs.source_id
            AND sc.teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
        )
    );

CREATE POLICY "Teachers can create processing jobs" ON processing_jobs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM source_content sc
            WHERE sc.id = processing_jobs.source_id
            AND sc.teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
        )
    );

CREATE POLICY "Teachers can update processing jobs" ON processing_jobs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM source_content sc
            WHERE sc.id = processing_jobs.source_id
            AND sc.teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
        )
    );

CREATE POLICY "Admins can view all processing jobs" ON processing_jobs
    FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE google_id = auth.uid()::text AND role = 'admin'));

CREATE POLICY "Service role full access to processing_jobs" ON processing_jobs
    FOR ALL USING (auth.role() = 'service_role');

-- Extended reel_progress policies
CREATE POLICY "Students can view their own progress" ON reel_progress
    FOR SELECT USING (student_id = (SELECT id FROM users WHERE google_id = auth.uid()::text);

CREATE POLICY "Students can create their progress" ON reel_progress
    FOR INSERT WITH CHECK (student_id = (SELECT id FROM users WHERE google_id = auth.uid()::text);

CREATE POLICY "Students can update their own progress" ON reel_progress
    FOR UPDATE USING (student_id = (SELECT id FROM users WHERE google_id = auth.uid()::text);

CREATE POLICY "Teachers can view progress for their students" ON reel_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM reels r
            WHERE r.id = reel_progress.reel_id
            AND r.teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
        )
    );

CREATE POLICY "Admins can view all progress" ON reel_progress
    FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE google_id = auth.uid()::text AND role = 'admin'));

CREATE POLICY "Service role full access to reel_progress" ON reel_progress
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TYPE source_content_type IS 'Type of source content: video, document, recording, external_link';
COMMENT ON TYPE source_status IS 'Processing status: uploaded, processing, transcribing, ready, failed';
COMMENT ON TYPE processing_job_status IS 'Job status: pending, processing, paused, completed, failed';
COMMENT ON TYPE processing_job_type IS 'Job type: transcription, segmentation, generation';
COMMENT ON TYPE visibility_type IS 'Visibility type: class, grade_level, group';
COMMENT ON TYPE external_video_provider IS 'External video provider: youtube, vimeo, other';

COMMENT ON TABLE source_content IS 'Original uploaded materials from which reels are generated';
COMMENT ON TABLE transcripts IS 'AI-generated transcriptions from video content with timestamped segments';
COMMENT ON TABLE storyboards IS 'AI-generated storyboards for reel creation from documents';
COMMENT ON TABLE reel_visibility IS 'Granular visibility assignments for reels (class, grade level, group)';
COMMENT ON TABLE external_video_links IS 'External video references (YouTube, Vimeo, etc.)';
COMMENT ON TABLE processing_jobs IS 'Tracks async processing pipeline status with retry logic';

COMMENT ON COLUMN source_content.file_hash IS 'SHA-256 hash for duplicate detection';
COMMENT ON COLUMN source_content.duration_seconds IS 'Video duration in seconds (max 7200 = 2 hours)';
COMMENT ON COLUMN source_content.page_count IS 'Document page count (max 100 pages)';
COMMENT ON COLUMN transcripts.segments IS 'JSONB array of timestamped transcript segments';
COMMENT ON COLUMN storyboards.scenes IS 'JSONB array of scene-by-scene breakdown with visual suggestions';
COMMENT ON COLUMN processing_jobs.progress_percent IS 'Progress percentage (0-100)';
COMMENT ON COLUMN processing_jobs.retry_count IS 'Number of retry attempts (max_retries = 3)';
COMMENT ON COLUMN reel_progress.is_bookmarked IS 'Student bookmarked this reel';
COMMENT ON COLUMN reel_progress.marked_understood IS 'Student marked as understood';
COMMENT ON COLUMN reel_progress.understood_at IS 'When student marked as understood';
COMMENT ON COLUMN reel_progress.replay_count IS 'Number of times student rewatched';
COMMENT ON COLUMN reel_progress.last_position IS 'Last playback position in seconds';
