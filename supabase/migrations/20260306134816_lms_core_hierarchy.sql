-- Migration: LMS Core Hierarchy (Grades -> Courses -> Lessons)
-- Date: 2026-03-06

BEGIN;

-- 1. Create or ensure `grades` table exists
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    level INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create or ensure `courses` table exists
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    grade_id UUID REFERENCES public.grades(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enforce 1-to-1 Teacher-to-Course constraint (FR-002)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'uq_course_teacher' AND conrelid = 'public.courses'::regclass
  ) THEN
    ALTER TABLE public.courses ADD CONSTRAINT uq_course_teacher UNIQUE (teacher_id);
  END IF;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- 3. Create or ensure `lessons` table exists
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create or ensure `attendance_records` table exists
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    join_time TIMESTAMPTZ,
    leave_time TIMESTAMPTZ,
    last_heartbeat TIMESTAMPTZ,
    status TEXT CHECK (status IN ('present', 'late', 'absent', 'excused')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(lesson_id, student_id)
);

-- Link assessments to lessons (US4)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assessments') THEN
    ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'homework') THEN
    ALTER TABLE public.homework ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ==========================================
-- T002: RLS Policies for the new hierarchy
-- ==========================================
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Policies for Grades
DROP POLICY IF EXISTS "Enable read access for all users" ON public.grades;
CREATE POLICY "Enable read access for all users" ON public.grades FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert grades" ON public.grades;
CREATE POLICY "Admins can insert grades" ON public.grades FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Admins can update grades" ON public.grades;
CREATE POLICY "Admins can update grades" ON public.grades FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Admins can delete grades" ON public.grades;
CREATE POLICY "Admins can delete grades" ON public.grades FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Policies for Courses
DROP POLICY IF EXISTS "Enable read access for all users" ON public.courses;
CREATE POLICY "Enable read access for all users" ON public.courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert courses" ON public.courses;
CREATE POLICY "Admins can insert courses" ON public.courses FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Admins and assigned Teachers can update courses" ON public.courses;
CREATE POLICY "Admins and assigned Teachers can update courses" ON public.courses FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    OR teacher_id = auth.uid()
);
DROP POLICY IF EXISTS "Admins can delete courses" ON public.courses;
CREATE POLICY "Admins can delete courses" ON public.courses FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Policies for Lessons
DROP POLICY IF EXISTS "Enable read access for all users" ON public.lessons;
CREATE POLICY "Enable read access for all users" ON public.lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Teachers can insert lessons for their courses" ON public.lessons;
CREATE POLICY "Teachers can insert lessons for their courses" ON public.lessons FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') OR
    EXISTS (SELECT 1 FROM courses WHERE id = course_id AND teacher_id = auth.uid())
);
DROP POLICY IF EXISTS "Teachers can update their lessons" ON public.lessons;
CREATE POLICY "Teachers can update their lessons" ON public.lessons FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') OR
    EXISTS (SELECT 1 FROM courses WHERE id = course_id AND teacher_id = auth.uid())
);
DROP POLICY IF EXISTS "Teachers can delete their lessons" ON public.lessons;
CREATE POLICY "Teachers can delete their lessons" ON public.lessons FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') OR
    EXISTS (SELECT 1 FROM courses WHERE id = course_id AND teacher_id = auth.uid())
);

-- Policies for Attendance
DROP POLICY IF EXISTS "Students can view their own and Teachers can view their lessons attendance" ON public.attendance_records;
CREATE POLICY "Students can view their own and Teachers can view their lessons attendance" ON public.attendance_records FOR SELECT USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') OR
    EXISTS (SELECT 1 FROM lessons JOIN courses ON lessons.course_id = courses.id WHERE lessons.id = lesson_id AND courses.teacher_id = auth.uid())
);

DROP POLICY IF EXISTS "System/Students can insert their attendance" ON public.attendance_records;
CREATE POLICY "System/Students can insert their attendance" ON public.attendance_records FOR INSERT WITH CHECK (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "System/Students can update their attendance" ON public.attendance_records;
CREATE POLICY "System/Students can update their attendance" ON public.attendance_records FOR UPDATE USING (
    student_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM lessons JOIN courses ON lessons.course_id = courses.id WHERE lessons.id = lesson_id AND courses.teacher_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

COMMIT;
