import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
interface CurrentUser {
    id: string;
    email: string;
    name: string;
    role: string;
    googleId: string;
}

interface TodayLessonRow {
    id: string;
    title: string;
    start_date_time: string;
    end_date_time: string;
    status: string;
    meet_link: string | null;
    teacher: { id: string; name: string; image: string | null } | null;
}

interface DashboardStatsResponse {
    totalLessons: number;
    upcomingLessons: number;
    completedLessons: number;
    totalStudents: number;
    todayLessons: Array<{
        _id: string;
        title: string;
        startDateTime: string;
        endDateTime: string;
        status: string;
        meetLink: string | null;
        teacher: { id: string; name: string; image: string | null } | null;
    }>;
    thisWeekLessons: number;
}

export async function GET() {
    const session = await getServerSession(authOptions);
    const currentUser: CurrentUser | null = session ? await getCurrentUser(session) : null;

    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
        const weekStart = getWeekStart();
        const weekEnd = getWeekEnd();

        const isTeacher = currentUser?.role === 'teacher';
        const teacherId = currentUser?.id;

        // Parallel queries for better performance
        const [
            totalLessonsResult,
            upcomingLessonsResult,
            completedLessonsResult,
            totalStudentsResult,
            todayLessonsResult,
            thisWeekLessonsResult
        ] = await Promise.all([
            // Total lessons count
            isTeacher && teacherId
                ? supabaseAdmin.from('lessons').select('*', { count: 'exact', head: true }).eq('teacher_id', teacherId)
                : supabaseAdmin.from('lessons').select('*', { count: 'exact', head: true }),

            // Upcoming lessons count
            isTeacher && teacherId
                ? supabaseAdmin.from('lessons').select('*', { count: 'exact', head: true })
                    .eq('teacher_id', teacherId)
                    .eq('status', 'scheduled')
                    .gte('start_date_time', now.toISOString())
                : supabaseAdmin.from('lessons').select('*', { count: 'exact', head: true })
                    .eq('status', 'scheduled')
                    .gte('start_date_time', now.toISOString()),

            // Completed lessons count
            isTeacher && teacherId
                ? supabaseAdmin.from('lessons').select('*', { count: 'exact', head: true })
                    .eq('teacher_id', teacherId)
                    .eq('status', 'completed')
                : supabaseAdmin.from('lessons').select('*', { count: 'exact', head: true })
                    .eq('status', 'completed'),

            // Total students count
            supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),

            // Today's lessons
            isTeacher && teacherId
                ? supabaseAdmin.from('lessons')
                    .select(`
                        id,
                        title,
                        start_date_time,
                        end_date_time,
                        status,
                        meet_link,
                        teacher:users!lessons_teacher_id_fkey(id, name, image)
                    `)
                    .eq('teacher_id', teacherId)
                    .gte('start_date_time', todayStart)
                    .lte('start_date_time', todayEnd)
                    .order('start_date_time', { ascending: true })
                : supabaseAdmin.from('lessons')
                    .select(`
                        id,
                        title,
                        start_date_time,
                        end_date_time,
                        status,
                        meet_link,
                        teacher:users!lessons_teacher_id_fkey(id, name, image)
                    `)
                    .gte('start_date_time', todayStart)
                    .lte('start_date_time', todayEnd)
                    .order('start_date_time', { ascending: true }),

            // This week's lessons count
            isTeacher && teacherId
                ? supabaseAdmin.from('lessons').select('*', { count: 'exact', head: true })
                    .eq('teacher_id', teacherId)
                    .gte('start_date_time', weekStart)
                    .lte('start_date_time', weekEnd)
                : supabaseAdmin.from('lessons').select('*', { count: 'exact', head: true })
                    .gte('start_date_time', weekStart)
                    .lte('start_date_time', weekEnd),
        ]);

        // Transform today's lessons to match expected format
        const todayLessons = (todayLessonsResult.data as TodayLessonRow[] | null)?.map((lesson) => ({
            _id: lesson.id,
            title: lesson.title,
            startDateTime: lesson.start_date_time,
            endDateTime: lesson.end_date_time,
            status: lesson.status,
            meetLink: lesson.meet_link,
            teacher: lesson.teacher,
        })) || [];

        const statsResponse: DashboardStatsResponse = {
            totalLessons: totalLessonsResult.count || 0,
            upcomingLessons: upcomingLessonsResult.count || 0,
            completedLessons: completedLessonsResult.count || 0,
            totalStudents: totalStudentsResult.count || 0,
            todayLessons,
            thisWeekLessons: thisWeekLessonsResult.count || 0,
        };

        const response = NextResponse.json(statsResponse);
        response.headers.set('Cache-Control', 'private, s-maxage=30, stale-while-revalidate=120');
        return response;
    } catch (error: unknown) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
}

function getWeekStart(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0);
    return weekStart.toISOString();
}

function getWeekEnd(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + 7;
    const weekEnd = new Date(now.getFullYear(), now.getMonth(), diff, 23, 59, 59);
    return weekEnd.toISOString();
}
