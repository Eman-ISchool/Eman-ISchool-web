import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

// Test users with known credentials
const TEST_USERS = [
    {
        email: 'admin@eman-ischool.com',
        name: 'مدير النظام',
        role: 'admin' as const,
        password: 'Admin@123',
    },
    {
        email: 'teacher@eman-ischool.com',
        name: 'أ. محمد المنصور',
        role: 'teacher' as const,
        password: 'Teacher@123',
    },
    {
        email: 'student@eman-ischool.com',
        name: 'أحمد الخالدي',
        role: 'student' as const,
        password: 'Student@123',
    }
];

export async function GET() {
    if (!isSupabaseAdminConfigured || !supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const results: { email: string; status: string; error?: string }[] = [];

    // First, try to add password_hash column if it doesn't exist
    try {
        await supabaseAdmin.rpc('exec_sql', {
            sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;`
        });
    } catch (error) {
        console.log('password_hash column may already exist or RPC not available');
    }

    for (const user of TEST_USERS) {
        try {
            // Hash the password
            const passwordHash = await bcrypt.hash(user.password, 10);

            // Check if user exists
            const { data: existingUser } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('email', user.email)
                .single();

            if (existingUser) {
                // Update existing user with password hash
                const { error: updateError } = await supabaseAdmin
                    .from('users')
                    .update({
                        password_hash: passwordHash,
                        role: user.role,
                        name: user.name,
                        is_active: true
                    })
                    .eq('email', user.email);

                if (updateError) {
                    results.push({ email: user.email, status: 'error', error: updateError.message });
                } else {
                    results.push({ email: user.email, status: 'updated' });
                }
            } else {
                // Create new user
                const { error: insertError } = await supabaseAdmin
                    .from('users')
                    .insert({
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        password_hash: passwordHash,
                        is_active: true,
                        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
                    });

                if (insertError) {
                    results.push({ email: user.email, status: 'error', error: insertError.message });
                } else {
                    results.push({ email: user.email, status: 'created' });
                }
            }
        } catch (error: any) {
            results.push({ email: user.email, status: 'error', error: error.message });
        }
    }

    return NextResponse.json({
        success: true,
        message: 'Test users seeded',
        users: results,
        credentials: TEST_USERS.map(u => ({
            email: u.email,
            password: u.password,
            role: u.role
        }))
    });
}
