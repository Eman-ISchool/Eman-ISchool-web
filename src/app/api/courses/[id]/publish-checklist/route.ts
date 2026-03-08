import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generateRequestId } from '@/lib/request-id';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const requestId = generateRequestId();

    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized', code: 'UNAUTHORIZED', requestId },
                { status: 401 }
            );
        }

        const currentUser = await getCurrentUser(session);

        if (!currentUser || !isTeacherOrAdmin(currentUser.role)) {
            return NextResponse.json(
                { error: 'Forbidden', code: 'FORBIDDEN', requestId },
                { status: 403 }
            );
        }

        const courseId = params.id;

        // Verify ownership or admin
        const { data: existingCourse, error: fetchError } = await supabaseAdmin
            .from('courses')
            .select('id, teacher_id, title, grade_id')
            .eq('id', courseId)
            .single();

        if (fetchError || !existingCourse) {
            return NextResponse.json(
                { error: 'Course not found', code: 'NOT_FOUND', requestId },
                { status: 404 }
            );
        }

        if (existingCourse.teacher_id !== currentUser.id && !isTeacherOrAdmin(currentUser.role)) {
            return NextResponse.json(
                { error: 'Forbidden', code: 'FORBIDDEN', requestId },
                { status: 403 }
            );
        }

        // Run publish checklist validation
        const checklist = [
            {
                item: 'Course has a title',
                pass: !!existingCourse.title && existingCourse.title.trim().length > 0,
            },
            {
                item: 'Grade level selected',
                pass: !!existingCourse.grade_id,
            },
        ];

        // Check if course has at least one lesson
        const { count: lessonCount } = await supabaseAdmin
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', courseId);

        checklist.push({
            item: 'At least one lesson exists',
            pass: lessonCount !== null && lessonCount > 0,
        });

        const canPublish = checklist.every((item) => item.pass);

        return NextResponse.json({ canPublish, checklist, requestId });
    } catch (error) {
        console.error('Error fetching publish checklist:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred', code: 'INTERNAL_SERVER_ERROR', requestId },
            { status: 500 }
        );
    }
}
