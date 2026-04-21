const r = await fetch('http://localhost:3000/api/debug-login');
const j = await r.json();
console.log('status:', r.status);
console.log('totalUsers:', j.totalUsers);
console.log('roles:', [...new Set((j.allUsers || []).map(u => u.role))].sort());
console.log('\n--- ALL USERS (first 30, newest first):');
for (const u of j.allUsers || []) {
  console.log(`[${(u.role||'?').padEnd(10)}] ${(u.email||'').padEnd(45)} name=${(u.name||'').padEnd(25)} active=${u.is_active} hasPw=${u.hasPasswordHash}`);
}
