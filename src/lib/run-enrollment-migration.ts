// Run enrollment migration from within the server process
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.log('[MIGRATION] Missing env vars, skipping');
    return;
  }

  const results: string[] = [];

  // Read the migration SQL
  const sqlPath = join(process.cwd(), 'supabase/migrations/20260327_enrollment_system.sql');
  let fullSql: string;
  try {
    fullSql = readFileSync(sqlPath, 'utf8');
  } catch {
    console.log('[MIGRATION] Migration file not found, skipping');
    return;
  }

  // Also add parent role to user_role enum
  const parentRoleSql = "DO $$ BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'parent'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;";
  const combinedSql = parentRoleSql + '\n' + fullSql;

  // Try Supabase SQL execution endpoints
  const endpoints = [
    { url: `${supabaseUrl}/rest/v1/rpc/exec_sql`, body: { query: combinedSql } },
  ];

  for (const ep of endpoints) {
    try {
      const resp = await fetch(ep.url, {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ep.body),
      });
      results.push(`${ep.url}: ${resp.status}`);
    } catch (e: any) {
      results.push(`${ep.url}: ${e.message}`);
    }
  }

  // Verify tables via Supabase REST
  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const tables = [
    'enrollment_applications_v2',
    'enrollment_student_details',
    'enrollment_academic_details',
    'enrollment_documents',
  ];

  for (const t of tables) {
    const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true });
    results.push(`${t}: ${error ? 'MISSING' : 'EXISTS (' + count + ' rows)'}`);
  }

  // Write results
  const outPath = join(process.cwd(), 'e2e-proof/migration-results.json');
  writeFileSync(outPath, JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2));
  console.log('[MIGRATION] Results:', results.join('\n'));
}

runMigration().catch(e => console.error('[MIGRATION] Error:', e.message));

export {};
