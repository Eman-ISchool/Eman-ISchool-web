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
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
        }

        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const startOfDayISO = startOfDay.toISOString();
        const startOfWeekISO = startOfWeek.toISOString();
        const startOfMonthISO = startOfMonth.toISOString();
        const lastMonthStartISO = lastMonthStart.toISOString();

        // 1. Fetch counts in chunks to avoid overwhelming the connection pool
        const queries = [
            supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
            supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
            supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
            supabaseAdmin.from('courses').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true),

            supabaseAdmin.from('lessons').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('lessons').select('*', { count: 'exact', head: true }).eq('status', 'scheduled').gte('start_date_time', new Date().toISOString()),
            supabaseAdmin.from('lessons').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
            supabaseAdmin.from('lessons').select(`*, teacher:users!lessons_teacher_id_fkey(id, name, image), course:courses(id, title)`).gte('start_date_time', startOfDayISO).order('start_date_time', { ascending: true }).limit(10),
            supabaseAdmin.from('lessons').select('*', { count: 'exact', head: true }).gte('start_date_time', startOfWeekISO),

            supabaseAdmin.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            supabaseAdmin.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
            supabaseAdmin.from('attendance').select('*', { count: 'exact', head: true }).eq('status', 'present'),
            supabaseAdmin.from('attendance').select('*', { count: 'exact', head: true }).eq('status', 'absent'),
            supabaseAdmin.from('attendance').select('*', { count: 'exact', head: true }).eq('status', 'late'),

            // audit_logs table may not exist yet — wrap in a safe query that won't crash
            supabaseAdmin.from('users').select('id, name, email, role, created_at').order('created_at', { ascending: false }).limit(10),
            supabaseAdmin.from('users').select(`id, name, email, image, lessons:lessons(count), courses:courses(count)`).eq('role', 'teacher').limit(10),
            supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).lt('created_at', startOfMonthISO).gte('created_at', lastMonthStartISO),
            supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonthISO),
            // Additional queries for parity
            supabaseAdmin.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
            supabaseAdmin.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
            supabaseAdmin.from('courses').select('id, title, is_published, enrollments:enrollments(count)').order('created_at', { ascending: false }).limit(20),
        ];

        const results = [];
        for (let i = 0; i < queries.length; i += 5) {
            const chunk = await Promise.all(queries.slice(i, i + 5));
            results.push(...chunk);
        }

        const [
            { count: studentCount },
            { count: teacherCount },
            { count: adminCount },
            { count: totalCourses },
            { count: publishedCourses },
            { count: totalLessons },
            { count: upcomingLessons },
            { count: completedLessons },
            { data: todayLessons },
            { count: thisWeekLessons },
            { count: activeEnrollments },
            { count: pendingEnrollments },
            { count: presentCount },
            { count: absentCount },
            { count: lateCount },
            { data: recentAuditLogs },
            { data: teacherPerformance },
            { count: lastMonthUsers },
            { count: thisMonthUsers },
            { count: approvedEnrollments },
            { count: rejectedEnrollments },
            { data: coursesWithEnrollments },
        ] = results as any;

        const _presentCount = presentCount || 0;
        const _absentCount = absentCount || 0;
        const _lateCount = lateCount || 0;

        const userGrowth = lastMonthUsers
            ? Math.round(((thisMonthUsers || 0) - lastMonthUsers) / lastMonthUsers * 100)
            : 0;

        const response = NextResponse.json({
            users: {
                total: ((studentCount || 0) + (teacherCount || 0) + (adminCount || 0)),
                students: studentCount || 0,
                teachers: teacherCount || 0,
                admins: adminCount || 0,
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
                pending: pendingEnrollments || 0,
                approved: approvedEnrollments || 0,
                rejected: rejectedEnrollments || 0,
                total: (activeEnrollments || 0) + (pendingEnrollments || 0) + (approvedEnrollments || 0) + (rejectedEnrollments || 0),
            },
            coursesWithEnrollments: coursesWithEnrollments || [],
            attendance: {
                total: (_presentCount + _absentCount + _lateCount),
                present: _presentCount,
                absent: _absentCount,
                late: _lateCount,
                rate: _presentCount > 0
                    ? Math.round(_presentCount / (_presentCount + _absentCount + _lateCount) * 100)
                    : 0,
            },
            recentActivity: recentAuditLogs || [],
            teacherPerformance: teacherPerformance || [],
        });
        response.headers.set('Cache-Control', 'private, s-maxage=30, stale-while-revalidate=120');
        return response;
    } catch (error: any) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json(
            { error: error?.message || 'فشل جلب الإحصائيات' },
            { status: 500 }
        );
    }
}
