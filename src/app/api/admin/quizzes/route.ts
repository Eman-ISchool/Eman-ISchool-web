import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
async function checkAdminAccess() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return { error: NextResponse.json({ error: 'غير مصرح' }, { status: 401 }) };
    }
    const currentUser = await getCurrentUser(session);
    if (!currentUser || !isAdmin(currentUser.role)) {
        return { error: NextResponse.json({ error: 'غير مصرح. يحتاج لصلاحيات مدير.' }, { status: 403 }) };
    }
    return { currentUser };
}

/**
 * Map an assessments row to the shape the quizzes frontend expects.
 */
function mapAssessmentToQuiz(row: any) {
    return {
        id: row.id,
        title: row.title || '-',
        type: row.assessment_type || 'quiz',
        status: row.is_published ? 'active' : 'draft',
        subject_name: row.subject?.title || null,
        class_name: row.course?.title || null,
        teacher_name: null,
        total_marks: row.attempt_limit ?? 0,
        duration_minutes: row.duration_minutes ?? null,
        questions_count: 0,
        max_attempts: row.attempt_limit ?? 3,
        passing_rate: null,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}

// GET /api/admin/quizzes
export async function GET(req: Request) {
    const access = await checkAdminAccess();
    if (access.error) return access.error;

    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    let query = supabaseAdmin
        .from('assessments')
        .select(`
            *,
            course:courses(title),
            subject:subjects(title)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

    if (status === 'active') {
        query = query.eq('is_published', true);
    } else if (status === 'draft') {
        query = query.eq('is_published', false);
    }
    if (type) query = query.eq('assessment_type', type);

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching quizzes (assessments):', error);
        return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
    }

    const mapped = (data || []).map(mapAssessmentToQuiz);
    return NextResponse.json({ data: mapped, count: count ?? 0 });
}

// POST /api/admin/quizzes
export async function POST(req: Request) {
    const access = await checkAdminAccess();
    if (access.error) return access.error;

    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { title, type, status, duration_minutes } = body;

    if (!title) {
        return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from('assessments')
        .insert({
            title,
            assessment_type: type ?? 'quiz',
            is_published: status === 'active',
            duration_minutes: duration_minutes ?? 60,
            teacher_id: access.currentUser!.id,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating quiz (assessment):', error);
        return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 });
    }

    return NextResponse.json(mapAssessmentToQuiz(data), { status: 201 });
}

// PATCH /api/admin/quizzes
export async function PATCH(req: Request) {
    const access = await checkAdminAccess();
    if (access.error) return access.error;

    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { id, title, type, status, duration_minutes, ...rest } = body;

    if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Build update payload mapping frontend fields to assessments columns
    const updates: Record<string, any> = {};
    if (title !== undefined) updates.title = title;
    if (type !== undefined) updates.assessment_type = type;
    if (status !== undefined) updates.is_published = status === 'active';
    if (duration_minutes !== undefined) updates.duration_minutes = duration_minutes;

    const { data, error } = await supabaseAdmin
        .from('assessments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating quiz (assessment):', error);
        return NextResponse.json({ error: 'Failed to update quiz' }, { status: 500 });
    }

    return NextResponse.json(mapAssessmentToQuiz(data));
}

// DELETE /api/admin/quizzes
export async function DELETE(req: Request) {
    const access = await checkAdminAccess();
    if (access.error) return access.error;

    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
        .from('assessments')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting quiz (assessment):', error);
        return NextResponse.json({ error: 'Failed to delete quiz' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
