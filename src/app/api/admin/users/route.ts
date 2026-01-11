import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Fetch users for admin management
export async function GET(req: Request) {
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
        const role = searchParams.get('role');
        const search = searchParams.get('search');
        const isActive = searchParams.get('isActive');
        const sortBy = searchParams.get('sortBy') || 'created_at';
        const sortOrder = searchParams.get('sortOrder') === 'asc';
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        let query = supabaseAdmin
            .from('users')
            .select(`
                *,
                enrollments:enrollments(count),
                lessons_taught:lessons(count)
            `, { count: 'exact' })
            .order(sortBy, { ascending: sortOrder })
            .range(offset, offset + limit - 1);

        if (role) {
            query = query.eq('role', role);
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        if (isActive !== null && isActive !== undefined) {
            query = query.eq('is_active', isActive === 'true');
        }

        const { data: users, error, count } = await query;

        if (error) {
            console.error('Error fetching users:', error);
            return NextResponse.json({ error: 'فشل جلب المستخدمين' }, { status: 500 });
        }

        // Transform data for frontend
        const transformedUsers = users?.map(user => ({
            ...user,
            enrollmentsCount: user.enrollments?.[0]?.count || 0,
            lessonsTaughtCount: user.lessons_taught?.[0]?.count || 0,
        }));

        return NextResponse.json({ users: transformedUsers, total: count });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'فشل جلب المستخدمين' }, { status: 500 });
    }
}

// PATCH - Update user role or status (Admin only)
export async function PATCH(req: Request) {
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
        const { id, role, isActive, name, phone, bio } = body;

        if (!id) {
            return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });
        }

        // Cannot modify your own admin status
        if (id === currentUser.id && role && role !== 'admin') {
            return NextResponse.json({ error: 'لا يمكن تغيير صلاحياتك الخاصة' }, { status: 400 });
        }

        // Get old data for audit log
        const { data: oldData } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        const updates: any = {};
        if (role) updates.role = role;
        if (isActive !== undefined) updates.is_active = isActive;
        if (name) updates.name = name;
        if (phone !== undefined) updates.phone = phone;
        if (bio !== undefined) updates.bio = bio;

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
            record_id: id,
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

// POST - Bulk actions on users (Admin only)
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
        const { action, userIds } = body;

        if (!action || !userIds || !Array.isArray(userIds)) {
            return NextResponse.json({ error: 'البيانات غير صالحة' }, { status: 400 });
        }

        // Remove current user from the list to prevent self-modification
        const safeUserIds = userIds.filter((id: string) => id !== currentUser.id);

        if (safeUserIds.length === 0) {
            return NextResponse.json({ error: 'لا يوجد مستخدمين لتحديثهم' }, { status: 400 });
        }

        let updates: any = {};

        switch (action) {
            case 'activate':
                updates.is_active = true;
                break;
            case 'deactivate':
                updates.is_active = false;
                break;
            case 'make_teacher':
                updates.role = 'teacher';
                break;
            case 'make_student':
                updates.role = 'student';
                break;
            default:
                return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('users')
            .update(updates)
            .in('id', safeUserIds);

        if (error) {
            console.error('Error bulk updating users:', error);
            return NextResponse.json({ error: 'فشل تحديث المستخدمين' }, { status: 500 });
        }

        // Log the bulk action
        await supabaseAdmin.from('audit_logs').insert({
            action: 'bulk_update',
            table_name: 'users',
            user_id: currentUser.id,
            new_data: { action, userIds: safeUserIds, updates },
        });

        return NextResponse.json({
            success: true,
            message: `تم تحديث ${safeUserIds.length} مستخدم بنجاح`
        });
    } catch (error) {
        console.error('Error bulk updating users:', error);
        return NextResponse.json({ error: 'فشل تحديث المستخدمين' }, { status: 500 });
    }
}
