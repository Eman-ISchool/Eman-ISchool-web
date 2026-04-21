-- ============================================
-- EDUVERSE DATABASE SCHEMA
-- Supabase/PostgreSQL
-- ============================================

-- Drop existing types if they exist (for clean migration)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS lesson_status CASCADE;
DROP TYPE IF EXISTS attendance_status CASCADE;
DROP TYPE IF EXISTS enrollment_status CASCADE;

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE lesson_status AS ENUM ('scheduled', 'live', 'completed', 'cancelled');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'early_exit');
CREATE TYPE enrollment_status AS ENUM ('active', 'completed', 'dropped', 'pending');

-- ============================================
-- TABLES
-- ============================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    image TEXT,
    role user_role DEFAULT 'student',
    google_id TEXT UNIQUE,
    phone TEXT,
    bio TEXT,
    password_hash TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    base_salary DECIMAL(10,2),
    price_per_lesson DECIMAL(10,2),
    salary_currency TEXT DEFAULT 'AED',
    bank_name TEXT,
    bank_account TEXT,
    address TEXT,
    birth_date DATE,
    previous_education TEXT,
    guardian_name TEXT,
    guardian_email TEXT,
    guardian_phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    duration_hours INTEGER,
    image_url TEXT,
    subject TEXT,
    grade_level TEXT,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT FALSE,
    max_students INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons Table
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_date_time TIMESTAMPTZ NOT NULL,
    end_date_time TIMESTAMPTZ NOT NULL,
    meet_link TEXT,
    google_event_id TEXT,
    google_calendar_link TEXT,
    status lesson_status DEFAULT 'scheduled',
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    recording_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    status attendance_status DEFAULT 'absent',
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ,
    duration_minutes INTEGER DEFAULT 0,
    is_teacher BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(lesson_id, user_id)
);

-- Enrollments Table (Student-Course relationship)
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    status enrollment_status DEFAULT 'active',
    progress_percent INTEGER DEFAULT 0,
    last_accessed TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    UNIQUE(student_id, course_id)
);

-- Meeting Logs Table (detailed tracking)
CREATE TABLE IF NOT EXISTS meeting_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL, -- 'scheduled', 'started', 'ended', 'participant_joined', 'participant_left'
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs Table (for Admin)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL, -- 'create', 'update', 'delete'
    table_name TEXT NOT NULL,
    record_id UUID,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_subject ON courses(subject);

CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher ON lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);
CREATE INDEX IF NOT EXISTS idx_lessons_start_time ON lessons(start_date_time);

CREATE INDEX IF NOT EXISTS idx_attendance_lesson ON attendance(lesson_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);

CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);

CREATE INDEX IF NOT EXISTS idx_meeting_logs_lesson ON meeting_logs(lesson_id);
CREATE INDEX IF NOT EXISTS idx_meeting_logs_event ON meeting_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_meeting_logs_created ON meeting_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Calculate attendance duration
CREATE OR REPLACE FUNCTION calculate_attendance_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.left_at IS NOT NULL AND NEW.joined_at IS NOT NULL THEN
        NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.left_at - NEW.joined_at)) / 60;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Auto-create attendance records when lesson is created
CREATE OR REPLACE FUNCTION create_attendance_for_lesson()
RETURNS TRIGGER AS $$
BEGIN
    -- Create attendance records for all enrolled students
    INSERT INTO attendance (lesson_id, user_id, status, is_teacher)
    SELECT NEW.id, e.student_id, 'absent', FALSE
    FROM enrollments e
    WHERE e.course_id = NEW.course_id AND e.status = 'active'
    ON CONFLICT (lesson_id, user_id) DO NOTHING;
    
    -- Create attendance record for teacher
    IF NEW.teacher_id IS NOT NULL THEN
        INSERT INTO attendance (lesson_id, user_id, status, is_teacher)
        VALUES (NEW.id, NEW.teacher_id, 'absent', TRUE)
        ON CONFLICT (lesson_id, user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Update lesson status based on time
CREATE OR REPLACE FUNCTION update_lesson_status()
RETURNS TRIGGER AS $$
BEGIN
    -- If current time is past end_date_time and status is not cancelled
    IF NEW.end_date_time < NOW() AND NEW.status NOT IN ('completed', 'cancelled') THEN
        NEW.status = 'completed';
    END IF;
    
    -- If current time is between start and end and status is scheduled
    IF NEW.start_date_time <= NOW() AND NEW.end_date_time > NOW() AND NEW.status = 'scheduled' THEN
        NEW.status = 'live';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- TRIGGERS
-- ============================================

-- Users updated_at trigger
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Courses updated_at trigger
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Lessons updated_at trigger
DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Attendance updated_at and duration trigger
DROP TRIGGER IF EXISTS update_attendance_updated_at ON attendance;
CREATE TRIGGER update_attendance_updated_at
    BEFORE UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS calculate_attendance_duration_trigger ON attendance;
CREATE TRIGGER calculate_attendance_duration_trigger
    BEFORE INSERT OR UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION calculate_attendance_duration();

-- Create attendance records when lesson is created
DROP TRIGGER IF EXISTS create_attendance_on_lesson ON lessons;
CREATE TRIGGER create_attendance_on_lesson
    AFTER INSERT ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION create_attendance_for_lesson();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = google_id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = google_id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE google_id = auth.uid()::text AND role = 'admin')
    );

CREATE POLICY "Admins can manage all users" ON users
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE google_id = auth.uid()::text AND role = 'admin')
    );

-- Service role bypass for API operations
CREATE POLICY "Service role full access to users" ON users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to courses" ON courses
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to lessons" ON lessons
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to attendance" ON attendance
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to enrollments" ON enrollments
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to meeting_logs" ON meeting_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to audit_logs" ON audit_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to notifications" ON notifications
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- VIEWS
-- ============================================

-- Lesson Statistics View
CREATE OR REPLACE VIEW lesson_stats AS
SELECT 
    l.id as lesson_id,
    l.title,
    l.start_date_time,
    l.end_date_time,
    l.status,
    c.title as course_title,
    u.name as teacher_name,
    COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.user_id END) as present_count,
    COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN a.user_id END) as absent_count,
    COUNT(DISTINCT CASE WHEN a.status = 'late' THEN a.user_id END) as late_count,
    COUNT(DISTINCT CASE WHEN NOT a.is_teacher THEN a.user_id END) as total_students,
    AVG(CASE WHEN NOT a.is_teacher THEN a.duration_minutes END) as avg_duration_minutes
FROM lessons l
LEFT JOIN courses c ON l.course_id = c.id
LEFT JOIN users u ON l.teacher_id = u.id
LEFT JOIN attendance a ON l.id = a.lesson_id
GROUP BY l.id, l.title, l.start_date_time, l.end_date_time, l.status, c.title, u.name;

-- User Attendance Summary View
CREATE OR REPLACE VIEW user_attendance_summary AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    u.role,
    COUNT(DISTINCT a.lesson_id) as total_lessons,
    COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.lesson_id END) as lessons_attended,
    COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN a.lesson_id END) as lessons_missed,
    COUNT(DISTINCT CASE WHEN a.status = 'late' THEN a.lesson_id END) as lessons_late,
    ROUND(
        (COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.lesson_id END)::numeric / 
        NULLIF(COUNT(DISTINCT a.lesson_id), 0) * 100), 2
    ) as attendance_rate
FROM users u
LEFT JOIN attendance a ON u.id = a.user_id
WHERE u.role IN ('student', 'teacher')
GROUP BY u.id, u.name, u.email, u.role;

-- Teacher Performance View
CREATE OR REPLACE VIEW teacher_performance AS
SELECT 
    u.id as teacher_id,
    u.name as teacher_name,
    u.email,
    COUNT(DISTINCT c.id) as courses_count,
    COUNT(DISTINCT l.id) as total_lessons,
    COUNT(DISTINCT CASE WHEN l.status = 'completed' THEN l.id END) as completed_lessons,
    COUNT(DISTINCT e.student_id) as total_students,
    AVG(ls.present_count::numeric / NULLIF(ls.total_students, 0) * 100) as avg_attendance_rate
FROM users u
LEFT JOIN courses c ON u.id = c.teacher_id
LEFT JOIN lessons l ON u.id = l.teacher_id
LEFT JOIN enrollments e ON c.id = e.course_id
LEFT JOIN lesson_stats ls ON l.id = ls.lesson_id
WHERE u.role = 'teacher'
GROUP BY u.id, u.name, u.email;

-- Dashboard Stats View
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
    (SELECT COUNT(*) FROM users WHERE role = 'teacher') as total_teachers,
    (SELECT COUNT(*) FROM courses WHERE is_published = TRUE) as total_courses,
    (SELECT COUNT(*) FROM lessons) as total_lessons,
    (SELECT COUNT(*) FROM lessons WHERE status = 'scheduled' AND start_date_time > NOW()) as upcoming_lessons,
    (SELECT COUNT(*) FROM lessons WHERE status = 'completed') as completed_lessons,
    (SELECT COUNT(*) FROM lessons WHERE DATE(start_date_time) = CURRENT_DATE) as today_lessons,
    (SELECT COUNT(*) FROM lessons WHERE start_date_time >= DATE_TRUNC('week', NOW())) as this_week_lessons,
    (SELECT COUNT(*) FROM enrollments WHERE status = 'active') as active_enrollments;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment to insert sample admin user
-- INSERT INTO users (email, name, role, google_id)
-- VALUES ('admin@eduverse.com', 'Admin User', 'admin', 'admin-google-id')
-- ON CONFLICT (email) DO NOTHING;
