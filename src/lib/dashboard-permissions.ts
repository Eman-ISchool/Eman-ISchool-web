export type DashboardRole = 'admin' | 'teacher' | 'student' | 'parent' | 'supervisor';

const KNOWN_ROLES: DashboardRole[] = ['admin', 'teacher', 'student', 'parent', 'supervisor'];

// Unlisted routes default to admin-only (safe default).
export const ROUTE_ACCESS: Record<string, DashboardRole[]> = {
  '/dashboard':                  ['admin', 'teacher', 'student', 'parent', 'supervisor'],
  '/dashboard/profile':          ['admin', 'teacher', 'student', 'parent', 'supervisor'],
  '/dashboard/messages':         ['admin', 'teacher', 'student', 'parent', 'supervisor'],
  '/dashboard/announcements':    ['admin', 'teacher', 'student', 'parent', 'supervisor'],
  '/dashboard/calendar':         ['admin', 'teacher', 'student', 'parent', 'supervisor'],
  '/dashboard/courses':          ['admin', 'teacher', 'student', 'supervisor'],
  '/dashboard/lessons':          ['admin', 'teacher', 'student', 'supervisor'],
  '/dashboard/classroom':        ['admin', 'teacher', 'student', 'supervisor'],
  '/dashboard/exams':            ['admin', 'teacher', 'student', 'supervisor'],
  '/dashboard/quizzes':          ['admin', 'teacher', 'student', 'supervisor'],
  '/dashboard/live':             ['admin', 'teacher', 'student', 'supervisor'],
  '/dashboard/bundles':          ['admin', 'teacher', 'supervisor'],
  '/dashboard/students':         ['admin', 'teacher', 'parent', 'supervisor'],
  '/dashboard/teachers':         ['admin', 'supervisor'],
  '/dashboard/users':            ['admin'],
  '/dashboard/role-management':  ['admin'],
  '/dashboard/system-settings':  ['admin'],
  '/dashboard/reports':          ['admin', 'teacher', 'supervisor'],
  '/dashboard/admin/reports':    ['admin'],
  '/dashboard/applications':     ['admin', 'supervisor', 'parent'],
  '/dashboard/payments':         ['admin', 'parent'],
  '/dashboard/fees':             ['admin', 'parent'],
  '/dashboard/salaries':         ['admin', 'teacher'],
  '/dashboard/payslips':         ['admin', 'teacher'],
  '/dashboard/expenses':         ['admin'],
  '/dashboard/coupons':          ['admin'],
  '/dashboard/currencies':       ['admin'],
  '/dashboard/banks':            ['admin'],
  '/dashboard/categories':       ['admin', 'supervisor'],
  '/dashboard/cms':              ['admin'],
  '/dashboard/blogs':            ['admin'],
  '/dashboard/translations':     ['admin'],
  '/dashboard/lookups':          ['admin'],
  '/dashboard/backup':           ['admin'],
  '/dashboard/settings':         ['admin', 'teacher', 'student', 'parent', 'supervisor'],
};

function normalizeRole(role: string | undefined): DashboardRole | null {
  if (!role) return null;
  const lower = role.toLowerCase();
  return (KNOWN_ROLES as string[]).includes(lower) ? (lower as DashboardRole) : null;
}

function stripLocale(path: string): string {
  const m = path.match(/^\/(ar|en)(\/.*)?$/);
  return m ? m[2] || '/' : path;
}

function longestPrefixMatch(path: string): string | null {
  // Exact match always wins.
  if (path in ROUTE_ACCESS) return path;
  // Prefix match: only keys longer than '/dashboard' (the root) propagate to
  // sub-paths, so that unlisted routes under '/dashboard' default to admin-only.
  const keys = Object.keys(ROUTE_ACCESS)
    .filter((k) => k !== '/dashboard' && k !== '/')
    .sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (path.startsWith(k + '/')) return k;
  }
  return null;
}

export function hasAccess(role: string | undefined, path: string): boolean {
  const normalized = normalizeRole(role);
  if (!normalized) return false;
  const matched = longestPrefixMatch(stripLocale(path));
  const allowed = matched ? ROUTE_ACCESS[matched] : (['admin'] as DashboardRole[]);
  return allowed.includes(normalized);
}

const LEGACY_MAP: Array<{ from: RegExp; to: string }> = [
  { from: /^\/student\/home$/,               to: '/dashboard' },
  { from: /^\/teacher\/home$/,               to: '/dashboard' },
  { from: /^\/temp-teacher\/home$/,          to: '/dashboard' },
  { from: /^\/admin\/home$/,                 to: '/dashboard' },
  { from: /^\/parent\/home$/,                to: '/dashboard' },
  { from: /^\/parent\/invoices(\/.*)?$/,     to: '/dashboard/payments$1' },
  { from: /^\/parent\/payments(\/.*)?$/,     to: '/dashboard/payments$1' },
  { from: /^\/parent\/courses(\/.*)?$/,      to: '/dashboard/courses$1' },
  { from: /^\/parent\/applications(\/.*)?$/, to: '/dashboard/applications$1' },
  { from: /^\/student(\/.*)?$/,              to: '/dashboard$1' },
  { from: /^\/teacher(\/.*)?$/,              to: '/dashboard$1' },
  { from: /^\/temp-teacher(\/.*)?$/,         to: '/dashboard$1' },
  { from: /^\/admin(\/.*)?$/,                to: '/dashboard$1' },
  { from: /^\/parent(\/.*)?$/,               to: '/dashboard$1' },
];

export function legacyRedirectFor(fullPath: string): string | null {
  const m = fullPath.match(/^\/(ar|en)(\/.*)?$/);
  if (!m) return null;
  const locale = m[1];
  const rest = m[2] || '/';
  for (const rule of LEGACY_MAP) {
    const match = rest.match(rule.from);
    if (match) {
      const dest = rule.to.replace(/\$(\d+)/g, (_, idx) => match[Number(idx)] ?? '');
      return `/${locale}${dest}`;
    }
  }
  return null;
}
