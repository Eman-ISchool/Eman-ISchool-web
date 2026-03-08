import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import TeacherHomeClient from './TeacherHomeClient';

export default async function TeacherHomePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect('/auth/signin');
    }

    const currentUser = await getCurrentUser(session);
    if (!currentUser || !isTeacherOrAdmin(currentUser.role)) {
        redirect('/auth/error?error=AccessDenied');
    }

    let stats = {
        totalCourses: 0,
        totalSubjects: 0,
        upcomingLessonsToday: 0,
        totalUpcomingLessons: 0,
        pendingGrading: 0,
        totalStudents: 0,
    };

    let upcomingLessons: any[] = [];

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
            enrollmentsRes,
            { data: lessonsData }
        ] = await Promise.all([
            supabaseAdmin.from('courses').select('*', { count: 'exact', head: true }).eq('teacher_id', currentUser.id),
            supabaseAdmin.from('subjects').select('*', { count: 'exact', head: true }).eq('teacher_id', currentUser.id),
            supabaseAdmin.from('lessons').select('*', { count: 'exact', head: true }).eq('teacher_id', currentUser.id).gte('start_date_time', todayStart.toISOString()).lte('start_date_time', todayEnd.toISOString()),
            supabaseAdmin.from('lessons').select('*', { count: 'exact', head: true }).eq('teacher_id', currentUser.id).gte('end_date_time', new Date().toISOString()),
            safeQuery(supabaseAdmin.from('assessment_submissions').select('*, assessment:assessments!inner(teacher_id)', { count: 'exact', head: true }).eq('assessments.teacher_id', currentUser.id).eq('status', 'submitted')),
            safeQuery(supabaseAdmin.from('enrollments').select('student_id, course:courses!inner(teacher_id)').eq('courses.teacher_id', currentUser.id).eq('status', 'active')),
            supabaseAdmin.from('lessons').select(`
                *,
                course:courses(id, title, slug),
                teacher:users!lessons_teacher_id_fkey(id, name, email, image)
            `).eq('teacher_id', currentUser.id).gte('end_date_time', new Date().toISOString()).order('start_date_time', { ascending: true }).limit(10)
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

        if (lessonsData) {
            upcomingLessons = lessonsData.map((lesson: any) => ({
                _id: lesson.id,
                title: lesson.title,
                description: lesson.description || '',
                startDateTime: lesson.start_date_time,
                endDateTime: lesson.end_date_time,
                meetLink: lesson.meet_link || '',
                status: lesson.status,
                course: lesson.course,
                teacher: lesson.teacher,
                googleEventId: lesson.google_event_id || '',
                googleCalendarLink: lesson.google_calendar_link || '',
                meetingTitle: lesson.meeting_title || '',
                meetingProvider: lesson.meeting_provider || '',
                meetingDurationMin: lesson.meeting_duration_min || 0,
            }));
        }
    }

    return (
        <TeacherHomeClient
            initialStats={stats}
            initialLessons={upcomingLessons}
            user={currentUser}
        />
    );
}
