import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const outAfter = path.join(process.cwd(), 'tests/perf-after.json');
const outReport = path.join(process.cwd(), 'tests/perf-report.json');
const baselinePath = path.join(process.cwd(), 'tests/perf-baseline.json');

async function login(page, email, password) {
  await page.goto(`${BASE_URL}/api/auth/csrf`, { waitUntil: 'networkidle' });
  return page.evaluate(async ({ base, email, password }) => {
    const csrfRes = await fetch(`${base}/api/auth/csrf`);
    const csrfJson = await csrfRes.json();

    const params = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);
    params.append('csrfToken', csrfJson.csrfToken);
    params.append('callbackUrl', `${base}/en/teacher/home`);
    params.append('json', 'true');

    await fetch(`${base}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      redirect: 'follow',
    });

    const sessionRes = await fetch(`${base}/api/auth/session`);
    const session = await sessionRes.json();
    return Boolean(session?.user?.email);
  }, { base: BASE_URL, email, password });
}

async function measureNavigation(page, label, url) {
  const start = Date.now();
  const response = await page.goto(url, { waitUntil: 'networkidle' });
  const elapsedMs = Date.now() - start;

  const nav = await page.evaluate(() => {
    const entry = performance.getEntriesByType('navigation')[0];
    if (!entry) return null;
    return {
      domContentLoaded: Math.round(entry.domContentLoadedEventEnd),
      loadEvent: Math.round(entry.loadEventEnd),
      responseStart: Math.round(entry.responseStart),
      transferSize: entry.transferSize || 0,
    };
  });

  return {
    label,
    url,
    status: response ? response.status() : null,
    elapsedMs,
    nav,
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];

  results.push(await measureNavigation(page, 'grades_anon_warm', `${BASE_URL}/en/teacher/grades`));

  const loginSuccess = await login(page, 'teacher@eduverse.com', 'password123');
  results.push({ label: 'teacher_login', success: loginSuccess });

  results.push(await measureNavigation(page, 'teacher_grades_warm', `${BASE_URL}/en/teacher/grades`));

  const gradeHref = await page.evaluate(() => {
    const anchor = document.querySelector('a[href*="/teacher/grades/"]');
    if (!anchor) return null;
    return anchor.getAttribute('href');
  });

  let gradeRef = null;
  if (gradeHref) {
    const parts = gradeHref.split('?')[0].split('/');
    gradeRef = parts[parts.length - 1] || null;
    results.push(await measureNavigation(page, 'teacher_grade_detail_warm', `${BASE_URL}${gradeHref}`));
  }

  if (gradeRef) {
    const endpointStats = await page.evaluate(async ({ base, ref }) => {
      const pN = (values, p) => {
        if (!values.length) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
        return sorted[idx];
      };

      const paths = [
        `/api/grades/${ref}`,
        `/api/grades/${ref}/courses?page=1&limit=20`,
        `/api/grades/${ref}/students?page=1&limit=20`,
        `/api/grades/${ref}/fees`,
        `/api/grades/${ref}/schedule`,
      ];

      const timings = [];
      for (const path of paths) {
        const samples = [];
        for (let i = 0; i < 5; i += 1) {
          const start = performance.now();
          await fetch(`${base}${path}`, { credentials: 'same-origin' });
          samples.push(Math.round(performance.now() - start));
        }
        samples.sort((a, b) => a - b);
        timings.push({
          path,
          samples,
          p50: pN(samples, 0.5),
          p95: pN(samples, 0.95),
        });
      }
      return { label: 'grade_endpoints_stats', timings };
    }, { base: BASE_URL, ref: gradeRef });
    results.push(endpointStats);
  }

  const after = {
    capturedAt: new Date().toISOString(),
    results,
  };

  fs.writeFileSync(outAfter, JSON.stringify(after, null, 2));

  let report = {
    generatedAt: new Date().toISOString(),
    note: 'baseline missing',
  };

  if (fs.existsSync(baselinePath)) {
    const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    const beforeResults = baseline.baseline || [];

    const findElapsed = (arr, label) => (arr.find((x) => x.label === label) || {}).elapsedMs;

    const pairs = [
      ['grades_anon', 'grades_anon_warm'],
      ['grades_after_login_attempt_2', 'teacher_grades_warm'],
      ['courses_after_login_attempt', 'teacher_grade_detail_warm'],
    ];

    const navigation = {};
    for (const [beforeLabel, afterLabel] of pairs) {
      const beforeMs = findElapsed(beforeResults, beforeLabel);
      const afterMs = findElapsed(after.results, afterLabel);
      if (typeof beforeMs === 'number' && typeof afterMs === 'number') {
        const deltaMs = beforeMs - afterMs;
        const improvementPct = beforeMs > 0 ? Number(((deltaMs / beforeMs) * 100).toFixed(1)) : 0;
        navigation[afterLabel] = {
          before_ms: beforeMs,
          after_ms: afterMs,
          delta_ms: deltaMs,
          improvement_pct: improvementPct,
        };
      }
    }

    report = {
      generatedAt: new Date().toISOString(),
      navigation,
      endpoint_p50_p95_after: (after.results.find((item) => item.label === 'grade_endpoints_stats') || {}).timings || [],
    };
  }

  fs.writeFileSync(outReport, JSON.stringify(report, null, 2));

  await context.close();
  await browser.close();

  console.log(`Wrote ${outAfter}`);
  console.log(`Wrote ${outReport}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
