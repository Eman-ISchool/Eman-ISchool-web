import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/parents/[id]/children/summary
 * 
 * Returns a summary of all children linked to a parent, including:
 * - Upcoming lesson count
 * - Pending homework count
 * - Attendance rate (last 30 days)
 * - Last exam score
 * 
 * Access: Parent role only, can only access their own children
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user as any;

        // Authentication check
        if (!session || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Role check - only parents can access this endpoint
        if (user.role !== 'parent') {
            return NextResponse.json(
                { error: 'Forbidden', code: 'INSUFFICIENT_PERMISSIONS', detail: 'Only parents can access children summaries' },
                { status: 403 }
            );
        }

        // Parent can only access their own children
        const parentId = params.id;
        if (user.id !== parentId) {
            return NextResponse.json(
                { error: 'Forbidden', code: 'ACCESS_DENIED', detail: 'Parents can only view their own children' },
                { status: 403 }
            );
        }

        // Fetch linked children with their enrollments
        const { data: linkedStudents, error: studentsError } = await supabaseAdmin
            .from('parent_student')
            .select(`
                relationship,
                student:users!parent_student_student_id_fkey (
                    id,
                    name,
                    email,
                    image,
                    grade_id
                )
            `)
            .eq('parent_id', parentId);

        if (studentsError) {
            console.error('Error fetching linked students:', studentsError);
            return NextResponse.json(
                { error: 'Failed to fetch children' },
                { status: 500 }
            );
        }

        const children = linkedStudents?.map(record => ({
            ...record.student,
            relationship: record.relationship
        })) || [];

        if (children.length === 0) {
            return NextResponse.json({
                children: [],
                summary: {
                    totalChildren: 0,
                    totalUpcomingLessons: 0,
                    totalPendingHomework: 0,
                    averageAttendanceRate: 0
                }
            });
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Build summary for each child
        const childrenSummary = await Promise.all(
            children.map(async (child) => {
                // Fetch upcoming lessons count
                const { count: upcomingLessonsCount } = await supabaseAdmin
                    .from('lessons')
                    .select('*', { count: 'exact', head: true })
                    .in('course_id', supabaseAdmin
                        .from('enrollments')
                        .select('course_id')
                        .eq('student_id', child.id)
                        .eq('status', 'active')
                    )
                    .in('status', ['scheduled', 'live'])
                    .gt('start_date_time', new Date().toISOString());

                // Fetch pending homework count (used below via actualPendingHomeworkCount)
                await supabaseAdmin
                    .from('assignments')
                    .select('*', { count: 'exact', head: true })
                    .in('course_id', supabaseAdmin
                        .from('enrollments')
                        .select('course_id')
                        .eq('student_id', child.id)
                        .eq('status', 'active')
                    )
                    .eq('is_open', true)
                    .or(`deadline.is.null,deadline.gt.${new Date().toISOString()}`);

                // Check if student has submitted homework
                const { data: submissions } = await supabaseAdmin
                    .from('assignment_submissions')
                    .select('assignment_id')
                    .eq('student_id', child.id);

                const submittedAssignmentIds = submissions?.map(s => s.assignment_id) || [];

                // Fetch pending homework (not submitted)
                const { count: actualPendingHomeworkCount } = await supabaseAdmin
                    .from('assignments')
                    .select('*', { count: 'exact', head: true })
                    .in('course_id', supabaseAdmin
                        .from('enrollments')
                        .select('course_id')
                        .eq('student_id', child.id)
                        .eq('status', 'active')
                    )
                    .eq('is_open', true)
                    .not('id', 'in', `(${submittedAssignmentIds.join(',')})`)
                    .or(`deadline.is.null,deadline.gt.${new Date().toISOString()}`);

                // Calculate attendance rate (last 30 days)
                const { data: attendanceRecords } = await supabaseAdmin
                    .from('attendance')
                    .select('attendance_status')
                    .eq('student_id', child.id)
                    .gte('join_time', thirtyDaysAgo.toISOString());

                let attendanceRate = 0;
                if (attendanceRecords && attendanceRecords.length > 0) {
                    const presentCount = attendanceRecords.filter(
                        r => r.attendance_status === 'present' || r.attendance_status === 'late'
                    ).length;
                    attendanceRate = Math.round((presentCount / attendanceRecords.length) * 100);
                }

                // Fetch last exam score
                const { data: examSubmissions } = await supabaseAdmin
                    .from('assessment_submissions')
                    .select(`
                        total_score,
                        submitted_at,
                        assessment:assessments (
                            title,
                            assessment_type
                        )
                    `)
                    .eq('student_id', child.id)
                    .eq('status', 'submitted')
                    .in('assessment.assessment_type', ['exam'])
                    .order('submitted_at', { ascending: false })
                    .limit(1);

                const lastExamScore = examSubmissions && examSubmissions.length > 0
                    ? {
                        score: examSubmissions[0].total_score,
                        title: examSubmissions[0].assessment?.title,
                        submittedAt: examSubmissions[0].submitted_at
                    }
                    : null;

                return {
                    id: child.id,
                    name: child.name,
                    email: child.email,
                    image: child.image,
                    grade_id: child.grade_id,
                    relationship: child.relationship,
                    stats: {
                        upcomingLessons: upcomingLessonsCount || 0,
                        pendingHomework: actualPendingHomeworkCount || 0,
                        attendanceRate,
                        lastExamScore
                    }
                };
            })
        );

        // Calculate overall summary
        const totalUpcomingLessons = childrenSummary.reduce((sum, child) => sum + child.stats.upcomingLessons, 0);
        const totalPendingHomework = childrenSummary.reduce((sum, child) => sum + child.stats.pendingHomework, 0);
        const averageAttendanceRate = childrenSummary.length > 0
            ? Math.round(childrenSummary.reduce((sum, child) => sum + child.stats.attendanceRate, 0) / childrenSummary.length)
            : 0;

        return NextResponse.json({
            children: childrenSummary,
            summary: {
                totalChildren: childrenSummary.length,
                totalUpcomingLessons,
                totalPendingHomework,
                averageAttendanceRate
            }
        });
    } catch (error) {
        console.error('Error in children summary API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
