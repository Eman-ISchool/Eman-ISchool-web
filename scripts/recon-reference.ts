/**
 * Recon probe against futurelab.school — public, unauthenticated.
 *
 * Captures: robots.txt, sitemap.xml, hreflang map, meta tags, response headers
 * for a fixed set of seed URLs. Throttle 500 ms/nav per codex §0.7.
 *
 * Run: npx playwright test scripts/recon-reference.ts --reporter=line
 * Or:  npx tsx scripts/recon-reference.ts
 *
 * Output tree: audit/10-recon/
 */
import { chromium, type Page } from '@playwright/test';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const OUT = 'audit/10-recon';
const UA =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const SEEDS = [
    'https://futurelab.school/robots.txt',
    'https://futurelab.school/sitemap.xml',
    'https://futurelab.school/sitemap_index.xml',
    'https://futurelab.school/',
    'https://futurelab.school/ar',
    'https://futurelab.school/ar/login',
    'https://futurelab.school/ar/join',
    'https://futurelab.school/en',
    'https://futurelab.school/en/login',
    'https://futurelab.school/en/join',
];

type HeaderRecord = {
    url: string;
    status: number | null;
    requestedAt: string;
    redirectedTo?: string;
    headers?: Record<string, string>;
    htmlLang?: string;
    htmlDir?: string;
    title?: string;
    metaDescription?: string;
    canonical?: string;
    hreflang?: Record<string, string>;
    og?: Record<string, string>;
    twitter?: Record<string, string>;
    error?: string;
};

async function inspectPage(page: Page, url: string): Promise<HeaderRecord> {
    const requestedAt = new Date().toISOString();
    try {
        const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        if (!resp) return { url, status: null, requestedAt, error: 'no response' };
        const status = resp.status();
        const headers = resp.headers();
        const finalUrl = page.url();
        if (!finalUrl.endsWith('.xml') && !finalUrl.endsWith('.txt') && status < 400) {
            const langDir = await page.evaluate(() => ({
                lang: document.documentElement.lang || '',
                dir: document.documentElement.dir || '',
            }));
            const title = await page.title();
            const meta = await page.evaluate(() => {
                const getMeta = (sel: string) =>
                    Array.from(document.querySelectorAll<HTMLMetaElement>(sel)).map((m) => ({
                        key: m.getAttribute('name') || m.getAttribute('property') || '',
                        val: m.getAttribute('content') || '',
                    }));
                const canonical =
                    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href || '';
                const hreflang: Record<string, string> = {};
                document
                    .querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]')
                    .forEach((l) => {
                        const h = l.getAttribute('hreflang') || '';
                        if (h) hreflang[h] = l.href;
                    });
                const description =
                    document
                        .querySelector<HTMLMetaElement>('meta[name="description"]')
                        ?.getAttribute('content') || '';
                const og: Record<string, string> = {};
                document
                    .querySelectorAll<HTMLMetaElement>('meta[property^="og:"]')
                    .forEach((m) => {
                        const k = m.getAttribute('property') || '';
                        const v = m.getAttribute('content') || '';
                        if (k) og[k] = v;
                    });
                const twitter: Record<string, string> = {};
                document
                    .querySelectorAll<HTMLMetaElement>('meta[name^="twitter:"]')
                    .forEach((m) => {
                        const k = m.getAttribute('name') || '';
                        const v = m.getAttribute('content') || '';
                        if (k) twitter[k] = v;
                    });
                return { description, canonical, hreflang, og, twitter };
            });
            return {
                url,
                status,
                requestedAt,
                redirectedTo: finalUrl !== url ? finalUrl : undefined,
                headers,
                htmlLang: langDir.lang,
                htmlDir: langDir.dir,
                title,
                metaDescription: meta.description,
                canonical: meta.canonical,
                hreflang: meta.hreflang,
                og: meta.og,
                twitter: meta.twitter,
            };
        }
        // XML/TXT fall-throughs: just save body
        const body = await resp.text();
        const slug = url.replace(/https?:\/\/futurelab\.school\//, '').replace(/[^a-z0-9._-]/gi, '_') || 'root';
        await fs.writeFile(path.join(OUT, `raw-${slug}`), body, 'utf8');
        return { url, status, requestedAt, headers };
    } catch (err) {
        return { url, status: null, requestedAt, error: (err as Error).message };
    }
}

async function main() {
    await fs.mkdir(OUT, { recursive: true });
    const browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({ userAgent: UA, locale: 'ar' });
    const page = await ctx.newPage();
    const records: HeaderRecord[] = [];
    for (const url of SEEDS) {
        // eslint-disable-next-line no-console
        console.log('[recon]', url);
        const rec = await inspectPage(page, url);
        records.push(rec);
        await page.waitForTimeout(550); // throttle
    }
    await browser.close();

    await fs.writeFile(path.join(OUT, 'seed-probe.json'), JSON.stringify(records, null, 2));

    // Derivatives
    const metaTags: Record<string, unknown> = {};
    const hreflangMap: Record<string, Record<string, string>> = {};
    const htmlLangDir: Record<string, { lang: string; dir: string }> = {};
    const responseHeaders: Record<string, Record<string, string>> = {};
    for (const r of records) {
        if (!r.status || r.status >= 400) continue;
        if (r.htmlLang || r.htmlDir) htmlLangDir[r.url] = { lang: r.htmlLang || '', dir: r.htmlDir || '' };
        if (r.hreflang && Object.keys(r.hreflang).length) hreflangMap[r.url] = r.hreflang;
        if (r.headers) responseHeaders[r.url] = r.headers;
        metaTags[r.url] = {
            title: r.title,
            description: r.metaDescription,
            canonical: r.canonical,
            og: r.og,
            twitter: r.twitter,
        };
    }
    await fs.writeFile(path.join(OUT, 'meta-tags.json'), JSON.stringify(metaTags, null, 2));
    await fs.writeFile(path.join(OUT, 'hreflang-map.json'), JSON.stringify(hreflangMap, null, 2));
    await fs.writeFile(path.join(OUT, 'html-lang-dir.json'), JSON.stringify(htmlLangDir, null, 2));
    await fs.writeFile(
        path.join(OUT, 'response-headers.json'),
        JSON.stringify(responseHeaders, null, 2)
    );

    const summary = records
        .map((r) => `- [${r.status ?? 'ERR'}] ${r.url}${r.redirectedTo ? ` → ${r.redirectedTo}` : ''}${r.error ? ` ❌ ${r.error}` : ''}`)
        .join('\n');
    await fs.writeFile(
        path.join(OUT, 'seed-probe-summary.md'),
        `# Seed probe summary — ${new Date().toISOString()}\n\n${summary}\n`
    );
    // eslint-disable-next-line no-console
    console.log('[recon] done — see audit/10-recon/');
}

main().catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
});
