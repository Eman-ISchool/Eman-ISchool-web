import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  const results: string[] = [];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  try {
    const sqlPath = join(process.cwd(), 'supabase/migrations/20260327_enrollment_system.sql');
    const migrationSql = readFileSync(sqlPath, 'utf8');
    const parentRoleSql = "DO $$ BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'parent'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;\n";
    const fullSql = parentRoleSql + migrationSql;

    // Try every possible Supabase SQL execution endpoint
    const endpoints = [
      { url: `${supabaseUrl}/pg-meta/default/query`, method: 'POST', body: JSON.stringify({ query: fullSql }) },
      { url: `${supabaseUrl}/pg/query`, method: 'POST', body: JSON.stringify({ query: fullSql }) },
      { url: `${supabaseUrl}/rest/v1/rpc/exec_sql`, method: 'POST', body: JSON.stringify({ query: fullSql }) },
      { url: `${supabaseUrl}/rest/v1/rpc/execute_sql`, method: 'POST', body: JSON.stringify({ sql: fullSql }) },
      { url: `${supabaseUrl}/sql`, method: 'POST', body: fullSql },
    ];

    let migrated = false;
    for (const ep of endpoints) {
      if (migrated) break;
      try {
        const resp = await fetch(ep.url, {
          method: ep.method,
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': ep.url.endsWith('/sql') ? 'text/plain' : 'application/json',
            'X-Connection-Encrypted': '1',
          },
          body: ep.body,
        });
        const text = await resp.text();
        const ok = resp.ok;
        results.push(`${ep.url.replace(supabaseUrl, '')}: ${resp.status} ${ok ? 'OK' : text.substring(0, 150)}`);
        if (ok) migrated = true;
      } catch (e: any) {
        results.push(`${ep.url.replace(supabaseUrl, '')}: ERR ${e.message.substring(0, 80)}`);
      }
    }

    // Verify tables
    results.push('--- VERIFY ---');
    const tables = ['enrollment_applications_v2', 'enrollment_student_details', 'enrollment_academic_details', 'enrollment_documents'];
    for (const t of tables) {
      const { count, error } = await supabaseAdmin.from(t).select('*', { count: 'exact', head: true });
      results.push(`${t}: ${error ? 'MISSING' : 'EXISTS (' + count + ')'}`);
    }

    return NextResponse.json({ migrated, results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, results }, { status: 500 });
  }
}
