-- ============================================
-- EXAM SIMULATIONS AND ATTEMPTS TABLES
-- Part of Exam Readiness Scoring System
-- ============================================

-- Exam Simulations Table
CREATE TABLE IF NOT EXISTS exam_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    total_score INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exam Attempts Table
CREATE TABLE IF NOT EXISTS exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exam_simulations(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    time_taken_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_exam_simulations_course ON exam_simulations(course_id);
CREATE INDEX IF NOT EXISTS idx_exam_simulations_created ON exam_simulations(created_at);

CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam ON exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_student ON exam_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_completed ON exam_attempts(completed_at);

-- ============================================
-- TRIGGERS
-- ============================================

-- Exam Simulations updated_at trigger
DROP TRIGGER IF EXISTS update_exam_simulations_updated_at ON exam_simulations;
CREATE TRIGGER update_exam_simulations_updated_at
    BEFORE UPDATE ON exam_simulations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Exam Attempts updated_at trigger
DROP TRIGGER IF EXISTS update_exam_attempts_updated_at ON exam_attempts;
CREATE TRIGGER update_exam_attempts_updated_at
    BEFORE UPDATE ON exam_attempts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on exam tables
ALTER TABLE exam_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

-- Service role full access for API operations
CREATE POLICY "Service role full access to exam_simulations" ON exam_simulations
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to exam_attempts" ON exam_attempts
    FOR ALL USING (auth.role() = 'service_role');
