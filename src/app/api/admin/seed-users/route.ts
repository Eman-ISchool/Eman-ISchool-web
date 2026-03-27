import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { UserRole } from '@/types/database';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

const TEST_USERS = [
    { email: 'admin@test.com', password: 'TestAdmin123!', name: 'Admin User', role: 'admin' as UserRole },
    { email: 'teacher@test.com', password: 'TestTeacher123!', name: 'Test Teacher', role: 'teacher' as UserRole },
    { email: 'student@test.com', password: 'TestStudent123!', name: 'Test Student', role: 'student' as UserRole },
    { email: 'parent@test.com', password: 'TestParent123!', name: 'Test Parent', role: 'parent' as UserRole },
];

export async function GET() {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const results: string[] = [];

    for (const u of TEST_USERS) {
        const { data: existing } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', u.email)
            .single();

        if (existing) {
            const ph = await bcrypt.hash(u.password, 10);
            await supabaseAdmin
                .from('users')
                .update({ password_hash: ph, is_active: true, name: u.name } as any)
                .eq('email', u.email);
            results.push(`updated ${u.email} (${u.role})`);
        } else {
            const ph = await bcrypt.hash(u.password, 10);
            const { error } = await supabaseAdmin.from('users').insert({
                email: u.email,
                name: u.name,
                role: u.role,
                password_hash: ph,
                is_active: true,
                image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.role}`,
            } as any);
            results.push(error ? `FAILED ${u.email}: ${error.message}` : `created ${u.email} (${u.role})`);
        }
    }

    return NextResponse.json({ success: true, results });
}
