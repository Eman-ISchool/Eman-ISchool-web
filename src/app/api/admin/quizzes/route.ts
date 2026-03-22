import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

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
        .from('quizzes')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (type) query = query.eq('type', type);

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching quizzes:', error);
        return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
    }

    return NextResponse.json({ data: data || [], count: count ?? 0 });
}

// POST /api/admin/quizzes
export async function POST(req: Request) {
    const access = await checkAdminAccess();
    if (access.error) return access.error;

    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { title, type, status, class_name, teacher_name, subject_name, total_marks, duration_minutes } = body;

    if (!title) {
        return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from('quizzes')
        .insert({
            title,
            type: type ?? 'quiz',
            status: status ?? 'draft',
            class_name,
            teacher_name,
            subject_name,
            total_marks: total_marks ?? 100,
            duration_minutes: duration_minutes ?? 60,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating quiz:', error);
        return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}

// PATCH /api/admin/quizzes
export async function PATCH(req: Request) {
    const access = await checkAdminAccess();
    if (access.error) return access.error;

    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from('quizzes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating quiz:', error);
        return NextResponse.json({ error: 'Failed to update quiz' }, { status: 500 });
    }

    return NextResponse.json(data);
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
        .from('quizzes')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting quiz:', error);
        return NextResponse.json({ error: 'Failed to delete quiz' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
