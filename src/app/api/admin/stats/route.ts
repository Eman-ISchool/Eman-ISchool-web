import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Fetch comprehensive dashboard statistics (Admin only)
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser || !isAdmin(currentUser.role)) {
        return NextResponse.json({ error: 'غير مصرح. يحتاج لصلاحيات مدير.' }, { status: 403 });
    }

    try {
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        // Get user counts by role
        const { data: userCounts } = await supabaseAdmin
            .from('users')
            .select('role')
            .order('role');

        const studentCount = userCounts?.filter(u => u.role === 'student').length || 0;
        const teacherCount = userCounts?.filter(u => u.role === 'teacher').length || 0;
        const adminCount = userCounts?.filter(u => u.role === 'admin').length || 0;

        // Get course stats
        const { count: totalCourses } = await supabaseAdmin
            .from('courses')
            .select('*', { count: 'exact', head: true });

        const { count: publishedCourses } = await supabaseAdmin
            .from('courses')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true);

        // Get lesson stats
        const { count: totalLessons } = await supabaseAdmin
            .from('lessons')
            .select('*', { count: 'exact', head: true });

        const { count: upcomingLessons } = await supabaseAdmin
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'scheduled')
            .gte('start_date_time', new Date().toISOString());

        const { count: completedLessons } = await supabaseAdmin
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'completed');

        const { data: todayLessons } = await supabaseAdmin
            .from('lessons')
            .select(`
                *,
                teacher:users!lessons_teacher_id_fkey(id, name, image),
                course:courses(id, title)
            `)
            .gte('start_date_time', startOfDay)
            .order('start_date_time', { ascending: true })
            .limit(10);

        const { count: thisWeekLessons } = await supabaseAdmin
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .gte('start_date_time', startOfWeek);

        // Get enrollment stats
        const { count: activeEnrollments } = await supabaseAdmin
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

        // Get attendance stats
        const { data: attendanceStats } = await supabaseAdmin
            .from('attendance')
            .select('status');

        const presentCount = attendanceStats?.filter(a => a.status === 'present').length || 0;
        const absentCount = attendanceStats?.filter(a => a.status === 'absent').length || 0;
        const lateCount = attendanceStats?.filter(a => a.status === 'late').length || 0;

        // Get recent activity
        const { data: recentAuditLogs } = await supabaseAdmin
            .from('audit_logs')
            .select(`
                *,
                user:users(id, name, email)
            `)
            .order('created_at', { ascending: false })
            .limit(10);

        // Get teacher performance
        const { data: teacherPerformance } = await supabaseAdmin
            .from('users')
            .select(`
                id,
                name,
                email,
                image,
                lessons:lessons(count),
                courses:courses(count)
            `)
            .eq('role', 'teacher')
            .limit(10);

        // Calculate growth (comparing with last month)
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

        const { count: lastMonthUsers } = await supabaseAdmin
            .from('users')
            .select('*', { count: 'exact', head: true })
            .lt('created_at', startOfMonth)
            .gte('created_at', lastMonthStart);

        const { count: thisMonthUsers } = await supabaseAdmin
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startOfMonth);

        const userGrowth = lastMonthUsers
            ? Math.round(((thisMonthUsers || 0) - lastMonthUsers) / lastMonthUsers * 100)
            : 0;

        return NextResponse.json({
            users: {
                total: (studentCount + teacherCount + adminCount),
                students: studentCount,
                teachers: teacherCount,
                admins: adminCount,
                growth: userGrowth,
            },
            courses: {
                total: totalCourses || 0,
                published: publishedCourses || 0,
            },
            lessons: {
                total: totalLessons || 0,
                upcoming: upcomingLessons || 0,
                completed: completedLessons || 0,
                today: todayLessons || [],
                thisWeek: thisWeekLessons || 0,
            },
            enrollments: {
                active: activeEnrollments || 0,
            },
            attendance: {
                total: (presentCount + absentCount + lateCount),
                present: presentCount,
                absent: absentCount,
                late: lateCount,
                rate: presentCount > 0
                    ? Math.round(presentCount / (presentCount + absentCount + lateCount) * 100)
                    : 0,
            },
            recentActivity: recentAuditLogs || [],
            teacherPerformance: teacherPerformance || [],
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'فشل جلب الإحصائيات' }, { status: 500 });
    }
}
