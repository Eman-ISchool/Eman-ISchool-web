import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/assessments
 * List assessments for the current teacher/admin.
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentUser = await getCurrentUser(session);
        if (!currentUser || !isTeacherOrAdmin(currentUser.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get('teacherId') || currentUser.id;

        const { data: assessments, error } = await supabaseAdmin
            .from('assessments')
            .select(`
                *,
                course:courses(title),
                subject:subjects(title),
                assessment_submissions(count)
            `)
            .eq('teacher_id', teacherId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching assessments:', error);
            return NextResponse.json([]);
        }

        return NextResponse.json(assessments || []);
    } catch (error) {
        console.error('Error fetching assessments:', error);
        return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
    }
}
