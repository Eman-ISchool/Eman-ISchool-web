import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { buildStoredPhone } from '@/lib/auth-credentials';
import bcrypt from 'bcryptjs';

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
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
        }

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
        const transformedUsers = users?.map((user: any) => ({
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
        const { id, role, isActive, name, phone, countryCode, bio } = body;

        if (!id) {
            return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
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
        if (phone !== undefined) updates.phone = buildStoredPhone(phone, countryCode);
        if (bio !== undefined) updates.bio = bio;
        // Extended profile fields
        if (body.base_salary !== undefined) updates.base_salary = body.base_salary || null;
        if (body.price_per_lesson !== undefined) updates.price_per_lesson = body.price_per_lesson || null;
        if (body.bank_name !== undefined) updates.bank_name = body.bank_name || null;
        if (body.bank_account !== undefined) updates.bank_account = body.bank_account || null;
        if (body.address !== undefined) updates.address = body.address || null;
        if (body.birth_date !== undefined) updates.birth_date = body.birth_date || null;
        if (body.image !== undefined) updates.image = body.image || null;
        if (body.previous_education !== undefined) updates.previous_education = body.previous_education || null;
        if (body.guardian_name !== undefined) updates.guardian_name = body.guardian_name || null;
        if (body.guardian_email !== undefined) updates.guardian_email = body.guardian_email || null;
        if (body.guardian_phone !== undefined) updates.guardian_phone = buildStoredPhone(body.guardian_phone, body.guardian_country_code) || body.guardian_phone || null;

        let { data: user, error } = await (supabaseAdmin as any)
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        // If update failed due to unknown column, retry with core fields only
        if (error && (error.message?.includes('column') || error.code === '42703' || error.code === 'PGRST204')) {
            console.warn('Extended columns missing in update, retrying with core fields only:', error.message);
            const coreUpdates: any = {};
            if (role) coreUpdates.role = role;
            if (isActive !== undefined) coreUpdates.is_active = isActive;
            if (name) coreUpdates.name = name;
            if (phone !== undefined) coreUpdates.phone = buildStoredPhone(phone, countryCode);
            if (bio !== undefined) coreUpdates.bio = bio;
            if (body.image !== undefined) coreUpdates.image = body.image || null;
            const retryResult = await (supabaseAdmin as any)
                .from('users')
                .update(coreUpdates)
                .eq('id', id)
                .select()
                .single();
            user = retryResult.data;
            error = retryResult.error;
        }

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
        } as any);

        return NextResponse.json({ user, message: 'تم تحديث المستخدم بنجاح' });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'فشل تحديث المستخدم' }, { status: 500 });
    }
}

// POST - Create user or bulk actions on users (Admin only)
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

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
        }

        // Create single user flow
        if (body.name && body.email && body.password) {
            const passwordHash = await bcrypt.hash(body.password, 10);

            // Core fields (always exist in the DB)
            // Normalize email to lowercase for consistent lookup
            const normalizedEmail = body.email.trim().toLowerCase();

            // Normalize phone using the same utility as login/registration
            // Use separate phone + countryCode for consistent format with register route
            const normalizedPhone = buildStoredPhone(body.phone, body.countryCode);

            const coreData: Record<string, unknown> = {
                name: body.name.trim(),
                email: normalizedEmail,
                password_hash: passwordHash,
                role: body.role || 'student',
                phone: normalizedPhone,
                is_active: true,
            };
            if (body.image) coreData.image = body.image;

            // Extended fields (may not exist yet — migration required)
            const extendedFields: Record<string, unknown> = {};
            if (body.base_salary) extendedFields.base_salary = body.base_salary;
            if (body.price_per_lesson) extendedFields.price_per_lesson = body.price_per_lesson;
            if (body.bank_name) extendedFields.bank_name = body.bank_name;
            if (body.bank_account) extendedFields.bank_account = body.bank_account;
            if (body.address) extendedFields.address = body.address;
            if (body.birth_date) extendedFields.birth_date = body.birth_date;
            if (body.salary_currency) extendedFields.salary_currency = body.salary_currency;
            if (body.previous_education) extendedFields.previous_education = body.previous_education;
            if (body.guardian_name) extendedFields.guardian_name = body.guardian_name;
            if (body.guardian_email) extendedFields.guardian_email = body.guardian_email;
            if (body.guardian_phone) extendedFields.guardian_phone = buildStoredPhone(body.guardian_phone, body.guardian_country_code) || body.guardian_phone;

            // Try full insert (core + extended), fallback to core-only if columns missing
            let insertData = { ...coreData, ...extendedFields };
            let { data: user, error } = await (supabaseAdmin as any)
                .from('users')
                .insert(insertData)
                .select()
                .single();

            // If insert failed due to unknown column, retry with core fields only
            if (error && (error.message?.includes('column') || error.code === '42703' || error.code === 'PGRST204')) {
                console.warn('Extended columns missing, retrying with core fields only:', error.message);
                const retryResult = await (supabaseAdmin as any)
                    .from('users')
                    .insert(coreData)
                    .select()
                    .single();
                user = retryResult.data;
                error = retryResult.error;
            }

            if (error) {
                console.error('Error creating user:', error);
                if (error.code === '23505') {
                    return NextResponse.json({ error: 'البريد الإلكتروني مسجل بالفعل' }, { status: 409 });
                }
                return NextResponse.json({ error: error.message || 'فشل إنشاء المستخدم' }, { status: 500 });
            }

            await supabaseAdmin.from('audit_logs').insert({
                action: 'create',
                table_name: 'users',
                record_id: user.id,
                user_id: currentUser.id,
                new_data: { ...user, password_hash: '[REDACTED]' },
            } as any);

            return NextResponse.json({ user, message: 'تم إنشاء المستخدم بنجاح' });
        }

        // Bulk actions flow
        const { action, userIds } = body;

        if (!action || !userIds || !Array.isArray(userIds)) {
            return NextResponse.json({ error: 'البيانات غير صالحة' }, { status: 400 });
        }

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

        const { error } = await (supabaseAdmin as any)
            .from('users')
            .update(updates)
            .in('id', safeUserIds);

        if (error) {
            console.error('Error bulk updating users:', error);
            return NextResponse.json({ error: 'فشل تحديث المستخدمين' }, { status: 500 });
        }

        await supabaseAdmin.from('audit_logs').insert({
            action: 'bulk_update',
            table_name: 'users',
            user_id: currentUser.id,
            new_data: { action, userIds: safeUserIds, updates },
        } as any);

        return NextResponse.json({
            success: true,
            message: `تم تحديث ${safeUserIds.length} مستخدم بنجاح`
        });
    } catch (error) {
        console.error('Error in users POST:', error);
        return NextResponse.json({ error: 'فشل تنفيذ العملية' }, { status: 500 });
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

        if (id === currentUser.id) {
            return NextResponse.json({ error: 'لا يمكنك حذف حسابك الخاص' }, { status: 400 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
        }

        const { data: oldData } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        const { error } = await (supabaseAdmin as any)
            .from('users')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting user:', error);
            return NextResponse.json({ error: 'فشل حذف المستخدم' }, { status: 500 });
        }

        await supabaseAdmin.from('audit_logs').insert({
            action: 'delete',
            table_name: 'users',
            record_id: id,
            user_id: currentUser.id,
            old_data: oldData ? { ...oldData, password_hash: '[REDACTED]' } : null,
        } as any);

        return NextResponse.json({ message: 'تم حذف المستخدم بنجاح' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'فشل حذف المستخدم' }, { status: 500 });
    }
}
