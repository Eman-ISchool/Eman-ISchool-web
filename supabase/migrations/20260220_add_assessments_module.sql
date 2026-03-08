-- ============================================
-- EDUVERSE ASSESSMENTS MODULE MIGRATION
-- Date: 2026-02-20
-- ============================================

-- ============================================
-- 1. EXTEND ENUMS
-- ============================================

-- Expand material_type if needed, or we might not need to if assessments are their own entity
-- Let's just create the tables

-- ============================================
-- 2. NEW TABLES
-- ============================================

-- Assessments Table
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    short_description TEXT,
    long_description TEXT,
    image_url TEXT,
    duration_minutes INTEGER, -- If NULL -> no time limit
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessment Questions Table
CREATE TABLE IF NOT EXISTS assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_type TEXT NOT NULL, -- 'multiple_choice', 'text', 'file_upload'
    question_text TEXT NOT NULL,
    image_url TEXT,
    is_mandatory BOOLEAN DEFAULT TRUE,
    options_json JSONB, -- For multiple choice: [{'text': 'A', 'is_correct': true}, ...]
    points INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessment Submissions Table
CREATE TABLE IF NOT EXISTS assessment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'in_progress', -- 'in_progress', 'submitted', 'graded'
    started_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    time_taken_minutes INTEGER,
    total_score INTEGER,
    max_score INTEGER,
    manual_grading_required BOOLEAN DEFAULT FALSE,
    teacher_feedback TEXT,
    file_url TEXT, -- For manual whole-exam paper upload
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessment Answers Table
CREATE TABLE IF NOT EXISTS assessment_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES assessment_submissions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text_answer TEXT,
    selected_option_index INTEGER,
    file_url TEXT,
    is_correct BOOLEAN,
    points_awarded INTEGER,
    teacher_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_assessments_teacher ON assessments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assessments_course ON assessments(course_id);
CREATE INDEX IF NOT EXISTS idx_assessments_subject ON assessments(subject_id);
CREATE INDEX IF NOT EXISTS idx_assessments_lesson ON assessments(lesson_id);

CREATE INDEX IF NOT EXISTS idx_assessment_questions_assessment ON assessment_questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_sort ON assessment_questions(sort_order);

CREATE INDEX IF NOT EXISTS idx_assessment_submissions_assessment ON assessment_submissions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_submissions_student ON assessment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_submissions_status ON assessment_submissions(status);

CREATE INDEX IF NOT EXISTS idx_assessment_answers_submission ON assessment_answers(submission_id);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_question ON assessment_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_student ON assessment_answers(student_id);

-- ============================================
-- 4. TRIGGERS
-- ============================================

CREATE TRIGGER update_assessments_updated_at
    BEFORE UPDATE ON assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_questions_updated_at
    BEFORE UPDATE ON assessment_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_submissions_updated_at
    BEFORE UPDATE ON assessment_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_answers_updated_at
    BEFORE UPDATE ON assessment_answers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access to assessments" ON assessments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to assessment_questions" ON assessment_questions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to assessment_submissions" ON assessment_submissions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to assessment_answers" ON assessment_answers FOR ALL USING (auth.role() = 'service_role');

-- Teachers can manage their own assessments
CREATE POLICY "Teachers can manage their assessments" ON assessments
    FOR ALL USING (teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text));

-- Students can view published assessments in their courses/subjects
CREATE POLICY "Students can view published course assessments" ON assessments
    FOR SELECT USING (
        is_published = TRUE AND (
            EXISTS (
                SELECT 1 FROM enrollments e
                WHERE e.student_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
                AND e.course_id = assessments.course_id
                AND e.status = 'active'
            )
            OR
            EXISTS (
                SELECT 1 FROM enrollments e
                JOIN subjects s ON s.course_id = e.course_id
                WHERE e.student_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
                AND s.id = assessments.subject_id
                AND e.status = 'active'
            )
            OR
            EXISTS (
                SELECT 1 FROM enrollments e
                JOIN lessons l ON l.course_id = e.course_id
                WHERE e.student_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
                AND l.id = assessments.lesson_id
                AND e.status = 'active'
            )
        )
    );

-- Anyone can view questions for assessments they can view
CREATE POLICY "Users can view questions for visible assessments" ON assessment_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM assessments a
            WHERE a.id = assessment_questions.assessment_id
        )
    );

CREATE POLICY "Teachers can manage questions for their assessments" ON assessment_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM assessments a
            WHERE a.id = assessment_questions.assessment_id
            AND a.teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
        )
    );

-- Students can view their own submissions and answers
CREATE POLICY "Students can view their submissions" ON assessment_submissions
    FOR SELECT USING (student_id = (SELECT id FROM users WHERE google_id = auth.uid()::text));

CREATE POLICY "Students can insert their submissions" ON assessment_submissions
    FOR INSERT WITH CHECK (student_id = (SELECT id FROM users WHERE google_id = auth.uid()::text));

CREATE POLICY "Students can update their submissions" ON assessment_submissions
    FOR UPDATE USING (student_id = (SELECT id FROM users WHERE google_id = auth.uid()::text));

CREATE POLICY "Teachers can view submissions for their assessments" ON assessment_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM assessments a
            WHERE a.id = assessment_submissions.assessment_id
            AND a.teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
        )
    );

CREATE POLICY "Teachers can update submissions for their assessments" ON assessment_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM assessments a
            WHERE a.id = assessment_submissions.assessment_id
            AND a.teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
        )
    );

-- Answers
CREATE POLICY "Students can view their answers" ON assessment_answers
    FOR SELECT USING (student_id = (SELECT id FROM users WHERE google_id = auth.uid()::text));

CREATE POLICY "Students can insert their answers" ON assessment_answers
    FOR INSERT WITH CHECK (student_id = (SELECT id FROM users WHERE google_id = auth.uid()::text));

CREATE POLICY "Students can update their answers" ON assessment_answers
    FOR UPDATE USING (student_id = (SELECT id FROM users WHERE google_id = auth.uid()::text));

CREATE POLICY "Teachers can view answers for their assessments" ON assessment_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM assessments a
            JOIN assessment_submissions sub ON sub.assessment_id = a.id
            WHERE sub.id = assessment_answers.submission_id
            AND a.teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
        )
    );

CREATE POLICY "Teachers can update answers for their assessments" ON assessment_answers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM assessments a
            JOIN assessment_submissions sub ON sub.assessment_id = a.id
            WHERE sub.id = assessment_answers.submission_id
            AND a.teacher_id = (SELECT id FROM users WHERE google_id = auth.uid()::text)
        )
    );

-- Admins can do anything
CREATE POLICY "Admins can manage all assessments" ON assessments FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE google_id = auth.uid()::text AND role = 'admin'));
CREATE POLICY "Admins can manage all questions" ON assessment_questions FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE google_id = auth.uid()::text AND role = 'admin'));
CREATE POLICY "Admins can manage all submissions" ON assessment_submissions FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE google_id = auth.uid()::text AND role = 'admin'));
CREATE POLICY "Admins can manage all answers" ON assessment_answers FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE google_id = auth.uid()::text AND role = 'admin'));
