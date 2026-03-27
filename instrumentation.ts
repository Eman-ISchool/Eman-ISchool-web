export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Run enrollment migration
    const { readFileSync, writeFileSync, existsSync, mkdirSync } = await import('fs');
    const { join } = await import('path');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) return;

    const results: string[] = [];
    const outDir = join(process.cwd(), 'e2e-proof');
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    try {
      // Read migration SQL
      const sqlPath = join(process.cwd(), 'supabase/migrations/20260327_enrollment_system.sql');
      if (!existsSync(sqlPath)) {
        results.push('Migration file not found');
        writeFileSync(join(outDir, 'migration-results.json'), JSON.stringify({ results }));
        return;
      }
      const fullSql = readFileSync(sqlPath, 'utf8');
      const parentRoleSql = "DO $$ BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'parent'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;";
      const combinedSql = parentRoleSql + '\n' + fullSql;

      // Execute via Supabase SQL endpoint
      const resp = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: combinedSql }),
      });
      results.push(`exec_sql: ${resp.status} - ${(await resp.text()).substring(0, 200)}`);

      // Verify tables
      const { createClient } = await import('@supabase/supabase-js');
      const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

      for (const t of ['enrollment_applications_v2', 'enrollment_student_details', 'enrollment_documents']) {
        const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true });
        results.push(`${t}: ${error ? 'MISSING - ' + error.message : 'EXISTS (' + count + ' rows)'}`);
      }
    } catch (e: any) {
      results.push('Error: ' + e.message);
    }

    writeFileSync(join(outDir, 'migration-results.json'), JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2));
    console.log('[MIGRATION]', results.join(' | '));
  }
}
