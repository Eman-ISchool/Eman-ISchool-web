import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { canManageLesson } from '@/lib/permissions';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user as any;

        if (!session || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const lessonId = params.id;

        // Fetch lesson details
        const { data: lesson, error: lessonError } = await supabaseAdmin
            .from('lessons')
            .select('id, course_id, teacher_id')
            .eq('id', lessonId)
            .single();

        if (lessonError || !lesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        // Check permissions
        const canView = await canManageLesson(user.id, user.role, lessonId);
        if (!canView && user.role !== 'student') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // If student, only show their own attendance
        let query = supabaseAdmin
            .from('attendance')
            .select(`
                *,
                student:users(id, name, email, image)
            `)
            .eq('lesson_id', lessonId)
            .order('join_time', { ascending: true });

        if (user.role === 'student') {
            query = query.eq('student_id', user.id);
        }

        const { data: attendance, error: attendanceError } = await query;

        if (attendanceError) {
            console.error('Error fetching attendance:', attendanceError);
            return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
        }

        return NextResponse.json({ attendance });

    } catch (error) {
        console.error('Error in GET /api/lessons/[id]/attendance:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
