import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
// PATCH - Admin change user password
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);
    if (!currentUser || !isAdmin(currentUser.role)) {
        return NextResponse.json({ error: 'غير مصرح. يحتاج لصلاحيات مدير.' }, { status: 403 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const { password } = body;

        if (!password || password.length < 6) {
            return NextResponse.json(
                { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
                { status: 400 },
            );
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const { error } = await (supabaseAdmin as any)
            .from('users')
            .update({ password_hash: passwordHash })
            .eq('id', id);

        if (error) {
            console.error('Error changing password:', error);
            return NextResponse.json({ error: 'فشل تغيير كلمة المرور' }, { status: 500 });
        }

        await supabaseAdmin.from('audit_logs').insert({
            action: 'change_password',
            table_name: 'users',
            record_id: id,
            user_id: currentUser.id,
            new_data: { password_hash: '[REDACTED]' },
        } as any);

        return NextResponse.json({ message: 'تم تغيير كلمة المرور بنجاح' });
    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json({ error: 'فشل تغيير كلمة المرور' }, { status: 500 });
    }
}
