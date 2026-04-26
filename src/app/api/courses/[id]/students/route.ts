import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isTeacherOrAdmin, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generateRequestId } from '@/lib/request-id';

export const dynamic = 'force-dynamic';
export async function GET(req: Request, { params }: { params: { id: string } }) {
    const requestId = generateRequestId();

    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json(
            { error: 'Unauthorized', code: 'UNAUTHORIZED', requestId },
            { status: 401 }
        );
    }
    const user = await getCurrentUser(session);

    // Verify teacher/admin
    if (!isTeacherOrAdmin(user.role)) {
        return NextResponse.json(
            { error: 'Forbidden', code: 'FORBIDDEN', requestId },
            { status: 403 }
        );
    }

    try {
        const courseId = params.id;

        // Verify course ownership if teacher
        const { data: course } = await supabaseAdmin
            .from('courses')
            .select('teacher_id')
            .eq('id', courseId)
            .single();

        if (!course) {
            return NextResponse.json(
                { error: 'Course not found', code: 'NOT_FOUND', requestId },
                { status: 404 }
            );
        }

        if (user.role !== 'admin' && course.teacher_id !== user.id) {
            return NextResponse.json(
                { error: 'Forbidden', code: 'FORBIDDEN', requestId },
                { status: 403 }
            );
        }

        const { data: enrollments, error } = await supabaseAdmin
            .from('enrollments')
            .select(`
                student_id,
                student:users!enrollments_student_id_fkey(id, name, email, image),
                enrolled_at,
                status
            `)
            .eq('course_id', courseId)
            .in('status', ['active', 'payment_completed', 'completed']);

        if (error) throw error;

        // Flatten structure
        const students = enrollments.map(e => e.student);

        return NextResponse.json({ students, requestId });
    } catch (error: any) {
        console.error('Error fetching students:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
            { status: 500 }
        );
    }
}
