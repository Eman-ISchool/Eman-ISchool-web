import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Fetch users with filters
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);

    // Only admins and teachers can view user lists
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'teacher')) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        let query = supabaseAdmin
            .from('users')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (role) {
            query = query.eq('role', role);
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        // Teachers can only see students
        if (currentUser.role === 'teacher') {
            query = query.eq('role', 'student');
        }

        const { data: users, error, count } = await query;

        if (error) {
            console.error('Error fetching users:', error);
            return NextResponse.json({ error: 'فشل جلب المستخدمين' }, { status: 500 });
        }

        const response = NextResponse.json({ users, total: count });
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        return response;
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'فشل جلب المستخدمين' }, { status: 500 });
    }
}

// POST - Create a new user (Admin only)
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser || !isAdmin(currentUser.role)) {
        return NextResponse.json({ error: 'غير مصرح. يحتاج لصلاحيات مدير.' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { email, name, role, phone, bio } = body;

        if (!email || !name) {
            return NextResponse.json({ error: 'البريد الإلكتروني والاسم مطلوبان' }, { status: 400 });
        }

        // Check if user already exists
        const { data: existing } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existing) {
            return NextResponse.json({ error: 'المستخدم موجود بالفعل' }, { status: 400 });
        }

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .insert({
                email,
                name,
                role: role || 'student',
                phone,
                bio,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating user:', error);
            return NextResponse.json({ error: 'فشل إنشاء المستخدم' }, { status: 500 });
        }

        // Log the action
        await supabaseAdmin.from('audit_logs').insert({
            action: 'create',
            table_name: 'users',
            record_id: user.id,
            user_id: currentUser.id,
            new_data: user,
        });

        return NextResponse.json({ user, message: 'تم إنشاء المستخدم بنجاح' });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: 'فشل إنشاء المستخدم' }, { status: 500 });
    }
}

// PATCH - Update a user
export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });
        }

        // Users can only update their own profile unless they're admin
        if (id !== currentUser.id && !isAdmin(currentUser.role)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        // Only admins can change roles
        if (updates.role && !isAdmin(currentUser.role)) {
            delete updates.role;
        }

        // Get old data for audit log
        const { data: oldData } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating user:', error);
            return NextResponse.json({ error: 'فشل تحديث المستخدم' }, { status: 500 });
        }

        // Log the action
        await supabaseAdmin.from('audit_logs').insert({
            action: 'update',
            table_name: 'users',
            record_id: user.id,
            user_id: currentUser.id,
            old_data: oldData,
            new_data: user,
        });

        return NextResponse.json({ user, message: 'تم تحديث المستخدم بنجاح' });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'فشل تحديث المستخدم' }, { status: 500 });
    }
}

// DELETE - Delete a user (Admin only)
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser || !isAdmin(currentUser.role)) {
        return NextResponse.json({ error: 'غير مصرح. يحتاج لصلاحيات مدير.' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });
        }

        // Don't allow deleting yourself
        if (id === currentUser.id) {
            return NextResponse.json({ error: 'لا يمكن حذف نفسك' }, { status: 400 });
        }

        // Get old data for audit log
        const { data: oldData } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        const { error } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting user:', error);
            return NextResponse.json({ error: 'فشل حذف المستخدم' }, { status: 500 });
        }

        // Log the action
        await supabaseAdmin.from('audit_logs').insert({
            action: 'delete',
            table_name: 'users',
            record_id: id,
            user_id: currentUser.id,
            old_data: oldData,
        });

        return NextResponse.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'فشل حذف المستخدم' }, { status: 500 });
    }
}
