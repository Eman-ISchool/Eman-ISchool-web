import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';
const OUT = '/tmp/verify-tabs';

async function main() {
    fs.mkdirSync(OUT, { recursive: true });

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ locale: 'ar' });
    page.setDefaultTimeout(25000);

    // Capture console errors
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(err.message));

    // ── Login ──────────────────────────────────────────────────────────────────
    console.log('→ Logging in…');
    await page.goto(`${BASE_URL}/ar/login/admin`);
    await page.locator('[data-testid="login-identifier-input"]').waitFor();
    await page.locator('[data-testid="login-identifier-input"]').fill('admin@eduverse.com');
    await page.locator('[data-testid="login-password-input"]').fill('password123');
    await page.locator('[data-testid="login-submit-button"]').click();
    await page.waitForTimeout(4000);
    console.log('  URL after login:', page.url());

    // ── Navigate to course ─────────────────────────────────────────────────────
    console.log('→ Opening course page…');
    await page.goto(`${BASE_URL}/ar/dashboard/courses/1`);
    await page.waitForLoadState('networkidle');
    const url = page.url();
    console.log('  Course URL:', url);

    if (url.includes('login')) {
        await page.screenshot({ path: `${OUT}/ERROR-auth.png`, fullPage: true });
        throw new Error('Auth failed — redirected to login');
    }

    // ── Tab helper ─────────────────────────────────────────────────────────────
    async function captureTab(label: string, file: string, first = false) {
        if (!first) {
            await page.locator(`[role="tab"]:has-text("${label}")`).first().click();
        }
        await page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 8000 }).catch(() => {});
        await page.waitForTimeout(700);
        await page.screenshot({ path: `${OUT}/${file}`, fullPage: true });
        console.log(`  ✓ ${label}`);
    }

    // ── Tabs ───────────────────────────────────────────────────────────────────
    console.log('→ Capturing tabs…');
    await captureTab('المعلومات',       '1-info.png',    true);
    await captureTab('الدروس',           '2-lessons.png');
    await captureTab('الواجبات',         '3-assignments.png');
    await captureTab('الامتحانات',       '4-exams.png');
    await captureTab('الحصص المباشرة',  '5-live.png');

    // ── Test modals ────────────────────────────────────────────────────────────
    console.log('→ Testing modals…');

    // Go back to lessons tab and click add
    await page.locator('[role="tab"]:has-text("الدروس")').first().click();
    await page.waitForTimeout(500);

    const addLesson = page.locator('button').filter({ hasText: /إضافة|جديد|درس/ }).first();
    if (await addLesson.isVisible()) {
        await addLesson.click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: `${OUT}/6-lesson-modal.png`, fullPage: true });
        console.log('  ✓ Lesson modal opened');

        // Close via Escape
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
    } else {
        console.log('  ⚠ Add lesson button not visible');
        await page.screenshot({ path: `${OUT}/6-lesson-no-button.png`, fullPage: true });
    }

    // ── Console errors report ──────────────────────────────────────────────────
    await browser.close();

    console.log('\n─── Done ─────────────────────────────────────────────────────');
    const files = fs.readdirSync(OUT).sort();
    files.forEach(f => console.log(`  ${OUT}/${f}`));

    if (errors.length) {
        console.log('\n⚠ Console/page errors detected:');
        errors.slice(0, 10).forEach(e => console.log(' ', e));
    } else {
        console.log('\n✓ No console errors');
    }
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
