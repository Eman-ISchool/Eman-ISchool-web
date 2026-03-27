import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Run enrollment migration via Supabase SQL API
export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'DB not configured' }, { status: 500 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const results: string[] = [];

  try {
    // Read the migration SQL file
    const sqlPath = join(process.cwd(), 'supabase/migrations/20260327_enrollment_system.sql');
    const fullSql = readFileSync(sqlPath, 'utf8');

    // First, try adding parent role to user_role enum
    try {
      const parentRoleResp = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      results.push('RPC endpoint check: ' + parentRoleResp.status);
    } catch (e: any) {
      results.push('RPC check failed: ' + e.message);
    }

    // Execute SQL via Supabase's pg-meta API (available on Supabase instances)
    // The endpoint is: POST /pg/query with SQL in body
    const sqlEndpoint = `${supabaseUrl}/rest/v1/`;

    // Since we can't run DDL via PostgREST, let's try the SQL endpoint
    // Supabase exposes raw SQL via their internal pg-meta service
    // Alternative: use the `/sql` endpoint on newer Supabase versions
    const pgMetaUrl = supabaseUrl.replace('.supabase.co', '.supabase.co');

    // Try executing via Supabase's built-in SQL function if available
    // Some Supabase instances have a `query` function
    const tryEndpoints = [
      `${supabaseUrl}/rest/v1/rpc/exec_sql`,
      `${supabaseUrl}/pg/query`,
    ];

    let migrationSuccess = false;

    // Approach: Split migration into individual DDL statements and execute them
    // via the pg-meta API
    for (const endpoint of tryEndpoints) {
      if (migrationSuccess) break;
      try {
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ query: fullSql }),
        });
        const text = await resp.text();
        results.push(`${endpoint}: ${resp.status} - ${text.substring(0, 200)}`);
        if (resp.ok) migrationSuccess = true;
      } catch (e: any) {
        results.push(`${endpoint}: FAILED - ${e.message}`);
      }
    }

    // Verify which tables exist now
    const tables = [
      'enrollment_applications_v2',
      'enrollment_student_details',
      'enrollment_academic_details',
      'enrollment_guardian_details',
      'enrollment_documents',
      'enrollment_status_history',
      'student_onboarding_tasks',
    ];

    results.push('\n--- TABLE VERIFICATION ---');
    for (const table of tables) {
      const { count, error: tErr } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact', head: true });
      results.push(`${table}: ${tErr ? 'MISSING - ' + tErr.message : 'EXISTS (' + count + ' rows)'}`);
    }

    return NextResponse.json({ migrationSuccess, results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, results }, { status: 500 });
  }
}
