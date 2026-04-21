import { test, expect, Page, APIRequestContext } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const BOOTSTRAP_TOKEN = process.env.CLAUDE_BOOTSTRAP_TOKEN || 'claude-eman-bootstrap-2026';
const LOCALE = process.env.TEST_LOCALE || 'en';
const SCREENSHOT_DIR = join(process.cwd(), 'test-results', 'dashboards');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

type RoleSpec = {
  role: 'admin' | 'teacher' | 'student' | 'parent' | 'supervisor';
  email: string;
  password: string;
  name: string;
  expectedNavLabels: string[];
  forbiddenNavLabels: string[];
};

const ROLES: RoleSpec[] = [
  {
    role: 'admin',
    email: 'test.admin@emanschool.test',
    password: 'EmanAdmin!QA#2026$K9',
    name: 'Test Admin',
    expectedNavLabels: ['Overview', 'Academic', 'Management', 'Finance', 'Communication', 'Content', 'Analytics'],
    forbiddenNavLabels: [],
  },
  {
    role: 'teacher',
    email: 'test.teacher@emanschool.test',
    password: 'EmanTeach!QA#2026$L3',
    name: 'Test Teacher',
    expectedNavLabels: ['Overview', 'Academic', 'Finance', 'Communication', 'Analytics'],
    forbiddenNavLabels: ['Content', 'Data management', 'Management'],
  },
  {
    role: 'student',
    email: 'test.student@emanschool.test',
    password: 'EmanStud!QA#2026$M7',
    name: 'Test Student',
    expectedNavLabels: ['Overview', 'Academic', 'Communication'],
    forbiddenNavLabels: ['Management', 'Finance', 'Content', 'Data management'],
  },
  {
    role: 'parent',
    email: 'test.parent@emanschool.test',
    password: 'EmanPar!QA#2026$N1',
    name: 'Test Parent',
    expectedNavLabels: ['Overview', 'Management', 'Finance', 'Communication'],
    forbiddenNavLabels: ['Academic', 'Content', 'Data management'],
  },
  {
    role: 'supervisor',
    email: 'test.supervisor@emanschool.test',
    password: 'EmanSup!QA#2026$P5',
    name: 'Test Supervisor',
    expectedNavLabels: ['Overview', 'Academic', 'Management', 'Communication', 'Analytics'],
    forbiddenNavLabels: ['Finance', 'Content', 'Data management'],
  },
];

async function bootstrapTestUsers(api: APIRequestContext) {
  const res = await api.post(`${BASE}/api/claude-test-bootstrap`, {
    headers: { Authorization: `Bearer ${BOOTSTRAP_TOKEN}` },
  });
  if (!res.ok()) throw new Error(`bootstrap failed ${res.status()}: ${await res.text()}`);
  const body = await res.json();
  const errors = (body.bootstrapped || []).filter((r: any) => r.action === 'error');
  if (errors.length > 0) throw new Error(`bootstrap errors: ${JSON.stringify(errors, null, 2)}`);
  return body;
}

async function loginViaEmail(page: Page, email: string, password: string) {
  await page.goto(`${BASE}/${LOCALE}/login`, { waitUntil: 'networkidle' });
  await page
    .getByRole('button', { name: /sign in with email|تسجيل الدخول بالبريد/i })
    .click();
  await page.getByRole('textbox', { name: /enter your email|بريدك/i }).fill(email);
  const pw = page.getByRole('textbox', { name: /enter your password|كلمة المرور/i });
  await pw.fill(password);
  await pw.press('Enter');
  await page.waitForURL(new RegExp(`/${LOCALE}/dashboard`), { timeout: 20_000 });
}

test.describe('Unified dashboard — role-based login and nav filtering', () => {
  test.beforeAll(async ({ playwright }) => {
    const api = await playwright.request.newContext();
    await bootstrapTestUsers(api);
    await api.dispose();
  });

  for (const spec of ROLES) {
    test(`${spec.role}: login → /dashboard → nav filtered → refresh → logout`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await context.newPage();

      await test.step('login lands on shared /dashboard', async () => {
        await loginViaEmail(page, spec.email, spec.password);
        await expect(page).toHaveURL(new RegExp(`/${LOCALE}/dashboard`));
      });

      await test.step('session reflects correct role', async () => {
        const session = await page.evaluate(async () => {
          const r = await fetch('/api/auth/session');
          return r.json();
        });
        expect(session?.user?.email).toBe(spec.email);
        expect(session?.user?.role).toBe(spec.role);
      });

      await test.step('session cookie present (httpOnly)', async () => {
        const cookies = await context.cookies();
        const session = cookies.find((c) => /next-auth\.session-token/.test(c.name));
        expect(session).toBeTruthy();
        expect(session?.httpOnly).toBe(true);
      });

      await test.step('sidebar nav matches role permissions', async () => {
        const sidebar = page.locator('aside, [role="navigation"]').first();
        for (const label of spec.expectedNavLabels) {
          await expect(sidebar.getByText(label, { exact: false }).first()).toBeVisible();
        }
        for (const label of spec.forbiddenNavLabels) {
          await expect(sidebar.getByText(label, { exact: true })).toHaveCount(0);
        }
      });

      await test.step('dashboard screenshot', async () => {
        await page.screenshot({
          path: join(SCREENSHOT_DIR, `${spec.role}-${LOCALE}.png`),
          fullPage: true,
        });
      });

      await test.step('refresh preserves session', async () => {
        await page.reload({ waitUntil: 'networkidle' });
        await expect(page).toHaveURL(new RegExp(`/${LOCALE}/dashboard`));
        const after = await page.evaluate(async () => (await fetch('/api/auth/session')).json());
        expect(after?.user?.role).toBe(spec.role);
      });

      await test.step('admin-only API gated correctly', async () => {
        const r = await page.request.get(`${BASE}/api/admin/users?limit=1`, {
          headers: { cookie: (await context.cookies())
            .map(c => `${c.name}=${c.value}`).join('; ') },
        });
        if (spec.role === 'admin') {
          expect(r.status()).toBe(200);
        } else {
          expect([401, 403]).toContain(r.status());
        }
      });

      await test.step('debug endpoints are gone', async () => {
        const a = await page.request.get(`${BASE}/api/debug-login`);
        const b = await page.request.get(`${BASE}/api/debug-reset-password?email=x&password=x`);
        expect(a.status()).toBe(410);
        expect(b.status()).toBe(410);
      });

      await test.step('logout clears session cookie', async () => {
        await page.request.post(`${BASE}/api/auth/signout`, {
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          form: { csrfToken: '', callbackUrl: `${BASE}/${LOCALE}/login` },
        });
        const cookies = await context.cookies();
        const sess = cookies.find((c) => /next-auth\.session-token/.test(c.name) && c.value);
        expect(sess).toBeFalsy();
      });

      await context.close();
    });
  }

  test('mobile viewport smoke: teacher login → /dashboard', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
    const page = await context.newPage();
    const spec = ROLES.find((r) => r.role === 'teacher')!;
    await loginViaEmail(page, spec.email, spec.password);
    await expect(page).toHaveURL(new RegExp(`/${LOCALE}/dashboard`));
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'teacher-mobile.png'),
      fullPage: true,
    });
    await context.close();
  });
});
