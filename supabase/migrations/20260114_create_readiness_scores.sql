-- ============================================
-- EXAM READINESS SCORES TABLE
-- Part of Exam Readiness Scoring System
-- Caches calculated readiness scores
-- ============================================

-- Exam Readiness Scores Table
CREATE TABLE IF NOT EXISTS exam_readiness_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    overall_score DECIMAL(5,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    attendance_score DECIMAL(5,2) CHECK (attendance_score >= 0 AND attendance_score <= 100),
    assignment_score DECIMAL(5,2) CHECK (assignment_score >= 0 AND assignment_score <= 100),
    exam_score DECIMAL(5,2) CHECK (exam_score >= 0 AND exam_score <= 100),
    weak_areas JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_readiness_scores_student ON exam_readiness_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_readiness_scores_course ON exam_readiness_scores(course_id);
CREATE INDEX IF NOT EXISTS idx_readiness_scores_calculated ON exam_readiness_scores(calculated_at);
CREATE INDEX IF NOT EXISTS idx_readiness_scores_overall_score ON exam_readiness_scores(overall_score);

-- ============================================
-- TRIGGERS
-- ============================================

-- Exam Readiness Scores updated_at trigger
DROP TRIGGER IF EXISTS update_exam_readiness_scores_updated_at ON exam_readiness_scores;
CREATE TRIGGER update_exam_readiness_scores_updated_at
    BEFORE UPDATE ON exam_readiness_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on exam readiness scores table
ALTER TABLE exam_readiness_scores ENABLE ROW LEVEL SECURITY;

-- Service role full access for API operations
CREATE POLICY "Service role full access to exam_readiness_scores" ON exam_readiness_scores
    FOR ALL USING (auth.role() = 'service_role');
