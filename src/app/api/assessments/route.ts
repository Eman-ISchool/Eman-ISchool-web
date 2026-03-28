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
        const teacherId = searchParams.get('teacherId');
        const courseId = searchParams.get('courseId');

        let query = supabaseAdmin
            .from('assessments')
            .select(`
                *,
                course:courses(title),
                subject:subjects(title),
                assessment_submissions(count)
            `)
            .order('created_at', { ascending: false })
            .limit(100);

        // Filter by course if specified
        if (courseId) {
            query = query.eq('course_id', courseId);
        }

        // Admins see all assessments; teachers see only their own
        if (currentUser.role === 'admin') {
            if (teacherId) {
                query = query.eq('teacher_id', teacherId);
            }
        } else {
            query = query.eq('teacher_id', teacherId || currentUser.id);
        }

        const { data: assessments, error } = await query;

        if (error) {
            console.error('Error fetching assessments:', error);
            return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
        }

        const response = NextResponse.json(assessments || []);
        response.headers.set('Cache-Control', 'private, s-maxage=30, stale-while-revalidate=120');
        return response;
    } catch (error) {
        console.error('Error fetching assessments:', error);
        return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
    }
}

/**
 * POST /api/assessments
 * Create a new assessment (exam group).
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentUser = await getCurrentUser(session);
        if (!currentUser || !isTeacherOrAdmin(currentUser.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { title, description, schedule, status: assessmentStatus } = body;

        if (!title?.trim()) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('assessments')
            .insert({
                title: title.trim(),
                short_description: description?.trim() || null,
                description: description?.trim() || null,
                teacher_id: currentUser.id,
                assessment_type: 'exam',
                is_published: assessmentStatus === 'active',
                attempt_limit: 1,
                late_submissions_allowed: false,
            } as any)
            .select()
            .single();

        if (error) {
            console.error('Error creating assessment:', error);
            return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error creating assessment:', error);
        return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 });
    }
}
