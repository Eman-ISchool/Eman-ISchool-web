import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Fetch audit logs (Admin only)
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
        const action = searchParams.get('action');
        const tableName = searchParams.get('tableName');
        const userId = searchParams.get('userId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const limit = parseInt(searchParams.get('limit') || '100');
        const offset = parseInt(searchParams.get('offset') || '0');

        let query = supabaseAdmin
            .from('audit_logs')
            .select(`
                *,
                user:users(id, name, email, image)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (action) {
            query = query.eq('action', action);
        }

        if (tableName) {
            query = query.eq('table_name', tableName);
        }

        if (userId) {
            query = query.eq('user_id', userId);
        }

        if (startDate) {
            query = query.gte('created_at', startDate);
        }

        if (endDate) {
            query = query.lte('created_at', endDate);
        }

        const { data: logs, error, count } = await query;

        if (error) {
            console.error('Error fetching audit logs:', error);
            return NextResponse.json({ error: 'فشل جلب سجلات التدقيق' }, { status: 500 });
        }

        return NextResponse.json({ logs, total: count });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return NextResponse.json({ error: 'فشل جلب سجلات التدقيق' }, { status: 500 });
    }
}

// POST - Create manual audit log entry (Admin only)
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
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
        }

        const body = await req.json();
        const { action, tableName, recordId, notes } = body;

        if (!action || !tableName) {
            return NextResponse.json({ error: 'الإجراء واسم الجدول مطلوبان' }, { status: 400 });
        }

        const { data: log, error } = await supabaseAdmin
            .from('audit_logs')
            .insert({
                action,
                table_name: tableName,
                record_id: recordId,
                user_id: currentUser.id,
                new_data: { notes, manual_entry: true },
            } as any)
            .select()
            .single();

        if (error) {
            console.error('Error creating audit log:', error);
            return NextResponse.json({ error: 'فشل إنشاء سجل التدقيق' }, { status: 500 });
        }

        return NextResponse.json({ log, message: 'تم إنشاء سجل التدقيق' });
    } catch (error) {
        console.error('Error creating audit log:', error);
        return NextResponse.json({ error: 'فشل إنشاء سجل التدقيق' }, { status: 500 });
    }
}

// DELETE - Clear old audit logs (Admin only)
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
        const beforeDate = searchParams.get('beforeDate');

        if (!beforeDate) {
            return NextResponse.json({ error: 'تاريخ القطع مطلوب' }, { status: 400 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
        }

        // Safety check: don't delete logs less than 30 days old
        const cutoffDate = new Date(beforeDate);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (cutoffDate > thirtyDaysAgo) {
            return NextResponse.json({
                error: 'لا يمكن حذف سجلات أقل من 30 يوماً'
            }, { status: 400 });
        }

        const { error, count } = await supabaseAdmin
            .from('audit_logs')
            .delete()
            .lt('created_at', beforeDate);

        if (error) {
            console.error('Error deleting audit logs:', error);
            return NextResponse.json({ error: 'فشل حذف السجلات' }, { status: 500 });
        }

        // Log this action
        await supabaseAdmin.from('audit_logs').insert({
            action: 'bulk_delete',
            table_name: 'audit_logs',
            user_id: currentUser.id,
            new_data: {
                deleted_before: beforeDate,
                deleted_count: count,
            },
        } as any);

        return NextResponse.json({
            success: true,
            message: `تم حذف ${count} سجل`
        });
    } catch (error) {
        console.error('Error deleting audit logs:', error);
        return NextResponse.json({ error: 'فشل حذف السجلات' }, { status: 500 });
    }
}
