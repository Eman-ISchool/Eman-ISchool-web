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

// GET /api/admin/bundles
// "Bundles" are backed by the `grades` table in Supabase.
export async function GET(req: Request) {
    const access = await checkAdminAccess();
    if (access.error) return access.error;

    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 100);
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
        .from('grades')
        .select('*, courses:courses(count)', { count: 'exact' })
        .order('sort_order', { ascending: true })
        .range(offset, offset + limit - 1);

    if (status === 'active') {
        query = query.eq('is_active', true);
    } else if (status === 'inactive') {
        query = query.eq('is_active', false);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching bundles (grades):', error);
        return NextResponse.json({ error: 'Failed to fetch bundles' }, { status: 500 });
    }

    // Map grades rows so the frontend receives a consistent shape
    const bundles = (data || []).map((g: any) => ({
        ...g,
        status: g.is_active ? 'active' : 'inactive',
        courses_count: g.courses?.[0]?.count ?? 0,
    }));

    return NextResponse.json({ data: bundles, count: count ?? 0 });
}

// POST /api/admin/bundles
export async function POST(req: Request) {
    const access = await checkAdminAccess();
    if (access.error) return access.error;

    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { name, description, is_active, supervisor_id, image_url } = body;

    if (!name) {
        return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    // Auto-generate slug from name
    const slug = name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u0600-\u06FF-]/g, '')
        .slice(0, 100) + '-' + Date.now();

    const { data, error } = await supabaseAdmin
        .from('grades')
        .insert({
            name,
            description: description || null,
            slug,
            is_active: is_active !== undefined ? is_active : true,
            supervisor_id: supervisor_id || null,
            image_url: image_url || null,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating bundle (grade):', error);
        return NextResponse.json({ error: 'Failed to create bundle' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}

// PATCH /api/admin/bundles
export async function PATCH(req: Request) {
    const access = await checkAdminAccess();
    if (access.error) return access.error;

    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { id, ...rawUpdates } = body;

    if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Allowlist — only columns that exist on the `grades` table
    const ALLOWED_FIELDS = [
        'name', 'name_en', 'slug', 'sort_order', 'is_active',
        'supervisor_id', 'description', 'image_url',
    ];

    const updates: Record<string, any> = {};
    for (const key of ALLOWED_FIELDS) {
        if (rawUpdates[key] !== undefined) {
            updates[key] = rawUpdates[key];
        }
    }

    const { data, error } = await supabaseAdmin
        .from('grades')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating bundle (grade):', error);
        return NextResponse.json({ error: 'Failed to update bundle' }, { status: 500 });
    }

    return NextResponse.json(data);
}

// DELETE /api/admin/bundles
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
        .from('grades')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting bundle (grade):', error);
        return NextResponse.json({ error: 'Failed to delete bundle' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
