import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// Valid attendance status values
const VALID_ATTENDANCE_STATUSES = ['present', 'absent', 'late', 'excused'];

// Helper to validate UUID format
function isValidUUID(str: string | null): boolean {
    if (!str) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

// Helper to validate ISO date string
function isValidISODate(str: string | null): boolean {
    if (!str) return false;
    const date = new Date(str);
    return !isNaN(date.getTime()) && date.toISOString() === str;
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const currentUser = await getCurrentUser(session);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get('lessonId');
    const studentId = searchParams.get('studentId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0')); // Min 0
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Input validation
    if (lessonId && !isValidUUID(lessonId)) {
        return NextResponse.json({ error: 'Invalid lesson ID format' }, { status: 400 });
    }
    if (studentId && !isValidUUID(studentId)) {
        return NextResponse.json({ error: 'Invalid student ID format' }, { status: 400 });
    }
    if (status && !VALID_ATTENDANCE_STATUSES.includes(status)) {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }
    if (startDate && !isValidISODate(startDate)) {
        return NextResponse.json({ error: 'Invalid startDate format' }, { status: 400 });
    }
    if (endDate && !isValidISODate(endDate)) {
        return NextResponse.json({ error: 'Invalid endDate format' }, { status: 400 });
    }

    // Students can only view their own attendance
    if (currentUser.role === 'student') {
        if (studentId && studentId !== currentUser.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { data, error } = await supabaseAdmin
            .from('attendance')
            .select(`
                *,
                lesson:lessons(
                    id,
                    title,
                    start_date_time,
                    end_date_time,
                    status,
                    meet_link,
                    meeting_title,
                    meeting_provider,
                    meeting_duration_min
                ),
                user:users(id, name, email, image, role)
            `)
            .eq('student_id', currentUser.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        const response = NextResponse.json({ attendance: data || [] });
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        return response;
    }

    // Teachers can only view attendance for their lessons
    if (currentUser.role === 'teacher') {
        if (lessonId) {
            // Verify teacher owns the lesson
            const { data: lesson } = await supabaseAdmin
                .from('lessons')
                .select('teacher_id')
                .eq('id', lessonId)
                .single();

            if (!lesson || lesson.teacher_id !== currentUser.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }
        let query = supabaseAdmin
            .from('attendance')
            .select(`
                *,
                lesson:lessons(
                    id,
                    title,
                    start_date_time,
                    end_date_time,
                    status,
                    meet_link,
                    meeting_title,
                    meeting_provider,
                    meeting_duration_min
                ),
                user:users(id, name, email, image, role)
            `);
        if (lessonId) query = query.eq('lesson_id', lessonId);
        if (studentId) query = query.eq('student_id', studentId);
        if (status) query = query.eq('status', status);
        if (startDate) query = query.gte('joined_at', startDate);
        if (endDate) query = query.lte('joined_at', endDate);
        const { data, error } = await query.range(offset, offset + limit - 1);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        const response = NextResponse.json({ attendance: data || [], total: data?.length || 0 });
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        return response;
    }

    // Admins can view all attendance
    if (currentUser.role === 'admin') {
        let query = supabaseAdmin
            .from('attendance')
            .select(`
                *,
                lesson:lessons(
                    id,
                    title,
                    start_date_time,
                    end_date_time,
                    status,
                    meet_link,
                    meeting_title,
                    meeting_provider,
                    meeting_duration_min
                ),
                user:users(id, name, email, image, role)
            `);
        if (lessonId) query = query.eq('lesson_id', lessonId);
        if (studentId) query = query.eq('student_id', studentId);
        if (status) query = query.eq('status', status);
        if (startDate) query = query.gte('joined_at', startDate);
        if (endDate) query = query.lte('joined_at', endDate);

        // Get total count
        const { count: totalCount } = await supabaseAdmin
            .from('attendance')
            .select('*', { count: 'exact', head: true });

        const { data, error } = await query.range(offset, offset + limit - 1);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        const response = NextResponse.json({ attendance: data || [], total: totalCount || 0 });
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        return response;
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = session.user as any;

    if (user.role !== 'teacher' && user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { lessonId, records } = body; // records: [{ studentId, status, notes }]

        // Input validation
        if (!lessonId || !isValidUUID(lessonId)) {
            return NextResponse.json({ error: 'Invalid or missing lesson ID' }, { status: 400 });
        }

        if (!records || !Array.isArray(records)) {
            return NextResponse.json({ error: 'Invalid records data' }, { status: 400 });
        }

        if (records.length === 0) {
            return NextResponse.json({ error: 'At least one attendance record required' }, { status: 400 });
        }

        if (records.length > 100) {
            return NextResponse.json({ error: 'Cannot process more than 100 records at once' }, { status: 400 });
        }

        // Verify lesson exists and get course_id for enrollment check
        const { data: lesson } = await supabaseAdmin
            .from('lessons')
            .select('id, course_id')
            .eq('id', lessonId)
            .single();

        if (!lesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        // Validate each record and verify enrollment
        for (const record of records) {
            if (!record.studentId || !isValidUUID(record.studentId)) {
                return NextResponse.json({ error: 'Invalid student ID in records' }, { status: 400 });
            }

            if (!record.status || !VALID_ATTENDANCE_STATUSES.includes(record.status)) {
                return NextResponse.json({ error: `Invalid status: ${record.status}` }, { status: 400 });
            }

            if (record.notes && typeof record.notes !== 'string') {
                return NextResponse.json({ error: 'Notes must be a string' }, { status: 400 });
            }

            // Verify student is enrolled in the course
            if (lesson.course_id) {
                const { data: enrollment } = await supabaseAdmin
                    .from('enrollments')
                    .select('id')
                    .eq('student_id', record.studentId)
                    .eq('course_id', lesson.course_id)
                    .eq('status', 'active')
                    .single();

                if (!enrollment) {
                    return NextResponse.json(
                        { error: `Student ${record.studentId} is not enrolled in this course` },
                        { status: 403 }
                    );
                }
            }
        }

        const upsertData = records.map((record: any) => ({
            lesson_id: lessonId,
            student_id: record.studentId,
            status: record.status, // present, absent, late, excused
            notes: record.notes,
            recorded_by: user.id,
            recorded_at: new Date().toISOString()
        }));

        const { data, error } = await supabaseAdmin
            .from('attendance')
            .upsert(upsertData, { onConflict: 'lesson_id, student_id' })
            .select();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
