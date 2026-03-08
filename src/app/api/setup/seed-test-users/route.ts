import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

const TEST_USERS = [
    { email: 'admin@test.com', password: 'TestAdmin123!', name: 'Test Admin', role: 'admin' },
    { email: 'teacher@test.com', password: 'TestTeacher123!', name: 'Test Teacher', role: 'teacher' },
    { email: 'student@test.com', password: 'TestStudent123!', name: 'Test Student', role: 'student' },
    { email: 'parent@test.com', password: 'TestParent123!', name: 'Test Parent', role: 'parent' },
];

export async function GET() {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase admin client not configured' }, { status: 500 });
    }

    const results: Array<{ email: string; status: string; role: string }> = [];

    for (const user of TEST_USERS) {
        // Check if user already exists
        const { data: existing } = await supabaseAdmin
            .from('users')
            .select('id, email, role')
            .eq('email', user.email)
            .single();

        if (existing) {
            results.push({ email: user.email, status: 'already_exists', role: existing.role });
            continue;
        }

        // Hash password
        const password_hash = await bcrypt.hash(user.password, 10);

        // Insert user
        const { error } = await supabaseAdmin
            .from('users')
            .insert({
                email: user.email,
                name: user.name,
                password_hash,
                role: user.role,
                is_active: true,
                email_verified: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

        if (error) {
            results.push({ email: user.email, status: `error: ${error.message}`, role: user.role });
        } else {
            results.push({ email: user.email, status: 'created', role: user.role });
        }
    }

    return NextResponse.json({ message: 'Test user seed complete', results });
}
