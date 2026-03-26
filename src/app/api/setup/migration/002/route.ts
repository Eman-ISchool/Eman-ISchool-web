import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    if (!supabaseAdmin) return NextResponse.json({ error: 'No admin client' });

    const sql = `
    CREATE TABLE IF NOT EXISTS password_resets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
    CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
    `;

    await supabaseAdmin.rpc('exec_sql', { sql_query: sql });

    // If RPC exec_sql doesn't exist (it usually doesn't by default), we might be stuck.
    // However, we can try to use raw query if the library supports it, but supabase-js usually doesn't expose raw query easily without RPC.
    // ALTERNATIVE: Use the `pg` library if installed? No.
    // ALTERNATIVE: Fallback to existing tables?
    // Wait, in Phase 1 I created tables. How? 
    // Ah, I likely assumed they existed or the user ran something.
    // Re-reading Phase 1: "Create migration SQL... Create EXECUTE_MIGRATION.md".
    // I should probably just instruct the user or assume I can't run it.
    // BUT, I can try to use standard Supabase table creation methods if I had a schema builder, but I don't.

    // Let's blindly try to use the table in the API. If it fails, I'll ask the user to run the SQL.
    // Actually, I'll just write the SQL file and ask the user to run it if I get errors.

    return NextResponse.json({ message: "Please run the SQL in src/lib/migrations/002_password_resets.sql in your Supabase SQL Editor." });
}
