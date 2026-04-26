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

// GET /api/admin/categories — uses the `grades` table as course categories
export async function GET() {
    const access = await checkAdminAccess();
    if (access.error) return access.error;

    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
        .from('grades')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching categories (grades):', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }

    // Map grades fields to category-like response
    const categories = (data || []).map((g: any) => ({
        id: g.id,
        name: g.name,
        name_ar: g.name,
        name_en: g.name_en || g.name,
        description: g.description || '',
        color: g.color || '#0D6EFD',
        status: g.is_active !== false ? 'active' : 'inactive',
        created_at: g.created_at,
        updated_at: g.updated_at || g.created_at,
    }));

    return NextResponse.json(categories);
}

// POST /api/admin/categories
export async function POST(req: Request) {
    const access = await checkAdminAccess();
    if (access.error) return access.error;

    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { name, name_ar, name_en, description, status } = body;

    if (!name && !name_ar) {
        return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const gradeName = name_ar || name;
    const slug = gradeName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0600-\u06FF-]/g, '');

    const insertData: Record<string, any> = {
        name: gradeName,
        name_en: name_en || name || gradeName,
        slug: `${slug}-${Date.now()}`,
        is_active: status !== 'inactive',
    };
    if (description) insertData.description = description;

    const { data, error } = await supabaseAdmin
        .from('grades')
        .insert(insertData)
        .select()
        .single();

    if (error) {
        console.error('Error creating category (grade):', error);
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }

    return NextResponse.json({
        id: data.id,
        name: data.name,
        name_ar: data.name,
        name_en: data.name_en,
        description: data.description || '',
        color: data.color || '#0D6EFD',
        status: data.is_active ? 'active' : 'inactive',
        created_at: data.created_at,
    }, { status: 201 });
}

// PATCH /api/admin/categories
export async function PATCH(req: Request) {
    const access = await checkAdminAccess();
    if (access.error) return access.error;

    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { id, name, name_ar, name_en, status, ...rest } = body;

    if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (name || name_ar) updates.name = name_ar || name;
    if (name_en) updates.name_en = name_en;
    if (rest.description !== undefined) updates.description = rest.description;
    if (status !== undefined) updates.is_active = status !== 'inactive';

    const { data, error } = await supabaseAdmin
        .from('grades')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating category (grade):', error);
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }

    return NextResponse.json({
        id: data.id,
        name: data.name,
        name_ar: data.name,
        name_en: data.name_en,
        status: data.is_active ? 'active' : 'inactive',
        created_at: data.created_at,
    });
}

// DELETE /api/admin/categories
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

    // Check for dependent courses before deleting
    const { count: courseCount, error: courseCheckError } = await supabaseAdmin
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('grade_id', id);

    if (courseCheckError) {
        console.error('Error checking dependent courses:', courseCheckError);
        return NextResponse.json({ error: 'Failed to check dependent courses' }, { status: 500 });
    }

    if (courseCount && courseCount > 0) {
        return NextResponse.json({ error: 'Cannot delete: category has associated courses' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
        .from('grades')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting category (grade):', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
