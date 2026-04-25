/**
 * Public BFS crawler for futurelab.school (codex §3).
 *
 * Emits JSONL records per codex §3.4 to audit/20-discovery/public/discovered-routes.jsonl.
 * Resumable: reads/writes scripts/crawl-state.json (visited set + frontier).
 *
 * Hard limits (codex §3.2):
 *   - max depth: 8
 *   - total cap: 500 public URLs
 *   - throttle: 550 ms between navigations
 *   - same host only: futurelab.school
 *
 * Run: npx tsx scripts/crawl-public.ts
 * Time-box via env: CRAWL_BUDGET_MS (default 1_800_000 = 30 min)
 */
import { chromium, type Page, type BrowserContext, type Response } from '@playwright/test';
import * as fs from 'node:fs/promises';
import * as fssync from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

const HOST = 'futurelab.school';
const OUT = 'audit/20-discovery/public';
const SHOTS = path.join(OUT, 'screenshots');
const JSONL = path.join(OUT, 'discovered-routes.jsonl');
const STATE = 'scripts/crawl-state.json';
const UA =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const MAX_DEPTH = 8;
const MAX_TOTAL = 500;
const MAX_PER_FAMILY = 20;
const THROTTLE_MS = 550;
const BUDGET_MS = Number(process.env.CRAWL_BUDGET_MS || 1_800_000);

const SEEDS = [
    'https://futurelab.school/',
    'https://futurelab.school/ar',
    'https://futurelab.school/ar/login',
    'https://futurelab.school/ar/join',
    'https://futurelab.school/en',
    'https://futurelab.school/en/login',
    'https://futurelab.school/en/join',
];

type State = {
    visited: string[];
    frontier: Array<{ url: string; depth: number }>;
    familyCounts: Record<string, number>;
    startedAt: string;
    lastCheckpoint?: string;
};

function normalize(u: string): string | null {
    try {
        const url = new URL(u);
        if (url.host !== HOST) return null;
        // strip tracking params
        for (const p of [...url.searchParams.keys()]) {
            if (/^(utm_|fbclid$|gclid$|ref$)/i.test(p)) url.searchParams.delete(p);
        }
        url.hash = '';
        // canonical trailing slash: keep as-is for first segment, normalize duplicates
        url.pathname = url.pathname.replace(/\/+/g, '/');
        return url.toString();
    } catch {
        return null;
    }
}

function structuralHash(html: string): string {
    // crude: tag sequence only, ignore text/attrs
    const seq = html.replace(/<!--[\s\S]*?-->/g, '').match(/<\/?[a-z0-9-]+/gi) || [];
    return crypto.createHash('sha1').update(seq.join('|')).digest('hex').slice(0, 12);
}

async function readState(): Promise<State> {
    try {
        const raw = await fs.readFile(STATE, 'utf8');
        return JSON.parse(raw);
    } catch {
        const frontier = SEEDS.map((u) => ({ url: u, depth: 0 }));
        return { visited: [], frontier, familyCounts: {}, startedAt: new Date().toISOString() };
    }
}

async function writeState(s: State) {
    s.lastCheckpoint = new Date().toISOString();
    await fs.writeFile(STATE, JSON.stringify(s, null, 2));
}

async function visit(
    ctx: BrowserContext,
    url: string,
    depth: number,
    familyCounts: Record<string, number>
): Promise<{ record: object; newLinks: string[] } | null> {
    const page = await ctx.newPage();
    const network: Array<{ url: string; status: number; method: string }> = [];
    page.on('response', (r: Response) => {
        try {
            network.push({ url: r.url(), status: r.status(), method: r.request().method() });
        } catch {
            // ignore
        }
    });
    try {
        const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
        const status = resp?.status() ?? 0;
        const redirectChain: string[] = [];
        let cur = resp?.request();
        while (cur) {
            const prev = cur.redirectedFrom();
            if (!prev) break;
            redirectChain.unshift(prev.url());
            cur = prev;
        }
        const finalUrl = page.url();
        const html = await page.content();
        const sHash = structuralHash(html);
        const familyId = `tpl_${sHash}`;
        familyCounts[familyId] = (familyCounts[familyId] || 0) + 1;
        const skipDeepCapture = familyCounts[familyId] > MAX_PER_FAMILY;

        const doc = await page.evaluate(() => {
            const forms = Array.from(document.querySelectorAll<HTMLFormElement>('form')).map((f) => ({
                selector: f.id ? `form#${f.id}` : `form.${[...f.classList].join('.')}`,
                fields: Array.from(f.querySelectorAll('input,textarea,select')).map((el) => {
                    const e = el as HTMLInputElement;
                    return {
                        name: e.name || e.id || '',
                        type: e.type || e.tagName.toLowerCase(),
                        required: e.required,
                        dir: e.getAttribute('dir') || '',
                    };
                }),
            }));
            const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))
                .map((a) => a.href)
                .filter(Boolean);
            const ctas = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href].btn, a[href][role=button], main a[href]'))
                .slice(0, 30)
                .map((a) => ({ text: (a.textContent || '').trim().slice(0, 60), href: a.href }));
            const h1 = Array.from(document.querySelectorAll('h1')).map((e) => (e.textContent || '').trim());
            const sectionOrder = Array.from(document.querySelectorAll('main > *, body > section, body > header, body > footer')).map(
                (e) => (e as HTMLElement).tagName.toLowerCase()
            );
            const lang = document.documentElement.lang || '';
            const dir = document.documentElement.dir || '';
            const title = document.title || '';
            const description =
                document
                    .querySelector<HTMLMetaElement>('meta[name=description]')
                    ?.getAttribute('content') || '';
            const canonical =
                document.querySelector<HTMLLinkElement>('link[rel=canonical]')?.href || '';
            const hreflang: Record<string, string> = {};
            document
                .querySelectorAll<HTMLLinkElement>('link[rel=alternate][hreflang]')
                .forEach((l) => {
                    hreflang[l.getAttribute('hreflang') || ''] = l.href;
                });
            return { forms, links, ctas, h1, sectionOrder, lang, dir, title, description, canonical, hreflang };
        });

        // Screenshots per codex §10.1 — initial pass: desktop + mobile in detected locale
        const slug = url.replace(/https?:\/\/futurelab\.school\//, '').replace(/[/?&#]/g, '_').slice(0, 80) || 'root';
        const shots: Record<string, string> = {};
        if (!skipDeepCapture) {
            try {
                await page.setViewportSize({ width: 1440, height: 900 });
                const p1 = path.join(SHOTS, `${slug}-desktop.png`);
                await page.screenshot({ path: p1, fullPage: true });
                shots.desktop = p1;
                await page.setViewportSize({ width: 390, height: 844 });
                const p2 = path.join(SHOTS, `${slug}-mobile.png`);
                await page.screenshot({ path: p2, fullPage: true });
                shots.mobile = p2;
            } catch {
                // ignore screenshot failures
            }
        }

        const record = {
            url,
            normalizedUrl: normalize(finalUrl) || finalUrl,
            locale: doc.lang.split('-')[0],
            dir: doc.dir,
            status,
            redirectChain,
            title: doc.title,
            metaDescription: doc.description,
            canonical: doc.canonical,
            hreflang: doc.hreflang,
            template: 'unknown',
            templateFamilyId: familyId,
            h1: doc.h1,
            sectionOrder: doc.sectionOrder,
            formsDetected: doc.forms,
            ctas: doc.ctas,
            modalsOnLoad: [],
            interactiveRegions: [],
            emptyStateObserved: false,
            loadingStateObserved: false,
            errorStateObserved: false,
            screenshots: shots,
            networkRequests: network.filter((n) => n.url.includes('/api') || n.status >= 400).slice(0, 50),
            bundleHints: [],
            visitedAt: new Date().toISOString(),
            discoveryDepth: depth,
        };

        const newLinks = doc.links
            .map((l) => normalize(l))
            .filter((l): l is string => !!l);

        return { record, newLinks };
    } catch (e) {
        await fs.appendFile(
            path.join(OUT, 'errors.log'),
            `${new Date().toISOString()} ${url} ${(e as Error).message}\n`
        );
        return null;
    } finally {
        await page.close();
    }
}

async function main() {
    await fs.mkdir(SHOTS, { recursive: true });
    if (!fssync.existsSync(JSONL)) await fs.writeFile(JSONL, '');
    const state = await readState();
    const deadline = Date.now() + BUDGET_MS;

    const browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({ userAgent: UA, locale: 'ar', viewport: { width: 1440, height: 900 } });

    while (state.frontier.length > 0 && state.visited.length < MAX_TOTAL && Date.now() < deadline) {
        const next = state.frontier.shift();
        if (!next) break;
        const norm = normalize(next.url);
        if (!norm) continue;
        if (state.visited.includes(norm)) continue;
        if (next.depth > MAX_DEPTH) continue;
        state.visited.push(norm);

        // eslint-disable-next-line no-console
        console.log(`[crawl d${next.depth}] (${state.visited.length}/${MAX_TOTAL}) ${norm}`);
        const res = await visit(ctx, norm, next.depth, state.familyCounts);
        if (res) {
            await fs.appendFile(JSONL, JSON.stringify(res.record) + '\n');
            for (const link of res.newLinks) {
                if (!state.visited.includes(link) && !state.frontier.some((f) => f.url === link)) {
                    state.frontier.push({ url: link, depth: next.depth + 1 });
                }
            }
        }
        await writeState(state);
        await new Promise((r) => setTimeout(r, THROTTLE_MS));
    }

    await browser.close();
    // eslint-disable-next-line no-console
    console.log('[crawl] done — visited', state.visited.length);
}

main().catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
});
