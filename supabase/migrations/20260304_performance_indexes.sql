-- ==========================================
-- Performance Indexes for Dashboard Slowness
-- ==========================================

-- Courses
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);

-- Lessons
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_id ON lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_start_date_time ON lessons(start_date_time);
CREATE INDEX IF NOT EXISTS idx_lessons_end_date_time ON lessons(end_date_time);

-- Subjects
-- (idx_subjects_teacher already exists from 20260211, but adding IF NOT EXISTS just in case)
CREATE INDEX IF NOT EXISTS idx_subjects_teacher_id ON subjects(teacher_id);

-- Enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);

-- Assessment Submissions
CREATE INDEX IF NOT EXISTS idx_assessment_submissions_status ON assessment_submissions(status);
