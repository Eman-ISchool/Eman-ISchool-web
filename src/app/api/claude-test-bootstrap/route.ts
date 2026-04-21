import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

const BOOTSTRAP_TOKEN = process.env.CLAUDE_BOOTSTRAP_TOKEN || 'claude-eman-bootstrap-2026';

type TestUser = {
  role: 'admin' | 'teacher' | 'student' | 'parent' | 'supervisor';
  email: string;
  name: string;
  phone: string;
  password: string;
};

const TEST_USERS: TestUser[] = [
  { role: 'admin',      email: 'test.admin@emanschool.test',      name: 'Test Admin',      phone: '+971500000001', password: 'EmanAdmin!QA#2026$K9' },
  { role: 'teacher',    email: 'test.teacher@emanschool.test',    name: 'Test Teacher',    phone: '+971500000002', password: 'EmanTeach!QA#2026$L3' },
  { role: 'student',    email: 'test.student@emanschool.test',    name: 'Test Student',    phone: '+971500000003', password: 'EmanStud!QA#2026$M7' },
  { role: 'parent',     email: 'test.parent@emanschool.test',     name: 'Test Parent',     phone: '+971500000004', password: 'EmanPar!QA#2026$N1' },
  { role: 'supervisor', email: 'test.supervisor@emanschool.test', name: 'Test Supervisor', phone: '+971500000005', password: 'EmanSup!QA#2026$P5' },
];

function checkToken(req: Request): boolean {
  const auth = req.headers.get('authorization') || '';
  const provided = auth.replace(/^Bearer\s+/i, '').trim();
  const url = new URL(req.url);
  const queryToken = url.searchParams.get('token') || '';
  return provided === BOOTSTRAP_TOKEN || queryToken === BOOTSTRAP_TOKEN;
}

export async function GET(req: Request) {
  if (!checkToken(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json({
    info: 'POST to this endpoint with the same token to upsert the test users.',
    roles: TEST_USERS.map((u) => ({ role: u.role, email: u.email, name: u.name })),
  });
}

export async function POST(req: Request) {
  if (!checkToken(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!isSupabaseAdminConfigured || !supabaseAdmin)
    return NextResponse.json({ error: 'supabase admin not configured' }, { status: 500 });

  const results: Array<{ role: string; email: string; action: 'created' | 'updated' | 'error'; detail?: string }> = [];

  for (const u of TEST_USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const email = u.email.toLowerCase();
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id,email,role')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      const { error } = await (supabaseAdmin as any)
        .from('users')
        .update({
          name: u.name,
          role: u.role,
          phone: u.phone,
          password_hash: passwordHash,
          is_active: true,
        })
        .eq('id', (existing as any).id);
      results.push({
        role: u.role,
        email: u.email,
        action: error ? 'error' : 'updated',
        detail: error?.message,
      });
    } else {
      const { error } = await (supabaseAdmin as any)
        .from('users')
        .insert({
          email,
          name: u.name,
          role: u.role,
          phone: u.phone,
          password_hash: passwordHash,
          is_active: true,
        });
      results.push({
        role: u.role,
        email: u.email,
        action: error ? 'error' : 'created',
        detail: error?.message,
      });
    }
  }

  return NextResponse.json({
    bootstrapped: results,
    credentials: TEST_USERS.map((u) => ({
      role: u.role,
      email: u.email,
      password: u.password,
      name: u.name,
      phone: u.phone,
    })),
  });
}
