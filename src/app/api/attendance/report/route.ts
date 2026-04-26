import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const studentId = searchParams.get('studentId');

    if (!courseId || !studentId) {
        return NextResponse.json({ error: 'Missing courseId or studentId' }, { status: 400 });
    }

    // 1. Get all lessons for the course that have passed
    const { data: lessons } = await supabaseAdmin
        .from('lessons')
        .select('id')
        .eq('course_id', courseId)
        .lt('end_date_time', new Date().toISOString());

    if (!lessons) return NextResponse.json({ total: 0, present: 0, percentage: 0 });

    const lessonIds = lessons.map(l => l.id);

    // 2. Get attendance records for these lessons
    const { data: attendance } = await supabaseAdmin
        .from('attendance')
        .select('status')
        .eq('student_id', studentId)
        .in('lesson_id', lessonIds);

    const total = lessonIds.length;
    const present = attendance?.filter(a => ['present', 'late'].includes(a.status)).length || 0;
    const absent = attendance?.filter(a => a.status === 'absent').length || 0;
    const excused = attendance?.filter(a => a.status === 'excused').length || 0;

    return NextResponse.json({
        totalLessons: total,
        presentCount: present,
        absentCount: absent,
        excusedCount: excused,
        attendancePercentage: total > 0 ? Math.round((present / total) * 100) : 0
    });
}
