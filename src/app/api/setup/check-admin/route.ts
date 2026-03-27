import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    if (!supabaseAdmin) return NextResponse.json({ error: 'No admin client' }, { status: 500 });

    // Find all admin users
    const { data: admins } = await supabaseAdmin.from('users').select('id,email,name,role,is_active').eq('role', 'admin').limit(20);

    // Find users named Fadi
    const { data: fadis } = await supabaseAdmin.from('users').select('id,email,name,role,is_active').ilike('name', '%fadi%').limit(10);

    // Manual role count
    const roles: Record<string, number> = {};
    for (const r of ['admin', 'teacher', 'student', 'parent', 'supervisor']) {
        const { count } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', r);
        roles[r] = count ?? 0;
    }

    return NextResponse.json({ admins, fadis, roleCounts: roles });
}
