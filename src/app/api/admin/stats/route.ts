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
        const startOfWeek = new Date(now);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const startOfDayISO = startOfDay.toISOString();
        const startOfWeekISO = startOfWeek.toISOString();
        const startOfMonthISO = startOfMonth.toISOString();
        const lastMonthStartISO = lastMonthStart.toISOString();

        // Consolidated queries — reduced from 22 to 8 round-trips
        const [
            userRoles,
            allEnrollments,
            allAttendance,
            todayLessonsResult,
            lessonCounts,
            recentUsersResult,
            teacherPerfResult,
            coursesResult,
        ] = await Promise.all([
            // 1. Single query: user role counts + growth (replaces 5 queries)
            supabaseAdmin.from('users').select('role, created_at'),
            // 2. Single query: all enrollment statuses (replaces 4 queries)
            supabaseAdmin.from('enrollments').select('status'),
            // 3. Single query: all attendance statuses (replaces 3 queries)
            supabaseAdmin.from('attendance').select('status'),
            // 4. Today's lessons with details
            supabaseAdmin.from('lessons').select('id, start_date_time, title, status, teacher:users!lessons_teacher_id_fkey(id, name, image), course:courses(id, title)').gte('start_date_time', startOfDayISO).order('start_date_time', { ascending: true }).limit(10),
            // 5. Lesson counts by status + date ranges (replaces 5 queries)
            supabaseAdmin.from('lessons').select('status, start_date_time, end_date_time'),
            // 6. Recent users
            supabaseAdmin.from('users').select('id, name, email, role, created_at').order('created_at', { ascending: false }).limit(10),
            // 7. Teacher performance
            supabaseAdmin.from('users').select('id, name, email, image, lessons:lessons(count), courses:courses(count)').eq('role', 'teacher').limit(10),
            // 8. Courses with enrollments (replaces 2 queries)
            supabaseAdmin.from('courses').select('id, title, is_published, enrollments:enrollments(count)').order('created_at', { ascending: false }).limit(20),
        ]);

        // Process user data client-side (fast — small dataset)
        const users = userRoles.data || [];
        const studentCount = users.filter(u => u.role === 'student').length;
        const teacherCount = users.filter(u => u.role === 'teacher').length;
        const adminCount = users.filter(u => u.role === 'admin').length;
        const lastMonthUsers = users.filter(u => u.created_at >= lastMonthStartISO && u.created_at < startOfMonthISO).length;
        const thisMonthUsers = users.filter(u => u.created_at >= startOfMonthISO).length;

        // Process enrollment counts
        const enrollments = allEnrollments.data || [];
        const activeEnrollments = enrollments.filter(e => e.status === 'active').length;
        const pendingEnrollments = enrollments.filter(e => e.status === 'pending').length;
        const approvedEnrollments = enrollments.filter(e => e.status === 'approved').length;
        const rejectedEnrollments = enrollments.filter(e => e.status === 'rejected').length;

        // Process attendance counts
        const attendance = allAttendance.data || [];
        const _presentCount = attendance.filter(a => a.status === 'present').length;
        const _absentCount = attendance.filter(a => a.status === 'absent').length;
        const _lateCount = attendance.filter(a => a.status === 'late').length;

        // Process lesson counts
        const lessons = lessonCounts.data || [];
        const nowISO = new Date().toISOString();
        const totalLessons = lessons.length;
        const upcomingLessons = lessons.filter(l => l.status === 'scheduled' && l.start_date_time >= nowISO).length;
        const completedLessons = lessons.filter(l => l.status === 'completed').length;
        const thisWeekLessons = lessons.filter(l => l.start_date_time >= startOfWeekISO).length;

        // Process courses
        const coursesData = coursesResult.data || [];
        const totalCourses = coursesData.length;
        const publishedCourses = coursesData.filter(c => c.is_published).length;

        const todayLessons = todayLessonsResult.data;
        const recentAuditLogs = recentUsersResult.data;
        const teacherPerformance = teacherPerfResult.data;
        const coursesWithEnrollments = coursesData;

        const userGrowth = lastMonthUsers
            ? Math.round((thisMonthUsers - lastMonthUsers) / lastMonthUsers * 100)
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
