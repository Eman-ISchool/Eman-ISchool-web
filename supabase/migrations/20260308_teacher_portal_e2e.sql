-- Teacher portal E2E + performance hardening
-- Date: 2026-03-08

BEGIN;

-- Core list/filter indexes
CREATE INDEX IF NOT EXISTS idx_grades_supervisor_id ON public.grades(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_courses_grade_id ON public.courses(grade_id);
CREATE INDEX IF NOT EXISTS idx_courses_grade_teacher ON public.courses(grade_id, teacher_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_grade_student ON public.enrollments(grade_id, student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_student ON public.enrollments(course_id, student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_teacher_start ON public.lessons(course_id, teacher_id, start_date_time);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_id ON public.lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_status ON public.payments(invoice_id, status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_course_student ON public.invoice_items(course_id, student_id);

-- Grade-level fee structure table
CREATE TABLE IF NOT EXISTS public.grade_fee_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id UUID NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grade_fee_items_grade_due ON public.grade_fee_items(grade_id, due_date);

ALTER TABLE public.grade_fee_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers/Admins can read grade_fee_items" ON public.grade_fee_items;
CREATE POLICY "Teachers/Admins can read grade_fee_items" ON public.grade_fee_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'supervisor', 'teacher')
    )
  );

DROP POLICY IF EXISTS "Teachers/Admins can write grade_fee_items" ON public.grade_fee_items;
CREATE POLICY "Teachers/Admins can write grade_fee_items" ON public.grade_fee_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'supervisor', 'teacher')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'supervisor', 'teacher')
    )
  );

-- Defensive RLS policies for lesson/enrollment visibility
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS student_enrolled_lessons ON public.lessons;
CREATE POLICY student_enrolled_lessons ON public.lessons
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.enrollments e
      WHERE e.course_id = lessons.course_id
        AND e.student_id = auth.uid()
        AND e.status = 'active'
    )
    OR EXISTS (
      SELECT 1
      FROM public.courses c
      WHERE c.id = lessons.course_id
        AND c.teacher_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'supervisor')
    )
  );

DROP POLICY IF EXISTS student_view_own_enrollments ON public.enrollments;
CREATE POLICY student_view_own_enrollments ON public.enrollments
  FOR SELECT
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.courses c
      WHERE c.id = enrollments.course_id
        AND c.teacher_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'supervisor')
    )
  );

COMMIT;
