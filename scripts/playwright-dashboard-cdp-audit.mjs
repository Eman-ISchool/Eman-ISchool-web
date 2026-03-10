import fs from 'fs';
import path from 'path';
import { chromium } from '../node_modules/playwright/index.mjs';

const OUT_DIR = path.join(process.cwd(), 'test-results', 'playwright-cdp-audit');
const LOCAL_BASE_URL = process.env.LOCAL_BASE_URL || 'http://127.0.0.1:3000';
const CDP_URL = process.env.CDP_URL || 'http://127.0.0.1:9222';

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function connectBrowser() {
  return chromium.connectOverCDP(CDP_URL, { timeout: 60000 });
}

async function loginReference(context) {
  const page = await context.newPage();
  await page.goto('https://futurelab.school/ar/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.locator('button[role="combobox"]').click();
  const jordanOption = page.locator('[data-value="962"]').first();
  if (await jordanOption.count()) {
    await jordanOption.click();
  }
  await page.locator('#phone').fill('790320149');
  await page.locator('#password').fill('12345678');
  await Promise.all([
    page.waitForURL('**/dashboard**', { timeout: 30000 }),
    page.locator('button[type="submit"]').click(),
  ]);
  await page.close();
}

async function captureRoute(context, baseLabel, route, expectations = []) {
  const page = await context.newPage();
  const errors = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error' && !text.includes('chrome-extension://')) {
      errors.push(text);
    }
  });
  page.on('pageerror', (error) => {
    pageErrors.push(String(error));
  });

  const destination = route.startsWith('http') ? route : `${LOCAL_BASE_URL}${route}`;
  await page.goto(destination, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (expectations.length) {
    try {
      await page.waitForFunction(
        (markers) => markers.every((marker) => document.body.innerText.includes(marker)),
        expectations,
        { timeout: 6000 },
      );
    } catch {
      await page.waitForTimeout(2500);
    }
  } else {
    await page.waitForTimeout(2500);
  }

  const content = await page.evaluate((markers) => {
    const bodyText = document.body.innerText;
    return {
      url: location.href,
      title: document.title,
      markers: markers.map((marker) => ({
        marker,
        found: bodyText.includes(marker),
      })),
    };
  }, expectations);

  const safeName = route
    .replace(/^https?:\/\//, '')
    .replace(/[/?#=&]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const dir = path.join(OUT_DIR, baseLabel);
  ensureDir(dir);
  await page.screenshot({ path: path.join(dir, `${safeName}.png`), fullPage: true });
  fs.writeFileSync(
    path.join(dir, `${safeName}.json`),
    JSON.stringify({ ...content, errors, pageErrors }, null, 2),
  );

  await page.close();

  return {
    route,
    ok:
      content.markers.every((marker) => marker.found) &&
      (baseLabel === 'reference' || (errors.length === 0 && pageErrors.length === 0)),
    ...content,
    errors,
    pageErrors,
  };
}

async function main() {
  ensureDir(OUT_DIR);
  const browser = await connectBrowser();
  const summary = {
    local: [],
    reference: [],
  };

  const localContext = await browser.newContext({ viewport: { width: 1440, height: 2200 }, locale: 'ar-AE' });
  const localRoutes = [
    ['/ar/dashboard', ['إجمالي الطلبات', 'تفصيل المصروفات', 'أداء المعلمين']],
    ['/ar/dashboard/applications', ['قائمة الطلبات', 'عرض التفاصيل']],
    ['/ar/dashboard/users', ['المستخدمون']],
    ['/ar/dashboard/system-settings', ['إعدادات النظام']],
    ['/ar/dashboard/admin/reports', ['التقارير والتحليلات']],
  ];

  for (const [route, markers] of localRoutes) {
    summary.local.push(await captureRoute(localContext, 'local', route, markers));
  }
  await localContext.close();

  const referenceContext = await browser.newContext({ viewport: { width: 1440, height: 2200 }, locale: 'ar-AE' });
  await loginReference(referenceContext);
  const referenceRoutes = [
    ['https://futurelab.school/ar/dashboard', ['الملف الشخصي']],
    ['https://futurelab.school/ar/dashboard/applications', ['الطلبات']],
    ['https://futurelab.school/ar/dashboard/users', ['المستخدمون']],
    ['https://futurelab.school/ar/dashboard/system-settings', ['الإعدادات']],
  ];

  for (const [route, markers] of referenceRoutes) {
    summary.reference.push(await captureRoute(referenceContext, 'reference', route, markers));
  }
  await referenceContext.close();
  await browser.close();

  fs.writeFileSync(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));

  const failed = [...summary.local, ...summary.reference].filter((entry) => !entry.ok);
  if (failed.length) {
    console.error(`Audit completed with ${failed.length} failed route(s).`);
    process.exitCode = 1;
    return;
  }

  console.log('Audit completed successfully.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
