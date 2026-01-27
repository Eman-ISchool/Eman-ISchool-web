import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * API endpoint to run the Google token columns migration
 * This adds the necessary columns to store Google OAuth tokens
 */
export async function GET() {
    // Security: Verify user is authenticated and is an admin
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const currentUser = await getCurrentUser(session);

    if (!currentUser || !isAdmin(currentUser.role)) {
        return NextResponse.json({ error: 'غير مصرح. يحتاج لصلاحيات مدير.' }, { status: 403 });
    }

    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const results: { step: string; success: boolean; error?: string }[] = [];

    // Run each migration step separately
    const migrations = [
        {
            name: 'Add google_access_token column',
            sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS google_access_token TEXT`,
        },
        {
            name: 'Add google_refresh_token column',
            sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS google_refresh_token TEXT`,
        },
        {
            name: 'Add google_token_expires_at column',
            sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS google_token_expires_at TIMESTAMPTZ`,
        },
    ];

    for (const migration of migrations) {
        try {
            // Use raw SQL via RPC or direct query
            const { error } = await supabaseAdmin.rpc('exec_sql' as any, { sql: migration.sql } as any);

            if (error) {
                // If RPC doesn't exist, try a workaround
                console.log(`RPC failed for ${migration.name}:`, error.message);
                results.push({ step: migration.name, success: false, error: error.message });
            } else {
                results.push({ step: migration.name, success: true });
            }
        } catch (error: any) {
            results.push({ step: migration.name, success: false, error: error.message });
        }
    }

    // Test if columns exist by trying to select them
    try {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('google_access_token, google_refresh_token, google_token_expires_at')
            .limit(1);

        if (!error) {
            results.push({ step: 'Verify columns exist', success: true });
        } else {
            results.push({ step: 'Verify columns exist', success: false, error: error.message });
        }
    } catch (error: any) {
        results.push({ step: 'Verify columns exist', success: false, error: error.message });
    }

    const allSuccess = results.every(r => r.success);

    return NextResponse.json({
        success: allSuccess,
        message: allSuccess
            ? 'Migration completed successfully'
            : 'Some migration steps failed - columns may need to be added manually via Supabase dashboard',
        results,
        manualSQL: `
-- Run this in Supabase SQL Editor if automatic migration failed:
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_access_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_token_expires_at TIMESTAMPTZ;
        `.trim(),
    });
}
