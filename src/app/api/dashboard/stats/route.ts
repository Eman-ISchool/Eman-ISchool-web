import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    const session = await getServerSession(authOptions);
    const currentUser = session ? await getCurrentUser(session) : null;

    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
        const weekStart = getWeekStart();
        const weekEnd = getWeekEnd();

        // Build queries based on user role
        let lessonsQuery = supabaseAdmin.from('lessons');

        // If user is a teacher, only show their lessons
        if (currentUser?.role === 'teacher') {
            lessonsQuery = lessonsQuery.select('*').eq('teacher_id', currentUser.id);
        }

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
            currentUser?.role === 'teacher'
                ? supabaseAdmin.from('lessons').select('*', { count: 'exact', head: true }).eq('teacher_id', currentUser.id)
                : supabaseAdmin.from('lessons').select('*', { count: 'exact', head: true }),

            // Upcoming lessons count
            currentUser?.role === 'teacher'
                ? supabaseAdmin.from('lessons').select('*', { count: 'exact', head: true })
                    .eq('teacher_id', currentUser.id)
                    .eq('status', 'scheduled')
                    .gte('start_date_time', now.toISOString())
                : supabaseAdmin.from('lessons').select('*', { count: 'exact', head: true })
                    .eq('status', 'scheduled')
                    .gte('start_date_time', now.toISOString()),

            // Completed lessons count
            currentUser?.role === 'teacher'
                ? supabaseAdmin.from('lessons').select('*', { count: 'exact', head: true })
                    .eq('teacher_id', currentUser.id)
                    .eq('status', 'completed')
                : supabaseAdmin.from('lessons').select('*', { count: 'exact', head: true })
                    .eq('status', 'completed'),

            // Total students count
            supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),

            // Today's lessons
            currentUser?.role === 'teacher'
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
                    .eq('teacher_id', currentUser.id)
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
            currentUser?.role === 'teacher'
                ? supabaseAdmin.from('lessons').select('*', { count: 'exact', head: true })
                    .eq('teacher_id', currentUser.id)
                    .gte('start_date_time', weekStart)
                    .lte('start_date_time', weekEnd)
                : supabaseAdmin.from('lessons').select('*', { count: 'exact', head: true })
                    .gte('start_date_time', weekStart)
                    .lte('start_date_time', weekEnd),
        ]);

        // Transform today's lessons to match expected format
        const todayLessons = todayLessonsResult.data?.map(lesson => ({
            _id: lesson.id,
            title: lesson.title,
            startDateTime: lesson.start_date_time,
            endDateTime: lesson.end_date_time,
            status: lesson.status,
            meetLink: lesson.meet_link,
            teacher: lesson.teacher,
        })) || [];

        return NextResponse.json({
            totalLessons: totalLessonsResult.count || 0,
            upcomingLessons: upcomingLessonsResult.count || 0,
            completedLessons: completedLessonsResult.count || 0,
            totalStudents: totalStudentsResult.count || 0,
            todayLessons,
            thisWeekLessons: thisWeekLessonsResult.count || 0,
        });
    } catch (error) {
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
