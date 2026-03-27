import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';

/**
 * GET /api/dashboard/teacher
 * Returns aggregated stats for the teacher dashboard.
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentUser = await getCurrentUser(session);
        if (!currentUser || !isTeacherOrAdmin(currentUser.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Default stats (used when Supabase is not available)
        let stats = {
            totalCourses: 0,
            totalSubjects: 0,
            upcomingLessonsToday: 0,
            totalUpcomingLessons: 0,
            pendingGrading: 0,
            totalStudents: 0,
        };

        if (isSupabaseAdminConfigured && supabaseAdmin) {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const safeQuery = async (query: any) => {
                try { return await query; }
                catch (e) { return { count: 0, data: null, error: e }; }
            };

            const [
                { count: courseCount },
                { count: subjectCount },
                { count: todayLessonCount },
                { count: upcomingCount },
                pendingGradingRes,
                enrollmentsRes
            ] = await Promise.all([
                supabaseAdmin.from('courses').select('id', { count: 'exact', head: true }).eq('teacher_id', currentUser.id),
                supabaseAdmin.from('subjects').select('id', { count: 'exact', head: true }).eq('teacher_id', currentUser.id),
                supabaseAdmin.from('lessons').select('id', { count: 'exact', head: true }).eq('teacher_id', currentUser.id).gte('start_date_time', todayStart.toISOString()).lte('start_date_time', todayEnd.toISOString()),
                supabaseAdmin.from('lessons').select('id', { count: 'exact', head: true }).eq('teacher_id', currentUser.id).gte('end_date_time', new Date().toISOString()),
                safeQuery(supabaseAdmin.from('assessment_submissions').select('id, assessment:assessments!inner(teacher_id)', { count: 'exact', head: true }).eq('assessments.teacher_id', currentUser.id).eq('status', 'submitted')),
                safeQuery(supabaseAdmin.from('enrollments').select('student_id, course:courses!inner(teacher_id)').eq('courses.teacher_id', currentUser.id).eq('status', 'active').limit(5000))
            ]);

            stats.totalCourses = courseCount || 0;
            stats.totalSubjects = subjectCount || 0;
            stats.upcomingLessonsToday = todayLessonCount || 0;
            stats.totalUpcomingLessons = upcomingCount || 0;
            stats.pendingGrading = pendingGradingRes?.count || 0;

            if (enrollmentsRes?.data) {
                const uniqueStudents = new Set(enrollmentsRes.data.map((e: any) => e.student_id));
                stats.totalStudents = uniqueStudents.size;
            }
        }

        const response = NextResponse.json(stats);
        response.headers.set('Cache-Control', 'private, s-maxage=30, stale-while-revalidate=120');
        return response;
    } catch (error: any) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
