import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isTeacherOrAdmin } from '@/lib/auth';
import { withLocalePrefix } from '@/lib/locale-path';
import { getMockDb } from '@/lib/mockDb';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';
import TeacherGradesClient, { TeacherGradeRecord } from '@/components/teacher/TeacherGradesClient';

async function loadTeacherGrades(userId: string, userRole: string): Promise<TeacherGradeRecord[]> {
  if (process.env.TEST_BYPASS === 'true') {
    const db = getMockDb();
    const grades = Array.isArray(db.grades) ? db.grades : [];
    const courses = Array.isArray(db.courses) ? db.courses : [];

    const counts = new Map<string, number>();
    for (const course of courses) {
      if (!course?.grade_id) continue;
      counts.set(course.grade_id, (counts.get(course.grade_id) || 0) + 1);
    }

    return grades
      .filter((grade: any) => userRole !== 'teacher' || !grade.supervisor_id || grade.supervisor_id === userId)
      .map((grade: any) => ({
        id: grade.id,
        name: grade.name || grade.name_en || 'Grade',
        name_en: grade.name_en || null,
        description: grade.description || null,
        slug: grade.slug || grade.id,
        sort_order: Number(grade.sort_order || 0),
        is_active: grade.is_active !== false,
        course_count: counts.get(grade.id) || 0,
      }))
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return [];
  }

  const gradeQuery = supabaseAdmin
    .from('grades')
    .select('id, name, name_en, description, slug, sort_order, is_active, supervisor_id')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (userRole === 'teacher') {
    gradeQuery.eq('supervisor_id', userId);
  }

  const { data: gradesData, error: gradesError } = await gradeQuery;
  if (gradesError || !gradesData) {
    console.error('Failed to load grades', gradesError);
    return [];
  }

  const { data: coursesData } = await supabaseAdmin
    .from('courses')
    .select('grade_id')
    .not('grade_id', 'is', null);

  const counts = new Map<string, number>();
  for (const row of coursesData || []) {
    const gradeId = (row as any).grade_id;
    if (!gradeId) continue;
    counts.set(gradeId, (counts.get(gradeId) || 0) + 1);
  }

  return gradesData.map((grade: any) => ({
    id: grade.id,
    name: grade.name || grade.name_en || 'Grade',
    name_en: grade.name_en || null,
    description: grade.description || null,
    slug: grade.slug || grade.id,
    sort_order: Number(grade.sort_order || 0),
    is_active: grade.is_active !== false,
    course_count: counts.get(grade.id) || 0,
  }));
}

export default async function TeacherGradesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(withLocalePrefix('/login/teacher', locale));
  }

  const currentUser = await getCurrentUser(session);
  if (!currentUser || !isTeacherOrAdmin(currentUser.role)) {
    redirect(withLocalePrefix('/', locale));
  }

  const grades = await loadTeacherGrades(currentUser.id, currentUser.role);

  return <TeacherGradesClient locale={locale} initialGrades={grades} />;
}
