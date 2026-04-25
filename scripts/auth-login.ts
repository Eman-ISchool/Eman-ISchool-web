/**
 * Reference-site auth login attempt (codex §4.1).
 *
 * Requires env: FLAB_COUNTRY, FLAB_MOBILE, FLAB_PASSWORD (in .env.local, gitignored).
 * Writes DOM + network trace to audit/20-discovery/auth/login-attempt.log
 * On success: persists Playwright storageState to .auth/flab-storage.json (gitignored).
 *
 * Run: npx tsx scripts/auth-login.ts
 */
import { chromium, type Page } from '@playwright/test';
import * as fs from 'node:fs/promises';
import * as fssync from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const OUT = 'audit/20-discovery/auth';
const LOG = path.join(OUT, 'login-attempt.log');
const STORAGE = '.auth/flab-storage.json';
const UA =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const COUNTRY = process.env.FLAB_COUNTRY || 'Jordan';
const MOBILE = process.env.FLAB_MOBILE || '790320149';
const PASSWORD = process.env.FLAB_PASSWORD;

async function log(msg: string) {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    await fs.appendFile(LOG, line);
    // eslint-disable-next-line no-console
    console.log(line.trim());
}

async function captureDom(page: Page, label: string) {
    const html = await page.content();
    const file = path.join(OUT, `dom-${label}-${Date.now()}.html`);
    await fs.writeFile(file, html);
    await log(`  dom: ${file}`);
}

async function main() {
    await fs.mkdir(OUT, { recursive: true });
    await fs.mkdir('.auth', { recursive: true });

    if (!PASSWORD) {
        await log('BLOCKED: FLAB_PASSWORD not set in .env.local — aborting without reaching login page');
        process.exit(2);
    }

    const browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({ userAgent: UA, locale: 'ar', viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();

    page.on('request', (r) =>
        log(`REQ ${r.method()} ${r.url()}`)
    );
    page.on('response', (r) => log(`RES ${r.status()} ${r.url()}`));
    page.on('console', (m) => log(`CONSOLE ${m.type()} ${m.text()}`));

    try {
        await log(`NAV https://futurelab.school/ar/login (country=${COUNTRY}, mobile=${MOBILE.replace(/\d/g, '*')})`);
        await page.goto('https://futurelab.school/ar/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await captureDom(page, 'login-page');

        // Country selector (FutureLab uses shadcn-ish combobox with data-value attribute)
        try {
            await page.click('button[role="combobox"]', { timeout: 5000 });
            await page.waitForTimeout(500);
            await page.locator('[data-value="962"]').click({ timeout: 5000 });
            await log('country: +962 selected');
        } catch (e) {
            await log(`country selector not matched (${(e as Error).message}) — continuing`);
        }

        await page.fill('#phone', MOBILE);
        await page.fill('#password', PASSWORD);
        await log('credentials: typed (phone + password redacted)');

        await page.click('button[type="submit"]');
        await log('submit: clicked');

        // Wait for either dashboard nav OR an error banner OR OTP challenge
        const outcome = await Promise.race([
            page.waitForURL('**/dashboard**', { timeout: 15000 }).then(() => 'dashboard'),
            page.waitForSelector('[data-otp], input[autocomplete="one-time-code"]', { timeout: 15000 }).then(() => 'otp'),
            page.waitForSelector('[role=alert], .error, .text-destructive', { timeout: 15000 }).then(() => 'error'),
        ]).catch(() => 'timeout');

        await captureDom(page, `post-submit-${outcome}`);
        await log(`OUTCOME: ${outcome}`);

        if (outcome === 'dashboard') {
            await ctx.storageState({ path: STORAGE });
            await log(`storageState saved: ${STORAGE}`);
        }

        process.exit(outcome === 'dashboard' ? 0 : 3);
    } catch (e) {
        await log(`EXCEPTION: ${(e as Error).message}`);
        process.exit(4);
    } finally {
        await browser.close();
    }
}

main();
