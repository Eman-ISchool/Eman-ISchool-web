#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envText = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const env = Object.fromEntries(
  envText.split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i+1).trim().replace(/^["']|["']$/g, '')]; })
);
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) { console.error('Missing Supabase env'); process.exit(1); }
const sb = createClient(URL_, KEY, { auth: { persistSession: false } });

console.log('SUPABASE:', URL_);
const { data: roleRows, error: roleErr } = await sb.from('users').select('role');
if (roleErr) { console.error('roles err', roleErr); process.exit(1); }
const roleCounts = {};
for (const r of roleRows) { const v = (r.role || '(null)').toLowerCase(); roleCounts[v] = (roleCounts[v] || 0) + 1; }
console.log('\nDISTINCT ROLES:');
for (const [r, c] of Object.entries(roleCounts).sort((a,b)=>b[1]-a[1])) console.log(`  ${r.padEnd(20)} ${c}`);
console.log(`  TOTAL users: ${roleRows.length}`);

const { data: testUsers } = await sb.from('users')
  .select('id,email,name,role,is_active,password_hash')
  .or('email.ilike.%emanschool.test,email.ilike.test.%,email.ilike.%@eman%')
  .order('role');
console.log('\nCANDIDATE TEST USERS:');
for (const u of testUsers || []) console.log(`  [${u.role}] ${u.email.padEnd(50)} active=${u.is_active} hasPw=${!!u.password_hash}`);

console.log('\n3 SAMPLES PER ROLE:');
for (const role of Object.keys(roleCounts).filter(r => r !== '(null)')) {
  const { data } = await sb.from('users').select('email,name,is_active,password_hash').eq('role', role).limit(3);
  console.log(`  ${role}:`);
  for (const u of data || []) console.log(`    ${u.email} | ${u.name || '(no name)'} | active=${u.is_active} hasPw=${!!u.password_hash}`);
}

const { data: first } = await sb.from('users').select('*').limit(1);
console.log('\nUSERS TABLE COLUMNS:');
if (first?.[0]) console.log('  ' + Object.keys(first[0]).join(', '));

console.log('\nDONE');
