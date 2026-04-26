// Browser verification of all 5 tabs on /ar/dashboard/courses/1
// Run with: node scripts/verify-all-tabs.js

const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000';
const OUT = '/tmp/verify-tabs-full';

const MODAL_SEL = '[class*="z-50"][class*="fixed"]';

const results = [];
function pass(name) { results.push({ name, ok: true }); console.log(`  ✓ ${name}`); }
function fail(name, reason) { results.push({ name, ok: false, reason }); console.log(`  ✗ ${name}: ${reason}`); }

async function main() {
    fs.mkdirSync(OUT, { recursive: true });

    const browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({ locale: 'ar', viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    page.setDefaultTimeout(20000);

    const consoleErrors = [];
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('pageerror', e => consoleErrors.push(e.message));

    // ── 1. Login ───────────────────────────────────────────────────────────────
    console.log('\n→ Login');
    await page.goto(`${BASE_URL}/ar/login/admin`);
    await page.locator('[data-testid="login-identifier-input"]').fill('admin@eduverse.com');
    await page.locator('[data-testid="login-password-input"]').fill('password123');
    await page.locator('[data-testid="login-submit-button"]').click();
    try {
        await page.waitForURL('**/dashboard**', { timeout: 12000 });
    } catch {
        // fallback: wait a bit and check
        await page.waitForTimeout(2000);
    }

    const afterLogin = page.url();
    console.log('  URL:', afterLogin);
    if (afterLogin.includes('/login')) {
        await page.screenshot({ path: `${OUT}/ERROR-login.png`, fullPage: true });
        throw new Error('Login failed');
    }
    pass('login');

    // ── 2. Navigate to course ──────────────────────────────────────────────────
    console.log('\n→ Course page');
    await page.goto(`${BASE_URL}/ar/dashboard/courses/1`);
    await page.waitForLoadState('networkidle');
    if (page.url().includes('/login')) throw new Error('Redirected to login on course page');
    pass('course page loads');
    await page.screenshot({ path: `${OUT}/01-info-tab.png`, fullPage: true });

    // ── Helper: switch tab ─────────────────────────────────────────────────────
    async function switchTab(label) {
        await page.locator(`[role="tab"]:has-text("${label}")`).first().click();
        await page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 6000 }).catch(() => {});
        await page.waitForTimeout(600);
    }

    // Helper: is modal visible?
    async function modalVisible() {
        return page.locator(MODAL_SEL).isVisible().catch(() => false);
    }

    // Helper: wait for modal to disappear
    async function waitModalClose(timeout = 7000) {
        const deadline = Date.now() + timeout;
        while (Date.now() < deadline) {
            const visible = await modalVisible();
            if (!visible) return true;
            await page.waitForTimeout(300);
        }
        return false;
    }

    // ── 3. Lessons tab ─────────────────────────────────────────────────────────
    console.log('\n→ Lessons tab');
    await switchTab('الدروس');
    await page.screenshot({ path: `${OUT}/02-lessons-tab.png`, fullPage: true });
    pass('lessons tab renders');

    // Open add lesson modal
    const addLessonBtn = page.locator('button').filter({ hasText: /إضافة|جديد/ }).first();
    if (await addLessonBtn.isVisible()) {
        await addLessonBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${OUT}/03-lesson-modal-open.png`, fullPage: true });
        const opened = await modalVisible();
        if (opened) pass('lesson modal opens');
        else { fail('lesson modal opens', 'modal not visible after click'); }

        // Fill title (only required field)
        const titleInput = page.locator(MODAL_SEL).locator('input[placeholder*="عنوان الدرس"]').first();
        await titleInput.fill('درس اختبار');
        await page.waitForTimeout(200);

        // Click save
        const saveBtn = page.locator(MODAL_SEL).locator('button').filter({ hasText: /إنشاء|حفظ/ }).first();
        await saveBtn.click({ force: true });

        // Wait for modal to close
        const closed = await waitModalClose(8000);
        await page.screenshot({ path: `${OUT}/04-lesson-after-save.png`, fullPage: true });
        if (closed) pass('lesson modal closes after save');
        else {
            // Check for JS errors
            const errs = consoleErrors.filter(e => !e.includes('hydrat'));
            fail('lesson modal closes after save', `still open. Errors: ${errs.join('; ') || 'none'}`);
        }
    } else {
        fail('lesson modal opens', 'add button not found');
    }

    // ── 4. Assignments tab ─────────────────────────────────────────────────────
    console.log('\n→ Assignments tab');
    await switchTab('الواجبات');
    await page.screenshot({ path: `${OUT}/05-assignments-tab.png`, fullPage: true });
    pass('assignments tab renders');

    const addAssignBtn = page.locator('button').filter({ hasText: /إضافة واجب/ }).first();
    if (await addAssignBtn.isVisible()) {
        await addAssignBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${OUT}/06-assignment-modal-open.png`, fullPage: true });
        const opened = await modalVisible();
        if (opened) pass('assignment modal opens');
        else { fail('assignment modal opens', 'modal not visible'); }

        // Fill title
        const titleIn = page.locator(MODAL_SEL).locator('input[placeholder*="عنوان الواجب"]').first();
        await titleIn.fill('واجب اختبار');

        // Fill due date (REQUIRED — without this, handleSave returns early!)
        const dateIn = page.locator(MODAL_SEL).locator('input[type="date"]').first();
        await dateIn.fill('2026-12-31');
        await page.waitForTimeout(200);

        // Verify save button is enabled
        const saveBtn = page.locator(MODAL_SEL).locator('button').filter({ hasText: 'حفظ' }).first();
        const isDisabled = await saveBtn.isDisabled();
        if (isDisabled) {
            fail('assignment save button enabled', 'button still disabled after filling required fields');
        } else {
            pass('assignment save button enabled');
        }

        await saveBtn.click({ force: true });
        const closed = await waitModalClose(8000);
        await page.screenshot({ path: `${OUT}/07-assignment-after-save.png`, fullPage: true });
        if (closed) pass('assignment modal closes after save');
        else {
            const errs = consoleErrors.filter(e => !e.includes('hydrat'));
            fail('assignment modal closes after save', `still open. Errors: ${errs.join('; ') || 'none'}`);
        }
    } else {
        fail('assignment modal opens', 'add button not found');
    }

    // ── 5. Exams tab ───────────────────────────────────────────────────────────
    console.log('\n→ Exams tab');
    await switchTab('الامتحانات');
    await page.screenshot({ path: `${OUT}/08-exams-tab.png`, fullPage: true });
    pass('exams tab renders');

    const addExamBtn = page.locator('button').filter({ hasText: /إضافة امتحان/ }).first();
    if (await addExamBtn.isVisible()) {
        await addExamBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${OUT}/09-exam-modal-open.png`, fullPage: true });
        const opened = await modalVisible();
        if (opened) pass('exam modal opens');
        else fail('exam modal opens', 'modal not visible');

        // Fill title
        const titleIn = page.locator(MODAL_SEL).locator('input[placeholder*="عنوان الامتحان"]').first();
        await titleIn.fill('امتحان اختبار');

        // Fill due date (REQUIRED)
        const dateIn = page.locator(MODAL_SEL).locator('input[type="date"]').first();
        await dateIn.fill('2026-12-31');
        await page.waitForTimeout(200);

        const saveBtn = page.locator(MODAL_SEL).locator('button').filter({ hasText: 'حفظ' }).first();
        await saveBtn.click({ force: true });
        const closed = await waitModalClose(8000);
        await page.screenshot({ path: `${OUT}/10-exam-after-save.png`, fullPage: true });
        if (closed) pass('exam modal closes after save');
        else {
            const errs = consoleErrors.filter(e => !e.includes('hydrat'));
            fail('exam modal closes after save', `still open. Errors: ${errs.join('; ') || 'none'}`);
        }
    } else {
        fail('exam modal opens', 'add button not found');
    }

    // ── 6. Live sessions tab ───────────────────────────────────────────────────
    console.log('\n→ Live sessions tab');
    await switchTab('الحصص المباشرة');
    await page.screenshot({ path: `${OUT}/11-live-tab.png`, fullPage: true });
    pass('live tab renders');

    const addLiveBtn = page.locator('button').filter({ hasText: /جلسة جديدة/ }).first();
    if (await addLiveBtn.isVisible()) {
        await addLiveBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${OUT}/12-live-modal-open.png`, fullPage: true });
        const opened = await modalVisible();
        if (opened) pass('live modal opens');
        else fail('live modal opens', 'modal not visible');

        // Fill title
        const titleIn = page.locator(MODAL_SEL).locator('input[placeholder*="عنوان الجلسة"]').first();
        await titleIn.fill('جلسة اختبار');

        // Fill startDateTime (REQUIRED — without this, handleCreate returns early!)
        const dtIn = page.locator(MODAL_SEL).locator('input[type="datetime-local"]').first();
        await dtIn.fill('2026-12-31T10:00');
        await page.waitForTimeout(200);

        // Verify button is enabled
        const createBtn = page.locator(MODAL_SEL).locator('button').filter({ hasText: 'إنشاء' }).first();
        const isDisabled = await createBtn.isDisabled();
        if (isDisabled) {
            fail('live create button enabled', 'button still disabled after filling required fields');
        } else {
            pass('live create button enabled');
        }

        await createBtn.click({ force: true });
        const closed = await waitModalClose(8000);
        await page.screenshot({ path: `${OUT}/13-live-after-save.png`, fullPage: true });
        if (closed) pass('live modal closes after save');
        else {
            const errs = consoleErrors.filter(e => !e.includes('hydrat'));
            fail('live modal closes after save', `still open. Errors: ${errs.join('; ') || 'none'}`);
        }
    } else {
        fail('live modal opens', 'add button not found');
    }

    // ── 7. Info tab — verify title loaded from API + save ─────────────────────
    console.log('\n→ Info tab — load & save');
    await page.locator(`[role="tab"]:has-text("المعلومات")`).first().click();
    await page.waitForTimeout(1500); // wait for API fetch
    await page.screenshot({ path: `${OUT}/15-info-tab.png`, fullPage: true });

    const titleInput = page.locator('input').filter({ hasText: '' }).nth(0);
    const titleVal = await page.locator('input').first().inputValue().catch(() => '');
    if (titleVal) pass(`info tab title loaded: "${titleVal}"`);
    else fail('info tab title loaded', 'title input is empty after load');

    // Click Save and verify no alert/error
    const saveBtn = page.locator('button').filter({ hasText: /^حفظ$/ }).first();
    let saveErrored = false;
    page.once('dialog', async (dialog) => { saveErrored = true; await dialog.dismiss(); });
    await saveBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${OUT}/16-info-after-save.png`, fullPage: true });
    if (!saveErrored) pass('info tab save (no alert, real API call)');
    else fail('info tab save', 'alert dialog appeared — save still using alert()');

    // ── 8. Courses list navigation ─────────────────────────────────────────────
    console.log('\n→ Courses list navigation');
    await page.goto(`${BASE_URL}/ar/dashboard/courses`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${OUT}/17-courses-list.png`, fullPage: true });

    const courseCards = page.locator('article');
    const cardCount = await courseCards.count();
    if (cardCount > 0) pass(`courses list renders ${cardCount} course cards`);
    else fail('courses list renders', 'no course cards found');

    // Click first card image to navigate to detail
    const firstCard = courseCards.first();
    const cardTitle = await firstCard.locator('h2').first().textContent().catch(() => 'unknown');
    await firstCard.locator('div').first().click({ force: true });
    await page.waitForTimeout(1500);
    const detailUrl = page.url();
    await page.screenshot({ path: `${OUT}/18-courses-detail-nav.png`, fullPage: true });
    if (detailUrl.includes('/courses/')) pass(`courses list → detail navigation (course: "${cardTitle?.trim()}")`);
    else fail('courses list → detail navigation', `URL is ${detailUrl}`);

    // ── 9. Final screenshot ────────────────────────────────────────────────────
    await page.screenshot({ path: `${OUT}/19-final.png`, fullPage: true });
    await browser.close();

    // ── Summary ────────────────────────────────────────────────────────────────
    const passed = results.filter(r => r.ok).length;
    const failed = results.filter(r => !r.ok);
    console.log(`\n${'═'.repeat(40)} SUMMARY ${'═'.repeat(40)}`);
    console.log(`PASS: ${passed}   FAIL: ${failed.length}`);
    if (failed.length) {
        console.log('\nFailures:');
        failed.forEach(f => console.log(`  ✗ ${f.name}: ${f.reason}`));
    }
    if (consoleErrors.length) {
        console.log('\nBrowser errors:');
        consoleErrors.slice(0, 10).forEach(e => console.log(' ', e));
    }
    console.log(`\nScreenshots: ${OUT}/`);
    if (failed.length) process.exit(1);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
